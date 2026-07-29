
const express = require("express");
const userRoutes = require("./routes/user");
const medicineRoutes = require("./routes/medicine");
const manufacturerRoutes = require("./routes/manufacturer");
const inventoryRoutes = require("./routes/inventory");
const app = express();
const bodyParser = require("body-parser");
const PORT = `8080`;
const reqAuth = require("./middleware/reqAuth");
const cors = require("cors");

const conn = require("./database");
 const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
   .split(",")
   .map((s) => s.trim())
   .filter(Boolean);
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "Content-type,Authorization");
//   next();
// });
app.use(cors({
   origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Used to get data in post data, all data is encoded in text using this parser module
app.use(bodyParser.json());

app.use("/user/",userRoutes);
app.use("/medicine/", reqAuth, medicineRoutes);
app.use("/inventory/", reqAuth, inventoryRoutes);
app.use("/manufacturer/", reqAuth, manufacturerRoutes);
// Consider adding proper error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Application Started at http://localhost:${PORT}/`);
});