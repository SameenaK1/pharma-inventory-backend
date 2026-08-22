const express = require("express");
const billing = require("../controllers/billing");
const reqAuth = require("../middleware/reqAuth");

const router = express.Router();
router.use(reqAuth);
router.post("/invoice", billing.createInvoice);
router.get("/invoice/:invoiceNumber", billing.getInvoice);
router.get("/invoices", billing.listInvoices);

module.exports = router;
