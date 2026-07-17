const express = require("express");
const medicine = require("../controllers/medicine");

const router = express.Router();

router.post("/add-medicine", medicine.addMedicine);

module.exports = router;
