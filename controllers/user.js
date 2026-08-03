const bcrypt = require("bcrypt");
const validate = require("validator");
const User = require("../models/user");
const createToken = require("../token");
const { sendOtpEmail } = require("../utils/mailer");

const pendingUsers = new Map();
// 1. SIGN UP CONTROLLER
exports.signUp = async (req, res, next) => {
  // 🌟 Extracted role from incoming request body
  const { role = "pharmacist", username, fullname, email, password } = req.body;

  // Initial field validation including role
  if (!(username && fullname && email && password)) {
    console.error("Validation Error: All fields are mandatory");
    return res.status(200).json({ success: false, error: "All fields are mandatory" });
  }

  if (!validate.isEmail(email)) {
    console.error("Validation Error: Invalid Email");
    return res.status(200).json({ success: false, error: "Invalid Email format" });
  }

  if (!validate.isStrongPassword(password)) {
    console.error("Validation Error: Weak Password");
    return res.status(200).json({
      success: false,
      error: "Password must be at least 8 characters long and include uppercase, lowercase, numbers, and symbols."
    });
  }

  try {
    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // 🌟 Instantiated User model passing role as the first parameter
    const new_user = new User(role, fullname, username, email, hash);
    const savedUser = await new_user.create_user(); // Returns { id, username, email, role }

    // Issue JWT token using properties returned from database
    const token = createToken(savedUser.id, savedUser.username, savedUser.email);

    return res.status(200).json({ username: savedUser.username, token: token });

  } catch (err) {
    console.error("Signup Catch Block Error:", err);

    // Catch unique violations from Postgres (username or email duplicate)
    if (err.code === "23505") {
      return res.status(200).json({ success: false, error: "Username or Email already exists." });
    }
    return res.status(500).json({ error: "Internal server registration error" });
  }
};

exports.logIn = async (req, res, next) => {
  const { email, password } = req.body;

  if (!(email && password)) {
    console.error("Validation Error: Missing credentials");
    return res.status(200).json({ success: false, error: "All fields are mandatory" });
  }

  if (!validate.isEmail(email)) {
    return res.status(200).json({ success: false, error: "Invalid Email format" });
  }

  try {
    // Look up the user by email
    const user = await User.findOne(email);

    if (!user) {
      return res.status(200).json({ success: false, error: "No account with that email found" });
    }

    // Compare text input with password hash string from Postgres
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(200).json({ success: false, error: "Incorrect password" });
    }

    // Update database tracking metrics (non-blocking)
    await User.logged_in(email);

    // Generate the authentication token
    const token = createToken(user.id, user.username, email);

    // Return single unified JSON response payload to client
    return res.status(200).json({ username: user.username, token: token });

  } catch (err) {
    console.error("Login Catch Block Error:", err);
    return res.status(500).json({ error: "Internal server login error" });
  }
};

// 3. GET USER PROFILE CONTROLLER
exports.getUserProfile = async (req, res, next) => {
  try {
    // req.user is populated by your reqAuth middleware if the token is valid
    const userId = req.user.id;

    const userProfile = await User.findById(userId);

    if (!userProfile) {
      return res.status(404).json({ success: false, error: "User profile not found" });
    }

    return res.status(200).json({ success: true, data: userProfile });
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch user profile" });
  }
};
exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({ success: false, error: "Email already registered" });
    }

    // 2. Generate a secure 6-digit OTP string
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 🌟 Set to 10 minutes to match your mailer HTML description

    // 3. Store the temporary data in your pendingUsers Map
    pendingUsers.set(email, { otp, expiresAt });

    // 4. Trigger your custom separate mailer function
    // Pass the email and the generated otp directly
    await sendOtpEmail(email, otp);

    // 5. Success Response: Tells the frontend to stop the spinner and move to the OTP input stage
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully!"
    });

  } catch (err) {
    console.error("Backend OTP Error:", err);
    
    // 🌟 Safety Net: If nodemailer fails or network times out, this catches it,
    // tells the frontend to kill the spinner, and shows the exact error on screen.
    return res.status(200).json({
      success: false,
      error: "Failed to send verification email. Please check your network and try again."
    });
  }
};
// 2. Verify OTP Controller (Make sure it uses the same pendingUsers Map)
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const userData = pendingUsers.get(email);

  if (!userData) {
    return res.status(200).json({ success: false, error: "No OTP requested for this email" });
  }

  if (Date.now() > userData.expiresAt) {
    pendingUsers.delete(email);
    return res.status(200).json({ success: false, error: "OTP has expired" });
  }

  if (userData.otp !== otp) {
    return res.status(200).json({ success: false, error: "Invalid OTP code" });
  }

  // Mark as verified
  userData.verified = true;
  pendingUsers.set(email, userData);

  return res.status(200).json({ success: true, message: "Email verified successfully" });
};