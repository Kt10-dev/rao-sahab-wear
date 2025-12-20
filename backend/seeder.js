// backend/seeder.js

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const users = require("./data/users"); // ⚠️ users.js फ़ाइल अभी हमने नहीं बनाई
const products = require("./data/products");
const User = require("./models/User");
const Product = require("./models/Product");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // Clear previous data
    await Product.deleteMany();
    await User.deleteMany();

    // 1. Create users
    // const createdUsers = await User.insertMany(users);

    // ⚠️ For simplicity, let's create a single admin user manually for seeding
    const adminUser = await User.create({
      name: "RaoSahab Admin",
      email: "admin@rao.com", // Use this to log in
      password: "admin123", // Password will be hashed by pre('save') hook
      role: "admin",
      isVerified: true,
    });

    const adminUserId = adminUser._id;

    // 2. Map products to the admin user
    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUserId };
    });

    // 3. Insert products
    await Product.insertMany(sampleProducts);

    console.log("Data Imported!");
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();

    console.log("Data Destroyed!");
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

// Command line argument handling
if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
