// backend/models/Product.js
const mongoose = require("mongoose");

// 🟢 1. Review Schema (Embedded)
const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// 🟢 2. Product Schema
const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },

    description: {
      type: String,
      required: true,
    },

    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String },
        isMain: { type: Boolean, default: false },
      },
    ],

    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },

    variations: [
      {
        color: { type: String },
        size: { type: String },
        price: { type: Number },
        countInStock: { type: Number, default: 0 },
        sku: { type: String },
      },
    ],

    // 🟢 FIXED: Colors now accepts Objects (Name, Hex, Image)
    colors: [
      {
        name: { type: String },
        hex: { type: String },
        image: { type: String },
      },
    ],

    // Sizes typically remain strings (S, M, L, XL)
    sizes: [{ type: String }],

    reviews: [reviewSchema],

    rating: {
      type: Number,
      required: true,
      default: 0,
    },

    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },

    sizeChart: { type: String },
    isFeatured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// 🟢 Slug Generator Hook
productSchema.pre("save", async function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  }
  next(); // 👈 Call next() to proceed
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
