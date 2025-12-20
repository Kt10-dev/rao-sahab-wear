// backend/routes/paymentRoutes.js

const express = require("express");
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.route("/create").post(protect, createPaymentOrder);
router.route("/verify").post(protect, verifyPayment);

// Key ID bhejne ke liye route (Frontend ko chahiye hota hai)
router.get("/key", (req, res) => res.send(process.env.RAZORPAY_KEY_ID));

module.exports = router;
