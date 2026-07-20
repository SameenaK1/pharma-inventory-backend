const express = require("express");
const manufacturer = require("../controllers/manufacturer");

const router = express.Router();

// POST endpoint for adding medicines
const validate = require("validator");
router.get("/get-manufacturer", manufacturer.searchManufacturerNames);

module.exports = router;
