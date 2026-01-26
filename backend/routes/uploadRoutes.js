const express = require("express");
const router = express.Router();
const upload = require("../config/cloudinary"); // 🟢 सीधा 'upload' इम्पोर्ट करें
const { protect } = require("../middleware/authMiddleware");

// एंडपॉइंट वही रहेगा
router.post("/", protect, upload.array("images", 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({ message: "No image uploaded" });
    }

    // Cloudinary के केस में 'path' ही असली URL होता है
    const imageUrls = req.files.map((file) => file.path);

    res.send(imageUrls);
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).send({ message: "Image upload failed" });
  }
});

module.exports = router;
