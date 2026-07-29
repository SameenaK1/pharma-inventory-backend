const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const reqAuth = require("../middleware/reqAuth");

router.post("/register", userController.signUp);

// Route for User Login
router.post("/login", userController.logIn);
router.get("/profile", reqAuth, userController.getUserProfile);

module.exports = router;
