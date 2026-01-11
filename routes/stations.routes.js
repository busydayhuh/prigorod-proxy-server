const express = require("express");
const corsMiddleware = require("../middleware/cors");
const apicache = require("apicache");
const { searchStations } = require("../services/stations.service");

const router = express.Router();
const cache = apicache.middleware;

router.use(corsMiddleware);

router.get("/stations_search", cache("5 minutes"), async (req, res) => {
  try {
    const q = (req.query.q || "").toLowerCase();
    const result = await searchStations(q);

    res.status(200).json(result);
  } catch (err) {
    const status = typeof err.status === "number" ? err.status : 500;

    res.status(status).json({
      error: err.message || "Internal server error",
    });
  }
});

module.exports = router;
