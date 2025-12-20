// backend/controllers/webhookController.js

const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");

// @desc    Handle Shiprocket Webhook Updates
// @route   POST /api/webhook/shiprocket
// @access  Public (Shiprocket will call this)
const handleShiprocketWebhook = asyncHandler(async (req, res) => {
  // 🟢 1. Security Check
  // अगर आपने .env में Token रखा है, तो उसे check करें
  const shiprocketToken = req.headers["x-api-key"];
  if (
    process.env.SHIPROCKET_WEBHOOK_TOKEN &&
    shiprocketToken !== process.env.SHIPROCKET_WEBHOOK_TOKEN
  ) {
    console.log("❌ Webhook Unauthorized access attempt");
    return res.status(401).send("Unauthorized");
  }

  // 🟢 2. Data Destructuring
  const { awb, current_status, order_id } = req.body;

  // Agar data khali hai to error na de, bas return kar de
  if (!awb && !order_id) {
    return res.status(400).send("Invalid Data");
  }

  console.log(
    "🔔 Webhook Received:",
    current_status,
    " | Order/AWB:",
    order_id || awb
  );

  // 🟢 3. Find Order via AWB or Shiprocket Order ID
  // Note: order_id yahan Shiprocket ka internal ID ho sakta hai
  const order = await Order.findOne({
    $or: [{ awbCode: awb }, { shiprocketOrderId: order_id }],
  });

  if (order) {
    // 🟢 4. Status Update Logic (Case Insensitive)
    const status = current_status ? current_status.toUpperCase() : "";

    if (status === "DELIVERED") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.orderStatus = "Delivered"; // Status bhi update karein

      // Agar COD tha aur deliver ho gaya, to Paid maan lo
      if (!order.isPaid && order.paymentMethod === "COD") {
        order.isPaid = true;
        order.paidAt = Date.now();
      }

      await order.save();
      console.log(`✅ Order ${order._id} marked as DELIVERED & PAID (if COD).`);
    } else if (status === "CANCELED") {
      order.orderStatus = "Cancelled";
      await order.save();
      console.log(`⚠️ Order ${order._id} marked as CANCELED.`);
    } else if (status === "RTO INITIATED" || status === "RTO DELIVERED") {
      // Optional: Handle Return cases
      order.orderStatus = "RTO";
      await order.save();
    }

    // Shiprocket ko success bhejo
    res.status(200).send("Webhook processed");
  } else {
    console.log("❌ Order not found for webhook data");
    // Shiprocket ko 200 hi bhejo taaki wo retry na kare agar order nahi mila
    res.status(200).send("Order not found, but webhook received");
  }
});

module.exports = { handleShiprocketWebhook };
