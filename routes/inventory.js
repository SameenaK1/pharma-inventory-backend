const express = require("express");
const inventory = require("../controllers/inventory");

const router = express.Router();

// POST endpoint for adding medicines
router.post("/add-inventory", inventory.addInventory);
router.get("/get-inventory", inventory.getInventory);
module.exports = router;
