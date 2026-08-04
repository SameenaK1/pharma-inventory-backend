const express = require("express");
const inventory = require("../controllers/inventory");
const reqAuth = require("../middleware/reqAuth");

const router = express.Router();
router.use(reqAuth);

// POST endpoint for adding medicines
router.post("/add-inventory", inventory.addInventory);
router.get("/get-inventory", inventory.getInventory);
router.delete("/delete-inventory/:id", inventory.deleteInventory);
module.exports = router;
