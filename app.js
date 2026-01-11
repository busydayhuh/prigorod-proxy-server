const express = require("express");
const rateLimit = require("express-rate-limit");
const corsMiddleware = require("./middleware/cors");

const apiRoutes = require("./routes");

const app = express();

app.set("trust proxy", 1);
app.use(
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
  })
);

app.use(corsMiddleware);

app.use("/api", apiRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
