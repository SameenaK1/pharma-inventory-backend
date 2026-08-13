const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const reqAuth = require("../middleware/reqAuth");

router.post("/send-otp", userController.sendOtp);
router.post("/verify-otp", userController.verifyOtp);
router.post("/register", userController.signUp);

// Route for User Login
router.post("/login", userController.logIn);
router.get("/profile", reqAuth, userController.getUserProfile);
router.post("/logout", reqAuth, userController.logOut);

module.exports = router;
