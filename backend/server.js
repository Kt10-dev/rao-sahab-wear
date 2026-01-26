// backend/server.js

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

// 🟢 1. Config: Load Env variables & Connect DB
dotenv.config();
connectDB();

const app = express();

// 🟢 2. Imports: Routes import करें
const paymentRoutes = require("./routes/paymentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const couponRoutes = require("./routes/couponRoutes");
const bannerRoutes = require("./routes/bannerRoutes");

// 🟢 3. Middleware & Routes Setup

app.use(cors()); // Allow cross-origin requests

// ⭐ CRITICAL FIX: Webhook Route को express.json() से पहले होना चाहिए
// (ताकि Raw Body मिल सके Payment verification के लिए)
app.use("/api/webhook", webhookRoutes);

// बाकी सब Routes के लिए JSON parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// 🟢 4. Regular Routes Mount
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/banners", bannerRoutes);
const dirname = path.resolve();
app.use("/uploads", express.static(path.join(dirname, "/uploads")));

// --- Simple Test Route ---
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
