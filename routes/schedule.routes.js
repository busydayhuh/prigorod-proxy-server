const express = require("express");
const corsMiddleware = require("../middleware/cors");
const cache = require("apicache").middleware;
const {
  getSchedule,
  getDirections,
  getThread,
  getNearestStations,
} = require("../services/schedule.service");

const router = express.Router();

router.use(corsMiddleware);

// GET /api/schedule?from=...&to=...&date=...
router.get("/schedule", cache("2 minutes"), async (req, res) => {
  try {
    const query = req.query;
    const data = await getSchedule({
      ...query,
      transport_types: "suburban",
      limit: 1000,
    });

    res.status(200).json(data);
  } catch (err) {
    const status = typeof err.status === "number" ? err.status : 500;

    res.status(status).json({
      error: err.message || "Internal server error",
    });
  }
});

// GET /api/directions?from=...&to=...
router.get("/directions", cache("1 day"), async (req, res) => {
  try {
    const query = req.query;
    const data = await getDirections({
      ...query,
      transport_types: "suburban",
      limit: 1,
    });

    res.status(200).json(data);
  } catch (err) {
    const status = typeof err.status === "number" ? err.status : 500;

    res.status(status).json({
      error: err.message || "Internal server error",
    });
  }
});

// GET /api/thread?thread_id=...
router.get("/thread", cache("1 hour"), async (req, res) => {
  try {
    const query = req.query;
    const data = await getThread(query);

    res.status(200).json(data);
  } catch (err) {
    const status = typeof err.status === "number" ? err.status : 500;

    res.status(status).json({
      error: err.message || "Internal server error",
    });
  }
});

// GET /api/nearest_stations?lat=...&lng=...
router.get("/nearest_stations", cache("1 day"), async (req, res) => {
  try {
    const query = req.query;
    const data = await getNearestStations({
      ...query,
      station_types: ["station", "train_station", "platform"].join(","),
      distance: 10,
      limit: 6,
    });

    res.status(200).json(data);
  } catch (err) {
    const status = typeof err.status === "number" ? err.status : 500;

    res.status(status).json({
      error: err.message || "Internal server error",
    });
  }
});

module.exports = router;
