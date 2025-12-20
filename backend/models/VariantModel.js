const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    }, // Parent product se link

    // SKU: Stock Keeping Unit (Unique Code)
    sku: {
      type: String,
      required: true,
      unique: true,
    }, // e.g., NIKE-AIR-RED-42

    // Attributes: Flexible structure for Size, Color, Material etc.
    attributes: [
      {
        key: { type: String }, // e.g., "Color"
        value: { type: String }, // e.g., "Red"
      },
    ],

    price: {
      type: Number,
      required: true,
    }, // Selling Price

    mrp: {
      type: Number,
    }, // Crossed out price (MRP)

    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
    }, // Abhi kitne peace bache hain

    skuImage: {
      type: String,
    }, // Agar Red color select kiya toh Red photo dikhe
  },
  { timestamps: true }
);

module.exports = mongoose.model("Variant", variantSchema);
