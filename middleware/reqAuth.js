const jwt = require("jsonwebtoken");
const User = require("../models/user"); 


const reqAuth = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("CRITICAL AUTH ERROR: JWT_SECRET environment variable is missing.");
      return res.status(500).json({ error: "Internal server configuration error" });
    }
    
    const { authorization } = req.headers;
    console.log("Authorization Header Received:", authorization);
    if (!authorization || typeof authorization !== "string") {
      return res.status(401).json({ error: "Authorization token required!" });
    }
    const token = authorization; 

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: "Token has expired. Please log in again." });
      }
      if (jwtErr instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: "Invalid token signature." });
      }
      return res.status(401).json({ error: "Token verification failed." });
    }

    const userId = decoded?.id;

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