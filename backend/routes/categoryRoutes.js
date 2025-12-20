const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const Category = require("../models/Category");
const { protect, admin } = require("../middleware/authMiddleware");

// @route GET /api/categories
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const categories = await Category.find({});
    res.json(categories);
  })
);

// @route POST /api/categories (Admin)
router.post(
  "/",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { name } = req.body;
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      res.status(400);
      throw new Error("Category already exists");
    }
    const category = await Category.create({ name });
    res.status(201).json(category);
  })
);

// @route DELETE /api/categories/:id (Admin)
router.delete(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (category) {
      await category.deleteOne();
      res.json({ message: "Category removed" });
    } else {
      res.status(404);
      throw new Error("Category not found");
    }
  })
);

module.exports = router;
