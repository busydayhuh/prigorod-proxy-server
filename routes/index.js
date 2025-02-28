const express = require("express");
const url = require("url");
const router = express.Router();
const needle = require("needle");
const cors = require("cors");

//Env vars
const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY_NAME = process.env.API_KEY_NAME;
const API_KEY_VALUE = process.env.API_KEY_VALUE;

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
        if (station.station_type === "train_station")
          stations.push({
            title: station.title,
            code: station.codes.yandex_code,
          });
      }
    }
  }

  return stations;
};

const divideResults = (segments) => {
  const departed = [];
  const future = [];

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
  const departed = [];
  const future = [];

  for (let segment of segments) {
    const departureTime = date
      ? new Date(segment.departure || segment.arrival)
      : segment.departure || segment.arrival;
    const now = new Date();

    if (!date) {
      const currentTime = `${now.getHours()}:${now.getMinutes()}`;

      if (departureTime > currentTime) {
        future.push(segment);
      } else {
        departed.push(segment);
      }
    } else {
      if (departureTime.getTime() > now) {
        future.push(segment);
      } else {
        departed.push(segment);
      }
    }
  }

  return { departed, future };
};

router.use(
  cors({
    origin: "*",
  })
);

router.get("/stations_list", async (req, res) => {
  try {
    const params = new URLSearchParams({
      [API_KEY_NAME]: API_KEY_VALUE,
    });

    const apiRes = await needle(
      "GET",
      `${API_BASE_URL}/stations_list/?lang=ru_RU&format=json&${params}`
    );

    const data = apiRes.body;
    const stations = filterStations(data);

    res.status(200).json(stations);
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
    const data = apiRes.body;
    const segments = data.segments;

    const dividedResults = divideResults(segments);

    res.status(200).json(dividedResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/schedule", async (req, res) => {
  try {
    const params = new URLSearchParams({
      [API_KEY_NAME]: API_KEY_VALUE,
      ...url.parse(req.url, true).query,
    });

    const apiRes = await needle(
      "GET",
      `${API_BASE_URL}/schedule/?lang=ru_RU&format=json&transport_types=suburban&${params}&limit=1000`
    );
    const data = apiRes.body;
    const dividedResults = divideSchedule(data.schedule, data.date);

    res.status(200).json({ ...data, schedule: dividedResults });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
