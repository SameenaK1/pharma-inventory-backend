const jwt = require("jsonwebtoken");
const User = require("../models/user");


const reqAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization) {
      const authorization = req.headers.authorization;
      token = authorization.startsWith('Bearer ')
        ? authorization.split(' ')[1] 
        : authorization;
    } else if (req.cookies?.token) {
      // 2. Fallback to cookie (Primary for Browser sessions)
      token = req.cookies.token;
    }
    if (!token) {
      return res.status(401).json({ success: false, error: "Unauthorized: No session cookie provided" });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, error: "Unauthorized: Invalid or expired token" });
    }

    const userId = decoded?.id || decoded?.userId || decoded?._id;

    if (!userId) {
      console.warn("Auth Middleware Warning: JWT token missing user identification payload.", decoded);
      return res.status(401).json({ error: "Malformed token payload." });
    }

    let user = null;
    try {
      user = await User.findById(userId);
    } catch (dbErr) {
      console.error("Database error during user auth lookup:", dbErr.message);
      return res.status(500).json({ error: "Error verifying authentication credentials" });
    }

    if (!user) {
      return res.status(401).json({ error: "Access Denied. User record not found." });
    }

    req.user = user;
    return next();

  } catch (uncaughtErr) {
    console.error("Uncaught exception in reqAuth middleware:", uncaughtErr);
    return res.status(500).json({ error: "Internal authentication process error" });
  }
};

module.exports = reqAuth;
