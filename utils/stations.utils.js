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

module.exports = {
  filterStations,
  searchStations,
};
