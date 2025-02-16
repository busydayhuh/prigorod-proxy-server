const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const PORT = 5000;
const app = express();

//Rate limiting
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 100,
});

app.use(limiter);
app.set("trust proxy", 1);

//Routes
app.use("/api", require("./routes"));

//Enable cors
app.use(
  cors({
    origin: "*",
  })
);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
