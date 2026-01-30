// backend/routes/productRoutes.js

const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getRelatedProducts,
  getAdminProducts,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").get(getProducts).post(protect, admin, createProduct);
router.route("/:id/related").get(getRelatedProducts);
router.get("/admin", protect, admin, getAdminProducts);

// '/:id' route for getting a single product
router
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, updateProduct) // 🟢 Admin access required
  .delete(protect, admin, deleteProduct); // 🟢 Admin access required

router.route("/:id/reviews").post(protect, createProductReview);
module.exports = router;
