const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const sendEmail = require("../config/email");
const sendWhatsAppMessage = require("../utils/whatsapp");
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

    // Populate User Info for Shiprocket, Email and WhatsApp
    const fullOrder = await Order.findById(createdOrder._id).populate(
      "user",
      "name email",
    );

    const frontendUrl =
      process.env.FRONTEND_URL || "https://raosahabji.netlify.app";

    // 1. 🚀 Push to Shiprocket Integration
    try {
      const shiprocketResponse = await createShiprocketOrder(fullOrder);
      if (shiprocketResponse && shiprocketResponse.order_id) {
        createdOrder.shiprocketOrderId = shiprocketResponse.order_id;
        createdOrder.shipmentId = shiprocketResponse.shipment_id;
        await createdOrder.save();
        console.log("✅ Order successfully pushed to Shiprocket!");
      }
    } catch (error) {
      console.log("❌ Shiprocket Integration Error:", error.message);
    }

    // 2. 📧 Brevo Confirmation Email
    if (fullOrder.user && fullOrder.user.email) {
      const emailOptions = {
        to: fullOrder.user.email,
        subject: `Order Confirmed! Order #${createdOrder._id}`,
        htmlContent: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 12px; max-width: 600px;">
                <h2 style="color: #0BC5EA;">राम-राम, ${fullOrder.user.name}! 🎉</h2>
                <p>We have received your order at <b>Rao Sahab Wear</b>.</p>
                <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px;">
                    <p><b>Order ID:</b> #${createdOrder._id}</p>
                    <p><b>Total Amount:</b> ₹${totalPrice}</p>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="${frontendUrl}/order/${createdOrder._id}" style="background: #0BC5EA; color: white; padding: 10px 25px; text-decoration: none; border-radius: 50px; font-weight: bold;">Track My Order</a>
                </div>
            </div>
        `,
      };

      try {
        await sendEmail(emailOptions);
        console.log("✅ Confirmation Email Sent!");
      } catch (err) {
        console.log("❌ Email Delivery Failed:", err.message);
      }
    }

    // 🟢 3. 📱 WhatsApp Confirmation (New Implementation)
    if (shippingAddress && shippingAddress.phone) {
      const whatsappBody = `राम-राम, ${fullOrder.user.name}! 🎉\n\nराव साहब Wear पर आपका आर्डर #${createdOrder._id} कन्फर्म हो गया है।\n\n💰 Total: ₹${totalPrice}\n🚚 Status: जल्द ही रवाना होगा!\n\nआप यहाँ ट्रैक कर सकते हैं: ${frontendUrl}/order/${createdOrder._id}\n\nधन्यवाद, राव साहब Wear परिवार।`;

      try {
        await sendWhatsAppMessage(shippingAddress.phone, whatsappBody);
        console.log("✅ Order Confirmation WhatsApp Sent!");
      } catch (wsErr) {
        console.log("❌ WhatsApp Notification Failed:", wsErr.message);
      }
    }

    res.status(201).json(createdOrder);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email",
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
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email",
  );

  if (order) {
    order.orderStatus = status;

    if (status === "Shipped") {
      order.isShipped = true;
      order.shippedAt = Date.now();
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
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(orders);
});

// @desc    Get all orders (Admin)
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "id name email")
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get all orders of a specific user (Admin)
const getOrdersByUserId = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.params.id }).sort({
    createdAt: -1,
  });
  res.json(orders);
});

// @desc    Calculate Shipping
const calculateShipping = asyncHandler(async (req, res) => {
  const { pincode, orderAmount } = req.body;
  const WAREHOUSE_PINCODE = "473226";

  const shippingCost = await getShippingRate(
    WAREHOUSE_PINCODE,
    pincode,
    0.5,
    false,
  );

  const taxRate = 0.18;
  const taxPrice = Math.round(orderAmount * taxRate);

  res.json({
    shippingPrice: shippingCost,
    taxPrice: taxPrice,
    grandTotal: orderAmount + shippingCost + taxPrice,
  });
});

// @desc    Request Return
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
const handleReturnRequest = asyncHandler(async (req, res) => {
  const { status } = req.body;
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

// @desc    Handle Shiprocket Webhook & WhatsApp Updates
const handleShiprocketWebhook = asyncHandler(async (req, res) => {
  const { current_status, order_id, awb } = req.body;
  const frontendUrl =
    process.env.FRONTEND_URL || "https://raosahabji.netlify.app";

  console.log(
    "🔔 Shiprocket Webhook Hit:",
    current_status,
    "for Order:",
    order_id,
  );

  const order = await Order.findOne({ shiprocketOrderId: order_id }).populate(
    "user",
    "name",
  );

  if (order) {
    let newStatus = order.orderStatus;
    const statusUpper = current_status.toUpperCase();

    if (
      ["PICKUP SCHEDULED", "MANIFESTED", "PICKUP QUEUED"].includes(statusUpper)
    ) {
      newStatus = "Packed";
    } else if (
      ["SHIPPED", "IN TRANSIT", "OUT FOR DELIVERY"].includes(statusUpper)
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

    if (newStatus !== order.orderStatus) {
      order.orderStatus = newStatus;
      if (awb) order.awbCode = awb;
      await order.save();
      console.log(`✅ Order ${order._id} auto-updated to: ${newStatus}`);

      // 🟢 📱 Send WhatsApp Status Update Alert
      if (order.shippingAddress && order.shippingAddress.phone) {
        const updateMsg = `नमस्ते राव साहब! 🙏\n\nखुशखबरी! आपके आर्डर #${order._id} का स्टेटस अब *${newStatus.toUpperCase()}* हो गया है। \n${awb ? `📦 Tracking ID: ${awb}` : ""}\n\nआप यहाँ ट्रैक कर सकते हैं: ${frontendUrl}/order/${order._id}\n\nजल्द ही आपके पास पहुँचेगा! 🚚`;

        try {
          await sendWhatsAppMessage(order.shippingAddress.phone, updateMsg);
          console.log("✅ WhatsApp Status Update Sent!");
        } catch (wsErr) {
          console.log("❌ WhatsApp Status Update Failed:", wsErr.message);
        }
      }
    }

    res.status(200).json({ message: "Webhook received" });
  } else {
    res.status(404).json({ message: "Order not found" });
  }
});

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  getOrdersByUserId,
  calculateShipping,
  requestReturn,
  handleReturnRequest,
  handleShiprocketWebhook,
};
