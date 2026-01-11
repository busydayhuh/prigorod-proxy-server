const express = require("express");
const stationsRoutes = require("./stations.routes");
const searchRoutes = require("./search.routes");
const scheduleRoutes = require("./schedule.routes");

const router = express.Router();

router.use(stationsRoutes);
router.use(searchRoutes);
router.use(scheduleRoutes);

module.exports = router;
