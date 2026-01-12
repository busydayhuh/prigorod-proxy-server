require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5050;

app.get("/", (req, res) => {
  res.send("Prigorod API on Vercel");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
