const express = require("express");
const inventory = require("../controllers/inventory");
const reqAuth = require("../middleware/reqAuth");

const router = express.Router();
router.use(reqAuth);
// POST endpoint for adding medicines
router.post("/add-inventory", reqAuth, inventory.addInventory);
router.get("/get-inventory", reqAuth, inventory.getInventory);
router.get("/batch-numbers", reqAuth, inventory.getBatchNumbers);
router.delete("/delete-inventory/:id", reqAuth, inventory.deleteInventory);
module.exports = router;
