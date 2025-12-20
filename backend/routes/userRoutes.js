// backend/routes/userRoutes.js

const express = require("express");
const router = express.Router();
const {
  authUser,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  updateUserCart,
  getUserCart,
  addAddress,
  deleteAddress,
  getAddresses,
  getUsers, // 🟢 Make sure this is imported
  deleteUser, // 🟢 Make sure this is imported
  getUserById, // 🟢 Make sure this is imported
  updateUser,
} = require("../controllers/userController");

const { protect, admin } = require("../middleware/authMiddleware");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", authUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);
router.route("/cart").get(protect, getUserCart).put(protect, updateUserCart);
router.route("/address").post(protect, addAddress).get(protect, getAddresses);

router.route("/address/:id").delete(protect, deleteAddress);
router.route("/").get(protect, admin, getUsers);

router
  .route("/:id")
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);

module.exports = router;
