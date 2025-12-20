// backend/routes/webhookRoutes.js

const express = require("express");
const router = express.Router();
const { handleShiprocketWebhook } = require("../controllers/webhookController");

// 🟢 FIX: यहाँ 'express.json()' बीच में add करें.
// ऐसा इसलिए कर रहे हैं क्यूंकि server.js में यह route global json parser से पहले load हो रहा है।
// अगर यह नहीं लगाओगे, तो Shiprocket का data नहीं मिलेगा।
router.post("/shiprocket", express.json(), handleShiprocketWebhook);

module.exports = router;
