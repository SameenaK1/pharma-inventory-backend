const express = require("express");
const inventory = require("../controllers/inventory");

const router = express.Router();

// POST endpoint for adding medicines
router.post("/add-inventory", inventory.addInventory);
module.exports = router;
