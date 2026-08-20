const express = require("express");
const billing = require("../controllers/billing");

const router = express.Router();
router.get("/batch-numbers", billing.getBatchNumbers);

module.exports = router;
