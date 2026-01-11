const express = require("express");
const corsMiddleware = require("../middleware/cors");
const apicache = require("apicache");
const { getStationsService } = require("../services/stations.service");

const router = express.Router();
const cache = apicache.middleware;

router.use(corsMiddleware);

router.get("/stations_search", cache("5 minutes"), async (req, res) => {
  try {
    const q = (req.query.q || "").toLowerCase();
    const stations = await getStationsService();

    const filtered = q
      ? stations.filter((s) => s.title.toLowerCase().includes(q)).slice(0, 15)
      : stations
          .filter((s) => s.settlement === "Москва")
          .sort(() => 0.5 - Math.random())
          .slice(0, 15);

    res.json(filtered);
  } catch (err) {
    const status = typeof err.status === "number" ? err.status : 500;

    res.status(status).json({
      error: err.message || "Internal server error",
    });
  }
});

module.exports = router;
