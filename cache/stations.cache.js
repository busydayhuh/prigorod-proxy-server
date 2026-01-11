let cachedStations = null;
let lastUpdate = 0;

const TTL = 1000 * 60 * 60 * 24 * 7;

function isExpired() {
  return !cachedStations || Date.now() - lastUpdate > TTL;
}

function setStations(data) {
  cachedStations = data;
  lastUpdate = Date.now();
}

function getStations() {
  return cachedStations;
}

module.exports = {
  isExpired,
  setStations,
  getStations,
};
