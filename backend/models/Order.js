// backend/models/Order.js

const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        size: { type: String },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },

      // 🟢 FIX: Sab jagah se 'required: true' hata diya
      city: { type: String },
      state: { type: String },
      district: { type: String },

      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: "India" },
      mobile: { type: String, required: true },
      locationUrl: { type: String },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },

    // Pricing
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },

    // Payment
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },

    // Status
    orderStatus: {
      type: String,
      required: true,
      default: "Processing",
    },

    // Shipping
    isShipped: { type: Boolean, default: false },
    shippedAt: { type: Date },

    // Delivery
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },

    // Returns
    returnStatus: {
      type: String,
      enum: ["None", "Requested", "Approved", "Rejected"],
      default: "None",
    },
    returnReason: { type: String },
    returnImages: [{ type: String }],
    returnRequestedAt: { type: Date },
    isReturned: { type: Boolean, default: false },

    // Shiprocket
    shiprocketOrderId: { type: String },
    shipmentId: { type: String },
    awbCode: { type: String },
    courierName: { type: String },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
