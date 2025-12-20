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

    // 🟢 SEO Slug (Auto-generated via Pre-save hook)
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
      // required: true, // ⚠️ Hata diya taaki Validation Error na aaye, hook isse bhar dega
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

    // 🟢 IMAGES Array of Objects
    // NOTE: Controller me ensure karein ki aap { url: "..." } format bhej rahe hain
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String },
        isMain: { type: Boolean, default: false },
      },
    ],

    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },

    // 🟢 Advanced Variations
    variations: [
      {
        color: { type: String },
        size: { type: String },
        price: { type: Number },
        countInStock: { type: Number, default: 0 },
        sku: { type: String },
      },
    ],

    // Simple Filters
    colors: [{ type: String }],
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

// 🟢🟢 MAGIC FIX: Slug Generator Hook 🟢🟢
// Ye code save hone se pehle chalega aur Name se Slug bana dega
productSchema.pre("save", async function () {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/ /g, "-") // Spaces ko - banaye
      .replace(/[^\w-]+/g, ""); // Special chars hataye
  }
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
