// backend/routes/couponRoutes.js
const express = require("express");
const router = express.Router();
const {
  createCoupon,
  getCoupons,
  deleteCoupon,
  validateCoupon,
} = require("../controllers/couponController");
const { protect, admin } = require("../middleware/authMiddleware");

router
  .route("/")
  .post(protect, admin, createCoupon)
  .get(protect, admin, getCoupons);

router.delete("/:id", protect, admin, deleteCoupon);

// User Route (Validate)
router.post("/validate", protect, validateCoupon);

module.exports = router;
