const express = require("express");
const user = require("../controllers/medicine");

const router = express.Router();

router.post("/add-medicine", user.addmedicine);
router.post("/update-medicine", user.updatemedicine);
router.post("/get-medicine", user.getmedicine);

module.exports = router;    