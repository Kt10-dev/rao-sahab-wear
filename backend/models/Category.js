const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    image: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// 🟢 FIX: 'next' हटा दिया और async function use किया (Modern Syntax)
categorySchema.pre("save", async function () {
  // Agar slug nahi hai aur name hai, to naya slug banao
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/ /g, "-") // Spaces ko hyphen (-) banaye
      .replace(/[^\w-]+/g, ""); // Special chars hataye
  }
  // Yahan 'next()' call karne ki zaroorat nahi hai
});

module.exports = mongoose.model("Category", categorySchema);
