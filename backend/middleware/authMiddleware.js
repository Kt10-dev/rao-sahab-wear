// backend/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// Check if user is logged in (authenticated)
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check for token in headers (usually Bearer Token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify token and get user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Attach user object (without password) to the request
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

// Check if the user is an Admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // Admin hai, aage badho
  } else {
    res.status(401);
    throw new Error("Not authorized as an admin");
  }
};

module.exports = { protect, admin };
