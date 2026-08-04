const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Pointing to your clean class model

/**
 * Helper to safely query the User model across different method naming conventions.
 */
const fetchUserById = async (id) => {
  if (!User) return null;

  // Try common method names defined on your User model/class
  if (typeof User.findOneByID === "function") return await User.findOneByID(id);
  if (typeof User.findById === "function") return await User.findById(id);
  if (typeof User.findOneById === "function") return await User.findOneById(id);
  if (typeof User.getById === "function") return await User.getById(id);

  // If User is an instantiated class instance or uses instance methods
  if (typeof User.getUserById === "function") return await User.getUserById(id);

  throw new Error("No valid user-lookup function (e.g. findById, findOneByID) found on User model.");
};

const reqAuth = async (req, res, next) => {
  try {
    // 1. Guard against missing JWT Secret key configuration
    if (!process.env.JWT_SECRET) {
      console.error("CRITICAL AUTH ERROR: JWT_SECRET environment variable is missing.");
      return res.status(500).json({ error: "Internal server configuration error" });
    }

    const { authorization } = req.headers;

    // 2. Validate presence of Authorization header
    if (!authorization || typeof authorization !== "string") {
      return res.status(401).json({ error: "Authorization token required!" });
    }

    // 3. Validate Bearer token format
    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token must be a Bearer token" });
    }

    const token = authorization.slice(7).trim(); // "Bearer ".length === 7
    if (!token) {
      return res.status(401).json({ error: "Authorization token required!" });
    }

    // 4. Verify JWT token signature and expiration
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

    // 5. Safely extract user ID (fallback to common JWT payload property names)
    const userId = decoded?.id || decoded?.userId || decoded?._id || decoded?.sub;

    if (!userId) {
      console.warn("Auth Middleware Warning: JWT token missing user identification payload.", decoded);
      return res.status(401).json({ error: "Malformed token payload." });
    }

    // 6. Fetch user record from database
    let user = null;
    try {
      user = await fetchUserById(userId);
    } catch (dbErr) {
      console.error("Database error during user auth lookup:", dbErr.message);
      return res.status(500).json({ error: "Error verifying authentication credentials" });
    }

    if (!user) {
      return res.status(401).json({ error: "Access Denied. User record not found." });
    }

    // 7. Attach authenticated user to request context and pass to next route handler
    req.user = user;
    return next();

  } catch (uncaughtErr) {
    // Top-level fallback guard so frontend errors or bugs never crash the server process
    console.error("Uncaught exception in reqAuth middleware:", uncaughtErr);
    return res.status(500).json({ error: "Internal authentication process error" });
  }
};

module.exports = reqAuth;