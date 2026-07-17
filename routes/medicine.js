const express = require("express");
const medicine = require("../controllers/medicine");

const router = express.Router();

// POST endpoint for adding medicines
router.post("/add-medicine", medicine.addMedicine);

// GET endpoint for searching medicines - using query parameter for search term
// This follows REST conventions where GET requests use query parameters
router.get("/medicine-name", medicine.searchMedicineNames);

module.exports = router;
