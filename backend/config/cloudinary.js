// backend/config/cloudinary.js

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// 1. Cloudinary को कॉन्फ़िगर करें
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Multer Storage कॉन्फ़िगर करें
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "raosahab_products", // Cloudinary में यह फोल्डर बनेगा
    format: async (req, file) => "jpg", // JPG फॉर्मेट में सेव करें
    public_id: (req, file) => `product-${Date.now()}-${file.originalname}`,
  },
});

// 3. Multer Instance
const upload = multer({ storage: storage });

module.exports = upload;
