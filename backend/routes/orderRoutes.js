// backend/routes/orderRoutes.js

const express = require("express");
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid, // 🟢 Added (Payment ke liye)
  updateOrderToDelivered, // 🟢 Renamed (Controller se match karne ke liye)
  getMyOrders,
  getOrders,
  getOrdersByUserId, // 🟢 Added (Admin View User Orders)
  calculateShipping,
  requestReturn,
  handleReturnRequest,
  handleShiprocketWebhook,
} = require("../controllers/orderController");

// Agar invoice controller alag hai toh ye theek hai,
// nahi toh ise comment kar dein agar error aaye.
const { generateInvoice } = require("../controllers/invoiceController");

const { protect, admin } = require("../middleware/authMiddleware");

// 1. Create Order & Get All Orders (Admin)
router.route("/").post(protect, addOrderItems).get(protect, admin, getOrders);

// 2. Shipping Calculation
router.post("/calc-shipping", protect, calculateShipping);

// 3. User Specific Orders (Logged in user)
router.route("/myorders").get(protect, getMyOrders);

// 4. Invoice Download
router.route("/:id/invoice").get(protect, generateInvoice);

// 🟢 5. Admin: Get Orders of Specific User
// (Ise /:id se pehle rakhna zaroori hai taaki 'user' ko ID na samjhe)
router.route("/user/:id").get(protect, admin, getOrdersByUserId);

// 6. Order By ID (Sabse last mein ID wala route)
router.route("/:id").get(protect, getOrderById);

// 7. Payment Status Update
router.route("/:id/pay").put(protect, updateOrderToPaid);

// 8. Delivery Status (Packed/Shipped/Delivered)
// Frontend '/status' call kar raha hai, isliye hum controller function wahi connect kar rahe hain
router.route("/:id/status").put(protect, admin, updateOrderToDelivered);

// 9. Return Routes
router.route("/:id/return").post(protect, requestReturn);
router.route("/:id/return-handle").put(protect, admin, handleReturnRequest);
router.post("/shiprocket-webhook", handleShiprocketWebhook);

module.exports = router;
