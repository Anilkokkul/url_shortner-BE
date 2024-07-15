const express = require("express");
require("dotenv").config();
const app = express();
const { db } = require("./db/db.connect");
const userRoutes = require("./routes/auth.routes");
const urlRoutes = require("./routes/url.routes");
app.use(express.json());
app.use(userRoutes);
app.use(urlRoutes);
const port = process.env.PORT || 8000;
db();
app.get("/", (req, res) => {
  res.send(`<h1>Welcome to URL Shortner API</h1>`);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
