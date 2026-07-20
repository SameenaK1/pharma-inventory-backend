const express = require("express");
const manufacturer = require("../controllers/manufacturer");

const router = express.Router();
router.get("/search", manufacturer.searchManufacturerNames);

module.exports = router;
