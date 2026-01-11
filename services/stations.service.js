const needle = require("needle");
const {
  isExpired,
  setStations,
  getStations,
} = require("../cache/stations.cache");
const { filterStations } = require("../utils/stations.utils");
const { API_BASE_URL, API_KEY_NAME, API_KEY_VALUE } = process.env;

async function fetchStationsFromYandex() {
  const url = `${API_BASE_URL}/stations_list/?lang=ru_RU&format=json&${API_KEY_NAME}=${API_KEY_VALUE}`;
  const res = await needle("get", url, { timeout: 20000 });

  if (res.statusCode !== 200) {
    throw new Error(`Yandex API error: ${res.statusCode}`);
  }

  return filterStations(res.body);
}

async function getStationsService() {
  if (!isExpired()) {
    return getStations();
  }

  const stations = await fetchStationsFromYandex();
  setStations(stations);
  return stations;
}

module.exports = {
  getStationsService,
};
