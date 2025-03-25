const express = require("express");
const url = require("url");
const router = express.Router();
const needle = require("needle");
const cors = require("cors");
const apicache = require("apicache");

//Env vars
const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY_NAME = process.env.API_KEY_NAME;
const API_KEY_VALUE = process.env.API_KEY_VALUE;
const PROXY_BASE_URL = process.env.PROXY_BASE_URL;

//Init cache
const cache = apicache.middleware;

//Filter stations for "stations" route
const filterStations = (data) => {
  const dataObj = JSON.parse(data);

  const rus = dataObj["countries"].find(
    (country) => country.title === "Россия"
  );

  const stations = [];

  for (let region of rus.regions) {
    for (let settlement of region.settlements) {
      for (let station of settlement.stations) {
        if (station.transport_type === "train")
          stations.push({
            title: station.title,
            code: station.codes.yandex_code,
            direction: station.direction || "",
            settlement: settlement.title || "",
            station_type: station.station_type,
          });
      }
    }
  }

  return stations;
};

const searchStations = (stations, q = "", limit = 15) => {
  const result = [];

  if (!q) {
    return stations
      .filter(({ settlement }) => settlement === "Москва")
      .sort(() => 0.5 - Math.random())
      .slice(0, limit);
  }

  for (let station of stations) {
    if (station.title.toLowerCase().includes(q)) {
      result.push(station);
    }
  }

  return result.slice(0, limit);
};

const divideResults = (segments, date) => {
  let departed = [];
  let future = [];

  if (!date) {
    future = [...segments];
    return { departed, future };
  }

  for (let segment of segments) {
    const departureTime = new Date(segment.departure);
    if (departureTime.getTime() > Date.now()) {
      future.push(segment);
    } else {
      departed.push(segment);
    }
  }

  return { departed, future };
};

const divideSchedule = (segments, date) => {
  let departed = [];
  let future = [];

  if (!date) {
    future = [...segments];
    return { departed, future };
  }

  for (let segment of segments) {
    const departureTime = date
      ? new Date(segment.departure || segment.arrival)
      : segment.departure || segment.arrival;
    const now = new Date();

    if (departureTime.getTime() > now) {
      future.push(segment);
    } else {
      departed.push(segment);
    }
  }

  return { departed, future };
};

const checkForSuggestions = async (fromCode, toCode) => {
  const proxyRes = await needle("GET", `${PROXY_BASE_URL}/stations_list`);
  const stations = proxyRes.body;

  const from = stations.find(({ code }) => code === fromCode);
  const to = stations.find(({ code }) => code === toCode);

  let suggestion = [];

  for (let station of stations) {
    if (
      station.direction == from.direction &&
      station.title.includes(to.settlement) &&
      station.station_type === "train_station"
    ) {
      suggestion.push(station);
    }
  }
  return { suggestions: suggestion };
};

// ROUTES

router.use(
  cors({
    origin: "*",
  })
);

router.get("/stations_list", cache("3 days"), async (req, res) => {
  try {
    const apiRes = await needle(
      "GET",
      `${API_BASE_URL}/stations_list/?lang=ru_RU&format=json&${API_KEY_NAME}=${API_KEY_VALUE}`
    );

    const data = apiRes.body;
    const stations = filterStations(data);

    res.status(200).json(stations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/stations_search", cache("5 minutes"), async (req, res) => {
  try {
    const params = new URLSearchParams({
      ...url.parse(req.url, true).query,
    });
    const proxyRes = await needle("GET", `${PROXY_BASE_URL}/stations_list`);

    const data = proxyRes.body;
    const searchResult = searchStations(data, params.get("q"));

    res.status(200).json(searchResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const params = new URLSearchParams({
      [API_KEY_NAME]: API_KEY_VALUE,
      ...url.parse(req.url, true).query,
    });

    const apiRes = await needle(
      "GET",
      `${API_BASE_URL}/search/?lang=ru_RU&format=json&limit=1000&${params}`
    );

    if (apiRes.statusCode !== 200) {
      const yandexError = new Error(
        `API request failed with status code ${apiRes.statusCode}`
      );
      yandexError.code = apiRes.statusCode;

      throw yandexError;
    }

    const data = apiRes.body;
    const segments = data.segments;

    if (segments.length === 0) {
      const resp = await checkForSuggestions(
        params.get("from"),
        params.get("to")
      );

      res.status(200).json(resp);
      return;
    }

    const dividedResults = divideResults(segments, params.get("date"));

    res.status(200).json(dividedResults);
  } catch (error) {
    const code = error.code || 500;
    res.status(code).json({ error: error.message });
  }
});

router.get("/schedule", cache("2 minutes"), async (req, res) => {
  try {
    const params = new URLSearchParams({
      [API_KEY_NAME]: API_KEY_VALUE,
      ...url.parse(req.url, true).query,
    });

    const apiRes = await needle(
      "GET",
      `${API_BASE_URL}/schedule/?lang=ru_RU&format=json&transport_types=suburban&${params}&limit=1000`
    );

    if (apiRes.statusCode !== 200) {
      const yandexError = new Error(
        `API request failed with status code ${apiRes.statusCode}`
      );
      yandexError.code = apiRes.statusCode;

      throw yandexError;
    }

    const data = apiRes.body;
    const dividedResults = divideSchedule(data.schedule, data.date);

    res.status(200).json({ ...data, schedule: dividedResults });
  } catch (error) {
    const code = error.code || 500;
    res.status(code).json({ error: error.message });
  }
});

router.get("/directions", cache("1 day"), async (req, res) => {
  try {
    const params = new URLSearchParams({
      [API_KEY_NAME]: API_KEY_VALUE,
      ...url.parse(req.url, true).query,
    });

    const apiRes = await needle(
      "GET",
      `${API_BASE_URL}/schedule/?lang=ru_RU&format=json&transport_types=suburban&${params}&limit=1`
    );

    if (apiRes.statusCode !== 200) {
      const yandexError = new Error(
        `API request failed with status code ${apiRes.statusCode}`
      );
      yandexError.code = apiRes.statusCode;

      throw yandexError;
    }

    const data = apiRes.body;

    res.status(200).json(data.directions);
  } catch (error) {
    const code = error.code || 500;
    res.status(code).json({ error: error.message });
  }
});

router.get("/thread", cache("1 hour"), async (req, res) => {
  try {
    const params = new URLSearchParams({
      [API_KEY_NAME]: API_KEY_VALUE,
      ...url.parse(req.url, true).query,
    });

    const apiRes = await needle(
      "GET",
      `${API_BASE_URL}/thread/?lang=ru_RU&format=json&${params}`
    );

    if (apiRes.statusCode !== 200) {
      const yandexError = new Error(
        `API request failed with status code ${apiRes.statusCode}`
      );
      yandexError.code = apiRes.statusCode;

      throw yandexError;
    }

    const data = apiRes.body;

    res.status(200).json(data);
  } catch (error) {
    const code = error.code || 500;
    res.status(code).json({ error: error.message });
  }
});

router.get("/nearest_stations", cache("1 day"), async (req, res) => {
  try {
    const params = new URLSearchParams({
      [API_KEY_NAME]: API_KEY_VALUE,
      ...url.parse(req.url, true).query,
    });

    const apiRes = await needle(
      "GET",
      `${API_BASE_URL}/nearest_stations/?lang=ru_RU&format=json&distance=50&station_types=station,train_station,platform&${params}&limit=6`
    );

    if (apiRes.statusCode !== 200) {
      const yandexError = new Error(
        `API request failed with status code ${apiRes.statusCode}`
      );
      yandexError.code = apiRes.statusCode;

      throw yandexError;
    }

    const data = apiRes.body;

    res.status(200).json(data.stations);
  } catch (error) {
    const code = error.code || 500;
    res.status(code).json({ error: error.message });
  }
});

module.exports = router;
