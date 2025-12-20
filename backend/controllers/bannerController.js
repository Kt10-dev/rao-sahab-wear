// backend/controllers/bannerController.js
const asyncHandler = require("express-async-handler");
const Banner = require("../models/Banner");

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({}).sort({ createdAt: -1 });
  res.json(banners);
});

// @desc    Add a banner
// @route   POST /api/banners
// @access  Admin
const addBanner = asyncHandler(async (req, res) => {
  const { image, title, link } = req.body;

  if (!image) {
    res.status(400);
    throw new Error("Image is required");
  }

  const banner = await Banner.create({ image, title, link });
  res.status(201).json(banner);
});

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Admin
const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (banner) {
    await banner.deleteOne();
    res.json({ message: "Banner removed" });
  } else {
    res.status(404);
    throw new Error("Banner not found");
  }
});

module.exports = { getBanners, addBanner, deleteBanner };
