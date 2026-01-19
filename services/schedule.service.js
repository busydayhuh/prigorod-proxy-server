const { request } = require("./yandex.service");
const { divideSchedule } = require("../utils/divide.utils");

async function getSchedule(query) {
  const data = await request("schedule", query);
  return {
    ...data,
    schedule: divideSchedule(data.schedule),
  };
}

async function getDirections(query) {
  const data = await request("schedule", query);
  return data.directions;
}

async function getThread(query) {
  const data = await request("thread", query);
  return data;
}

async function getNearestStations(query) {
  const data = await request("nearest_stations", query);
  return data.stations;
}

module.exports = {
  getSchedule,
  getDirections,
  getThread,
  getNearestStations,
};
