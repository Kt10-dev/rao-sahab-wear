// backend/models/Banner.js
const mongoose = require("mongoose");

const bannerSchema = mongoose.Schema(
  {
    image: { type: String, required: true }, // Image URL
    title: { type: String }, // Optional Title
    link: { type: String }, // Where to go on click (e.g., /shop)
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
