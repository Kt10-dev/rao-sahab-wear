// backend/controllers/productController.js

const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const Category = require("../models/Category"); // 🟢 Import Category Model
const mongoose = require("mongoose");

// --- Helper Functions ---

// 1. JSON Parse Helper (FormData fixes for colors/sizes)
const parseJSON = (data) => {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }
  return data;
};

// 2. Image Format Helper (String URL -> Schema Object)
const formatImages = (imagesData) => {
  if (!imagesData) return [];
  let imgArray = imagesData;
  if (typeof imagesData === "string") {
    imgArray = [imagesData];
  }
  return imgArray.map((img) => {
    if (typeof img === "object" && img.url) return img;
    return {
      url: img,
      public_id: "",
      isMain: false,
    };
  });
};

// 3. 🟢 Smart Category Resolver (Name -> ID)
const resolveCategoryId = async (input) => {
  if (!input) return null;
  // Agar pehle se valid ID hai
  if (mongoose.isValidObjectId(input)) {
    return input;
  }
  // Agar Name hai (e.g. "kurta"), to DB mein ID dhoondo
  const categoryObj = await Category.findOne({
    name: { $regex: input, $options: "i" },
  });
  return categoryObj ? categoryObj._id : null;
};

// --- Controllers ---

// @desc    Fetch all products with Search, Pagination & Category Filter
// @route   GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 50;
  const page = Number(req.query.pageNumber) || 1;

  // 1. Base Query (Search by Name)
  let query = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: "i" } }
    : {};

  // 2. 🟢 Category Filter Logic (Shop Page Fix)
  if (req.query.category) {
    const catId = await resolveCategoryId(req.query.category);
    if (catId) {
      query.category = catId; // ID mil gayi, filter lagao
    } else {
      // Agar category mili hi nahi (e.g. invalid name), to empty result dikhao
      query.category = null;
    }
  }

  const count = await Product.countDocuments(query);

  // 🟢 FIX: .populate() add kiya taaki Admin Panel mein Name dikhe, ID nahi
  const products = await Product.find(query)
    .populate("category", "name")
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error("Product not found (Invalid ID)");
  }

  // Yahan bhi populate kar diya taaki details page par category name dikhe
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name",
  );

  if (product) res.json(product);
  else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  let {
    name,
    price,
    description,
    category,
    countInStock,
    images,
    sizes,
    colors,
    sizeChart,
  } = req.body;

  // 🟢 Smart Category Check
  const categoryId = await resolveCategoryId(category);
  if (!categoryId) {
    res.status(400);
    throw new Error(
      `Invalid Category: '${category}'. Please select a valid category.`,
    );
  }

  sizes = parseJSON(sizes);
  colors = parseJSON(colors);
  const formattedImages = formatImages(images);

  const product = new Product({
    name,
    price,
    user: req.user._id,
    images: formattedImages,
    sizes: sizes || [],
    colors: colors || [],
    category: categoryId, // ✅ Use Resolved ID
    countInStock,
    description,
    rating: 0,
    numReviews: 0,
    sizeChart: sizeChart || "",
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  let {
    name,
    price,
    description,
    category,
    countInStock,
    images,
    sizes,
    colors,
    sizeChart,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;

    // 🟢 Smart Category Update
    if (category) {
      const categoryId = await resolveCategoryId(category);
      if (categoryId) product.category = categoryId;
    }

    product.countInStock =
      countInStock !== undefined ? countInStock : product.countInStock;

    if (images) product.images = formatImages(images);
    if (sizes) product.sizes = parseJSON(sizes);
    if (colors) product.colors = parseJSON(colors);
    if (sizeChart) product.sizeChart = sizeChart;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await product.deleteOne();
    res.json({ message: "Product removed" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment, image } = req.body;

  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error("Product not found (Invalid ID)");
  }

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString(),
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Product already reviewed");
    }

    const totalRating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) +
      Number(rating);
    const newNumReviews = product.reviews.length + 1;
    const newRating = totalRating / newNumReviews;

    const review = {
      _id: new mongoose.Types.ObjectId(),
      name: req.user.name,
      rating: Number(rating),
      comment: comment,
      image: image || "",
      user: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await Product.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      {
        $push: { reviews: review },
        $set: { rating: newRating, numReviews: newNumReviews },
      },
    );

    res.status(201).json({ message: "Review added successfully" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Get related products
// @route   GET /api/products/:id/related
const getRelatedProducts = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error("Product not found");
  }

  const product = await Product.findById(req.params.id);

  if (product) {
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4);

    res.json(related);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

const getAdminProducts = asyncHandler(async (req, res) => {
  // हम यहाँ .find({}) यूज़ करेंगे बिना किसी limit या skip के
  const products = await Product.find({})
    .populate("category", "name") // कैटेगरी का नाम दिखाने के लिए
    .sort({ createdAt: -1 }); // लेटेस्ट प्रॉडक्ट्स सबसे ऊपर

  if (products) {
    res.json(products);
  } else {
    res.status(404);
    throw new Error("No products found for Admin");
  }
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getRelatedProducts,
  getAdminProducts,
};
