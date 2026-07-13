const express = require("express");
const userRoutes = require("./routes/user");
const app = express();
const bodyParser = require("body-parser");

const PORT = `8080`;

const conn = require("./database");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-type,Authorization");
  next();
});

// Used to get data in post data, all data is encoded in text using this parser module
app.use(bodyParser.json());

app.use("/user/",userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Application Started at http://localhost:${PORT}/`);
});