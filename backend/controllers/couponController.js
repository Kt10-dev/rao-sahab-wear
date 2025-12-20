// backend/controllers/couponController.js
const asyncHandler = require("express-async-handler");
const Coupon = require("../models/Coupon");

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Admin
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountPercentage, expiryDate } = req.body;

  const couponExists = await Coupon.findOne({ code });
  if (couponExists) {
    res.status(400);
    throw new Error("Coupon already exists");
  }

  const coupon = await Coupon.create({
    code,
    discountPercentage,
    expiryDate,
  });
  res.status(201).json(coupon);
});

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Admin
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json(coupons);
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (coupon) {
    await coupon.deleteOne();
    res.json({ message: "Coupon removed" });
  } else {
    res.status(404);
    throw new Error("Coupon not found");
  }
});

// @desc    Validate Coupon (For User Checkout)
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const coupon = await Coupon.findOne({ code });

  if (coupon && coupon.isActive) {
    // Check Expiry
    if (new Date() > new Date(coupon.expiryDate)) {
      res.status(400);
      throw new Error("Coupon has expired");
    }
    res.json({
      discountPercentage: coupon.discountPercentage,
      code: coupon.code,
    });
  } else {
    res.status(404);
    throw new Error("Invalid Coupon Code");
  }
});

module.exports = { createCoupon, getCoupons, deleteCoupon, validateCoupon };
