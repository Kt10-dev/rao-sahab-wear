// backend/routes/uploadRoutes.js

const express = require("express");
const router = express.Router();
const multer = require("multer"); // 🟢 Import Multer
const { storage } = require("../config/cloudinary"); // 🟢 Import Storage (Not 'upload')
const { protect } = require("../middleware/authMiddleware");

// 🟢 Initialize Multer here
const upload = multer({ storage });

router.post("/", protect, upload.array("images"), (req, res) => {
  try {
    // 1. Check if files exist
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({ message: "No image uploaded" });
    }

    // 2. Map all files to get URLs
    const imageUrls = req.files.map((file) => file.path);

    // 3. Send Array of URLs back (Frontend expects an array)
    res.send(imageUrls);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Image upload failed" });
  }
});

module.exports = router;
