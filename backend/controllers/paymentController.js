// backend/controllers/paymentController.js

const Razorpay = require("razorpay");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");

const transporter = require("../config/email");

// Instance initialize karein
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay Order
// @route   POST /api/payment/create
// @access  Private
const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body; // Amount in Rupees

  const options = {
    amount: amount * 100, // Razorpay paise mein leta hai (100rs = 10000 paise)
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// @desc    Verify Payment Signature
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Database update logic yahan aayega (Order controller handle karega)
    res.json({ success: true, message: "Payment Verified" });
  } else {
    res.status(400);
    throw new Error("Invalid Signature");
  }
});

module.exports = { createPaymentOrder, verifyPayment };
