const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 🔴 FIX: अगर यूजर डिलीट हो गया है तो req.user को null नहीं होने देना है
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401);
        throw new Error("User no longer exists in Database");
      }

      next();
    } catch (error) {
      console.error("Auth Error:", error.message);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token found");
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as an admin");
  }
};

module.exports = { protect, admin };
