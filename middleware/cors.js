const cors = require("cors");

// Настройка CORS для фронтенда на GitHub Pages
// Можно менять origin на свой домен или "*" для всех
const corsMiddleware = cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
});

module.exports = corsMiddleware;
