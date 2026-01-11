require("dotenv").config();
const fs = require("fs");
const path = require("path");
const needle = require("needle");

const { API_BASE_URL, API_KEY_NAME, API_KEY_VALUE } = process.env;

if (!API_BASE_URL || !API_KEY_VALUE) {
  console.error("Missing API env variables");
  process.exit(1);
}

const OUTPUT_PATH = path.join(__dirname, "../data/stations.json");

async function fetchStationsList() {
  const url = `${API_BASE_URL}/stations_list/?lang=ru_RU&format=json&${API_KEY_NAME}=${API_KEY_VALUE}`;

  console.log("⏳ Fetching stations list...");
  const res = await needle("get", url, { timeout: 20000 });

  if (res.statusCode !== 200) {
    throw new Error(`API error: ${res.statusCode}`);
  }

  let data;
  if (typeof res.body === "string") {
    data = JSON.parse(res.body);
  } else {
    data = res.body;
  }

  return data;
}

function filterRussianTrainStations(data) {
  const russia = data.countries?.find((c) => c.title === "Россия");

  if (!russia) {
    throw new Error("Russia not found in response");
  }

  const stations = [];

  for (const region of russia.regions ?? []) {
    for (const settlement of region.settlements ?? []) {
      for (const station of settlement.stations ?? []) {
        if (station.transport_type === "train") {
          stations.push({
            title: station.title,
            code: station.codes?.yandex_code,
            settlement: settlement.title ?? "",
            direction: station.direction ?? "",
            station_type: station.station_type,
          });
        }
      }
    }
  }

  return stations;
}

async function generate() {
  try {
    const rawData = await fetchStationsList();
    const stations = filterRussianTrainStations(rawData);

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(stations, null, 2), "utf-8");

    console.log(`stations.json generated`);
    console.log(`Total stations: ${stations.length}`);
    console.log(`Saved to: ${OUTPUT_PATH}`);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

generate();
