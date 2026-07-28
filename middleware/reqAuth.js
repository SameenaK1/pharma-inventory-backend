const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Pointing to your clean class model

const reqAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required!" });
  }

  // Extract token from "Bearer <token>"
  const token = authorization.split(" ")[1];

  try {
    // Decode token to extract user ID payload
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    
    // 🌟 FIXED FOR POSTGRESQL: Use the correct method name from your class
    const user = await User.findOneByID(id);

    if (!user) {
      return res.status(401).json({ error: "Access Denied. User record not found." });
    }

    // Attach user information to request scope for handlers downstream
    req.user = user; 
    next();
  } catch (error) {
    console.error("JWT Auth Middleware Error:", error);
    return res.status(401).json({ error: "Request is not verified!" });
  }
};

module.exports = reqAuth;