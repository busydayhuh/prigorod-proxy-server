const fs = require("fs");
const path = require("path");

const stationsPath = path.join(__dirname, "../data/stations.json");

let stations = null;

function loadStations() {
  if (!stations) {
    const raw = fs.readFileSync(stationsPath, "utf-8");
    stations = JSON.parse(raw);
  }
  return stations;
}

function searchStations(q = "", limit = 15) {
  const data = loadStations();

  if (!q) {
    return data
      .filter((s) => s.settlement === "Москва")
      .sort(() => 0.5 - Math.random())
      .slice(0, limit);
  }

  const query = q.toLowerCase();

  return data
    .filter((s) => s.title.toLowerCase().includes(query))
    .slice(0, limit);
}

function checkForSuggestions(fromCode, toCode) {
  const data = loadStations();

  const from = data.find((s) => s.code === fromCode);
  const to = data.find((s) => s.code === toCode);

  if (!from || !to) return { suggestions: [] };

  const suggestions = data.filter(
    (station) =>
      station.direction === from.direction &&
      station.title.includes(to.settlement) &&
      station.station_type === "train_station",
  );

  return { suggestions, departed: [], future: [] };
}

module.exports = {
  searchStations,
  checkForSuggestions,
};
