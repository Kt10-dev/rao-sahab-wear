// backend/models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const addressSchema = mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true }, // House No/Street
  city: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: "India" },
  locationUrl: { type: String }, // GPS Link
});

const cartItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  color: { type: String }, // Selected Color
  size: { type: String }, // Selected Size
  qty: { type: Number, required: true, default: 1 },
  id: { type: String }, // Frontend unique ID
});

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: "user", // 'user' or 'admin'
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // OTP fields for verification
    otp: String,
    otpExpires: Date,
    cart: [cartItemSchema],
    addressList: [addressSchema],
  },
  {
    timestamps: true,
  }
);

// Middleware to encrypt password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  //   next();
});

// Method to match entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  // 1. Generate Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // 2. Hash token and set to resetPasswordToken field (Database mein hash save karenge)
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 3. Set expire (10 Minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken; // Original token return karenge email bhejne ke liye
};
const User = mongoose.model("User", userSchema);

module.exports = User;
