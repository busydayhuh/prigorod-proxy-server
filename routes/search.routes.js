const express = require("express");
const corsMiddleware = require("../middleware/cors");
const cache = require("apicache").middleware;
const { searchSegments } = require("../services/search.service");

const router = express.Router();

router.use(corsMiddleware);

// GET /api/search?from=...&to=...&date=...
router.get("/search", cache("2 minutes"), async (req, res) => {
  try {
    const query = req.query; // from, to, date, и т.д.
    const result = await searchSegments(query);

    res.status(200).json(result);
  } catch (err) {
    const status = typeof err.status === "number" ? err.status : 500;

    res.status(status).json({
      error: err.message || "Internal server error",
    });
  }
});

module.exports = router;
