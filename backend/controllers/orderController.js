// backend/controllers/orderController.js

const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const transporter = require("../config/email");
const {
  createShiprocketOrder,
  getShippingRate,
} = require("../utils/shiprocket");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid,
    paidAt,
    paymentResult,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  } else {
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: isPaid || false,
      paidAt: paidAt || null,
      paymentResult: paymentResult || {},
    });

    const createdOrder = await order.save();

    // Populate User Info for Shiprocket/Email
    const fullOrder = await Order.findById(createdOrder._id).populate(
      "user",
      "name email"
    );

    // 1. Push to Shiprocket
    try {
      const shiprocketResponse = await createShiprocketOrder(fullOrder);
      if (shiprocketResponse && shiprocketResponse.order_id) {
        createdOrder.shiprocketOrderId = shiprocketResponse.order_id;
        createdOrder.shipmentId = shiprocketResponse.shipment_id;
        await createdOrder.save();
        console.log("✅ Order pushed to Shiprocket!");
      }
    } catch (error) {
      console.log("❌ Shiprocket Error (Saved locally):", error.message);
    }

    // 2. Send Confirmation Email
    if (req.user.email) {
      const mailOptions = {
        from: process.env.EMAIL_SERVICE_USER,
        to: req.user.email,
        subject: `Order Confirmed! Order #${createdOrder._id}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #0BC5EA;">Thank You, ${req.user.name}! 🎉</h2>
                <p>We have received your order and it is being processed.</p>
                <h3 style="color: green;">Total: ₹${totalPrice}</h3>
                <p>Status: <strong>${
                  isPaid ? "Paid" : "Pending Payment (COD)"
                }</strong></p>
                <a href="http://localhost:3000/order/${
                  createdOrder._id
                }" style="background: #0BC5EA; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order</a>
            </div>
        `,
      };
      transporter.sendMail(mailOptions, (err) => {
        if (err) console.log("❌ Email Error:", err);
      });
    }

    // 🟢 Cart Empty karne ka logic frontend ya userController handle karega
    res.status(201).json(createdOrder);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Update Order Status (Packed, Shipped, Delivered)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (order) {
    order.orderStatus = status;

    if (status === "Shipped") {
      order.isShipped = true;
      order.shippedAt = Date.now();
      // Send Email logic here if needed
    }

    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      if (order.paymentMethod === "COD" && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(orders);
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "id name email")
    .sort({ createdAt: -1 });
  res.json(orders);
});

// 🟢 @desc    Get all orders of a specific user (Admin)
// @route   GET /api/orders/user/:id
// @access  Private/Admin
const getOrdersByUserId = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.params.id }).sort({
    createdAt: -1,
  });
  res.json(orders);
});

// @desc    Calculate Shipping
// @route   POST /api/orders/calc-shipping
// @access  Private
const calculateShipping = asyncHandler(async (req, res) => {
  const { pincode, orderAmount } = req.body;
  const WAREHOUSE_PINCODE = "473226"; // 🟢 Replace with your actual pincode

  // 1. Get Rate
  const shippingCost = await getShippingRate(
    WAREHOUSE_PINCODE,
    pincode,
    0.5,
    false
  );

  // 2. Calculate Tax
  const taxRate = 0.18;
  const taxPrice = Math.round(orderAmount * taxRate);

  res.json({
    shippingPrice: shippingCost,
    taxPrice: taxPrice,
    grandTotal: orderAmount + shippingCost + taxPrice,
  });
});

// @desc    Request Return
// @route   POST /api/orders/:id/return
// @access  Private
const requestReturn = asyncHandler(async (req, res) => {
  const { reason, images } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    if (!order.isDelivered) {
      res.status(400);
      throw new Error("Order must be delivered before returning.");
    }
    if (order.returnStatus !== "None") {
      res.status(400);
      throw new Error("Return request already active.");
    }

    order.returnStatus = "Requested";
    order.returnReason = reason;
    order.returnImages = images || [];
    order.returnRequestedAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Handle Return (Admin)
// @route   PUT /api/orders/:id/return-handle
// @access  Private/Admin
const handleReturnRequest = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'Approved' or 'Rejected'
  const order = await Order.findById(req.params.id);

  if (order) {
    order.returnStatus = status;
    if (status === "Approved") {
      order.isReturned = true;
    }
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

const handleShiprocketWebhook = asyncHandler(async (req, res) => {
  // Shiprocket sends data in req.body
  const { current_status, order_id, awb } = req.body;

  console.log(
    "🔔 Shiprocket Webhook Hit:",
    current_status,
    "for Order:",
    order_id
  );

  // 1. Find Order using Shiprocket Order ID
  // Note: Hamein 'shiprocketOrderId' se dhundna hoga jo humne Order create karte waqt save kiya tha
  const order = await Order.findOne({ shiprocketOrderId: order_id });

  if (order) {
    let newStatus = order.orderStatus;

    // 2. Map Shiprocket Status to Our App Status
    // Shiprocket ke status keywords: NEW, PICKUP SCHEDULED, SHIPPED, DELIVERED, CANCELED, RTO INITIATED

    const statusUpper = current_status.toUpperCase();

    if (
      statusUpper === "PICKUP SCHEDULED" ||
      statusUpper === "MANIFESTED" ||
      statusUpper === "PICKUP QUEUED"
    ) {
      newStatus = "Packed";
    } else if (
      statusUpper === "SHIPPED" ||
      statusUpper === "IN TRANSIT" ||
      statusUpper === "OUT FOR DELIVERY"
    ) {
      newStatus = "Shipped";
      order.isShipped = true;
      order.shippedAt = Date.now();
    } else if (statusUpper === "DELIVERED") {
      newStatus = "Delivered";
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      if (order.paymentMethod === "COD") {
        order.isPaid = true;
        order.paidAt = Date.now();
      }
    } else if (statusUpper === "CANCELED") {
      newStatus = "Cancelled";
    }

    // 3. Save Update
    if (newStatus !== order.orderStatus) {
      order.orderStatus = newStatus;

      // AWB Code bhi save kar lete hain agar pehle nahi tha
      if (awb) order.awbCode = awb;

      await order.save();
      console.log(
        `✅ Order ${order._id} automatically updated to: ${newStatus}`
      );
    }

    res.status(200).json({ message: "Webhook received" });
  } else {
    console.log("❌ Order not found for Shiprocket ID:", order_id);
    res.status(404).json({ message: "Order not found" });
  }
});
module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid, // 🟢 Fix: Added
  updateOrderToDelivered, // 🟢 Fix: Renamed from updateOrderStatus
  getMyOrders,
  getOrders,
  getOrdersByUserId, // 🟢 Fix: Added for User Details
  calculateShipping,
  requestReturn,
  handleReturnRequest,
  handleShiprocketWebhook, // 🟢 Added Webhook Handler
};
