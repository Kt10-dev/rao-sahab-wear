const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const sendEmail = require("../config/email");
const sendWhatsAppMessage = require("../utils/whatsapp");
const {
  createShiprocketOrder,
  getShippingRate,
} = require("../utils/shiprocket");

// -----------------------------------------------------------
// @desc    Create new order
// @route   POST /api/orders
// @access  Private
// -----------------------------------------------------------
const addOrderItems = asyncHandler(async (req, res) => {
  // 🛡️ Safety Check: Token validation
  if (!req.user) {
    res.status(401);
    throw new Error("User session expired, please login again.");
  }

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
    throw new Error("No order items found in cart.");
  } else {
    // 1. Create the order in MongoDB
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

    // 2. Populate User for Email/WhatsApp/Shiprocket
    const fullOrder = await Order.findById(createdOrder._id).populate(
      "user",
      "name email",
    );

    const frontendUrl =
      process.env.FRONTEND_URL || "https://raosahabji.netlify.app";

    // 3. 🚀 Orchestration Layer: Triggering External APIs

    // A. Push to Shiprocket
    try {
      const shiprocketResponse = await createShiprocketOrder(fullOrder);
      if (shiprocketResponse && shiprocketResponse.order_id) {
        createdOrder.shiprocketOrderId = shiprocketResponse.order_id;
        createdOrder.shipmentId = shiprocketResponse.shipment_id;
        await createdOrder.save();
        console.log("✅ Order pushed to Shiprocket!");
      }
    } catch (error) {
      console.log(
        "❌ Shiprocket Error (Skipped for stability):",
        error.message,
      );
    }

    // B. Brevo Email Confirmation
    if (fullOrder?.user?.email) {
      const emailOptions = {
        to: fullOrder.user.email,
        subject: `Order Confirmed! Rao Sahab Wear #${createdOrder._id}`,
        htmlContent: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 12px; max-width: 600px;">
                <h2 style="color: #0BC5EA;">राम-राम, ${fullOrder.user.name || "Customer"}! 🎉</h2>
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
      } catch (e) {
        console.log("Email Failed");
      }
    }

    // C. WhatsApp Confirmation
    if (shippingAddress?.phone) {
      const whatsappBody = `राम-राम, ${fullOrder?.user?.name || "Customer"}! 🎉\n\nराव साहब Wear पर आपका आर्डर #${createdOrder._id} कन्फर्म हो गया है।\n\n💰 Total: ₹${totalPrice}\n🚚 Status: जल्द ही रवाना होगा!\n\nधन्यवाद, राव साहब परिवार।`;
      try {
        await sendWhatsAppMessage(shippingAddress.phone, whatsappBody);
      } catch (wsErr) {
        console.log("WhatsApp Failed");
      }
    }

    res.status(201).json(createdOrder);
  }
});

// -----------------------------------------------------------
// @desc    Status/Details Functions
// -----------------------------------------------------------

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email",
  );
  if (order) res.json(order);
  else {
    res.status(404);
    throw new Error("Order not found");
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(orders);
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "id name email")
    .sort({ createdAt: -1 });
  res.json(orders);
});

const getOrdersByUserId = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.params.id }).sort({
    createdAt: -1,
  });
  res.json(orders);
});

// -----------------------------------------------------------
// @desc    Update Status Functions
// -----------------------------------------------------------

const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = req.body;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (order) {
    order.orderStatus = status;
    if (status === "Shipped") {
      order.isShipped = true;
      order.shippedAt = Date.now();
    }
    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      if (order.paymentMethod === "COD") {
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

// -----------------------------------------------------------
// @desc    Logistics & Returns
// -----------------------------------------------------------

const calculateShipping = asyncHandler(async (req, res) => {
  const { pincode, orderAmount } = req.body;
  const WAREHOUSE_PINCODE = "473226"; // Rao Sahab Hub
  try {
    const shippingCost = await getShippingRate(
      WAREHOUSE_PINCODE,
      pincode,
      0.5,
      false,
    );
    const taxPrice = Math.round(orderAmount * 0.18);
    res.json({
      shippingPrice: shippingCost,
      taxPrice: taxPrice,
      grandTotal: orderAmount + shippingCost + taxPrice,
    });
  } catch (err) {
    res.status(500);
    throw new Error("Shipping calc failed");
  }
});

const requestReturn = asyncHandler(async (req, res) => {
  const { reason, images } = req.body;
  const order = await Order.findById(req.params.id);
  if (order && order.isDelivered) {
    order.returnStatus = "Requested";
    order.returnReason = reason;
    order.returnImages = images || [];
    order.returnRequestedAt = Date.now();
    const updated = await order.save();
    res.json(updated);
  } else {
    res.status(400);
    throw new Error("Cannot return undelivered item.");
  }
});

const handleReturnRequest = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.returnStatus = req.body.status;
    if (req.body.status === "Approved") order.isReturned = true;
    const updated = await order.save();
    res.json(updated);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// -----------------------------------------------------------
// @desc    Webhooks (Automated Orchestration)
// -----------------------------------------------------------

const handleShiprocketWebhook = asyncHandler(async (req, res) => {
  const { current_status, order_id, awb } = req.body;
  const order = await Order.findOne({ shiprocketOrderId: order_id }).populate(
    "user",
    "name",
  );

  if (order) {
    const statusUpper = current_status?.toUpperCase() || "";
    let newStatus = order.orderStatus;

    if (["PICKUP SCHEDULED", "MANIFESTED"].includes(statusUpper))
      newStatus = "Packed";
    else if (["SHIPPED", "OUT FOR DELIVERY"].includes(statusUpper)) {
      newStatus = "Shipped";
      order.isShipped = true;
    } else if (statusUpper === "DELIVERED") {
      newStatus = "Delivered";
      order.isDelivered = true;
    }

    if (newStatus !== order.orderStatus) {
      order.orderStatus = newStatus;
      if (awb) order.awbCode = awb;
      await order.save();

      // Send automated WhatsApp update
      if (order.shippingAddress?.phone) {
        const msg = `नमस्ते राव साहब! 🙏\nआर्डर #${order._id} अब *${newStatus.toUpperCase()}* हो गया है।`;
        try {
          await sendWhatsAppMessage(order.shippingAddress.phone, msg);
        } catch (e) {}
      }
    }
    res.status(200).json({ message: "Success" });
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
