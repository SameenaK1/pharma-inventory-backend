const bcrypt = require("bcrypt");
const validate = require("validator");
const User = require("../models/user");
const createToken = require("../token");
const { sendOtpEmail } = require("../utils/mailer");
const crypto = require('crypto');

const pendingUsers = new Map();
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
    const user = await User.findOne(email);

    if (!user) {
      return res.status(200).json({ success: false, error: "No account with that email found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(200).json({ success: false, error: "Incorrect password" });
    }

    await User.logged_in(email);

    const token = createToken(user.id, user.username, email);
    const userData = { username: user.username, email: user.email, role: user.role };

    res.cookie('token', token, {
      httpOnly: true, // Prevents JavaScript (XSS attacks) from reading the cookie
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      sameSite: 'lax', // Protects against CSRF attacks ('strict' or 'lax')
      path: '/',
      maxAge: 14 * 60 * 60 * 1000, // Cookie expiration time (e.g., 1 day in milliseconds)
    });

    res.cookie('user', JSON.stringify(userData), {
      httpOnly: false, // Allows the frontend to read user details from the cookie when needed
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 14 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      user: userData
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ error: "Internal server login error" });
  }
};
exports.logOut = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};

// File: backend/controllers/user.js [BACKEND]

exports.getUserProfile = async (req, res) => {
  try {
    // 1. Get decoded user payload from req.user (attached by reqAuth middleware)
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Extract user ID (adjust property name based on what your JWT payload stores: id, userId, or _id)
    const userId = currentUser.id || currentUser.userId || currentUser._id;

    // 2. Query your database for the user profile
    const foundUser = await User.findById(userId); // Or User.findOne({ email: currentUser.email })

    if (!foundUser) {
      return res.status(404).json({ success: false, error: "User profile not found" });
    }

    // 3. Return the user profile data
    return res.status(200).json({
      success: true,
      data: {
        id: foundUser.id || foundUser._id,
        username: foundUser.username,
        email: foundUser.email,
        role: foundUser.role,
        first_name: foundUser.first_name || null,
        last_name: foundUser.last_name || null,
        phone_number: foundUser.phone_number || null,
        license_number: foundUser.license_number || null,
        status: foundUser.status || "active",
      },
    });

  } catch (err) {
    console.error("Profile Fetch Error:", err);
    return res.status(500).json({ success: false, error: "Server error fetching user profile" });
  }
};
exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email || typeof email !== 'string') {
      return res.status(200).json({
        success: false,
        error: "Email address is required."
      });
    }
    const sanitizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(200).json({
        success: false,
        error: "Please enter a valid email address."
      });
    }
    // 1. Check if user already exists
    const existingUser = await User.findOne(sanitizedEmail);
    if (existingUser) {
      return res.status(200).json({ success: false, error: "Email already registered" });
    }

    // 2. Generate a secure 6-digit OTP string
    const otp = require("crypto").randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 🌟 Set to 10 minutes to match your mailer HTML description
    const dataToHash = `${sanitizedEmail}.${otp}.${expiresAt}`;
    const hash = crypto
      .createHmac('sha256', process.env.OTP_SECRET || 'fallback_development_secret')
      .update(dataToHash)
      .digest('hex');

    // Combine hash and expiration to send to frontend
    const verificationToken = `${hash}.${expiresAt}`;

    // 5. Trigger Mailer
    await sendOtpEmail(sanitizedEmail, otp);

    // 6. Return token to frontend (it holds the state, not the server!)
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully!",
      token: verificationToken // 🌟 Frontend will store this in state
    });

  } catch (err) {
    console.error("Backend OTP Error:", err);
    return res.status(200).json({
      success: false,
      error: "Failed to process verification request. Please try again."
    });
  }
};
exports.verifyOtp = async (req, res) => {
  const { email, otp, token } = req.body;

  try {
    if (!token || typeof token !== 'string') {
      return res.status(200).json({
        success: false,
        error: "Verification session missing or expired. Please request a new code."
      });
    }

    if (!email || !otp) {
      return res.status(200).json({
        success: false,
        error: "Email and OTP code are required."
      });
    }

    const sanitizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!token.includes('.')) {
      return res.status(200).json({
        success: false,
        error: "Invalid token format."
      });
    }
    const [originalHash, expiresAt] = token.split('.');

    if (Date.now() > parseInt(expiresAt, 10)) {
      return res.status(200).json({
        success: false,
        error: "Code expired. Please request a new one."
      });
    }

    const dataToHash = `${sanitizedEmail}.${otp}.${expiresAt}`;
    const computedHash = crypto
      .createHmac('sha256', process.env.OTP_SECRET || 'fallback_development_secret')
      .update(dataToHash)
      .digest('hex');

    if (originalHash !== computedHash) {
      return res.status(200).json({
        success: false,
        error: "Incorrect verification code."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully."
    });

  } catch (err) {
    console.error("Backend Verification Error:", err);
    return res.status(200).json({
      success: false,
      error: "Verification failed due to a server error."
    });
  }
};
