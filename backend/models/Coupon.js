// backend/models/Coupon.js
const mongoose = require("mongoose");

const couponSchema = mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountPercentage: { type: Number, required: true }, // e.g., 20 for 20%
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
