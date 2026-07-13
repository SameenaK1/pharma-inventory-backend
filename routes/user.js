// routes/user.js
const express = require("express");
const user = require("../controllers/user");

const router = express.Router();

router.post("/sign-up", user.signUp);
router.post("/log-In", user.logIn);

module.exports = router;    