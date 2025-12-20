// backend/data/products.js

// ⚠️ Note: user field को आपको MongoDB में मौजूद किसी user/admin ID से बदलना होगा।

const products = [
  {
    name: "Royal Silk Kurta Set",
    imageUrl:
      "https://images.unsplash.com/photo-1596707328560-640165c7197b?q=80&w=1887&auto=format&fit=crop",
    description: "Premium handcrafted silk kurta set for festive wear.",
    category: "Kurta",
    price: 7999,
    countInStock: 10,
    rating: 4.8,
    numReviews: 12,
    user: "admin@rao.com", // Replace with a valid ObjectId
  },
  {
    name: "Classic Bandhgala Blazer",
    imageUrl:
      "https://images.unsplash.com/photo-1542272825-e51c140409a6?q=80&w=1887&auto=format&fit=crop",
    description: "Elegant bandhgala blazer perfect for formal events.",
    category: "Blazer",
    price: 9500,
    countInStock: 5,
    rating: 4.5,
    numReviews: 20,
    user: "admin@rao.com",
  },
  {
    name: "Printed Casual T-Shirt",
    imageUrl:
      "https://images.unsplash.com/photo-1577901764724-42b7858c44b3?q=80&w=1887&auto=format&fit=crop",
    description: "Soft cotton t-shirt with signature Rao Sahab print.",
    category: "T-Shirt",
    price: 899,
    countInStock: 30,
    rating: 4.2,
    numReviews: 50,
    user: "admin@rao.com",
  },
  {
    name: "Linen Summer Shirt",
    imageUrl:
      "https://images.unsplash.com/photo-1626090407185-3091af465a95?q=80&w=1887&auto=format&fit=crop",
    description: "Lightweight linen shirt for casual summer wear.",
    category: "Shirt",
    price: 1599,
    countInStock: 25,
    rating: 4.0,
    numReviews: 15,
    user: "admin@rao.com",
  },
];

module.exports = products;
