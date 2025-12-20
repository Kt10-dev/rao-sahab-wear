// src/context/CartContext.js

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";

const CartContext = createContext();
const API_BASE_URL = "https://raosahab-api.onrender.com";

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  // 1. Initialize State
  const [cartItems, setCartItems] = useState(() => {
    const localData = localStorage.getItem("cartItems");
    return localData ? JSON.parse(localData) : [];
  });

  // 🟢 2. SYNC: Fetch Cart from DB
  useEffect(() => {
    const syncCart = async () => {
      if (user && user.token) {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data: dbCart } = await axios.get(
            `${API_BASE_URL}/api/users/cart`,
            config
          );

          // Merge Logic: If DB empty but Local has items, push Local to DB
          if (dbCart.length === 0 && cartItems.length > 0) {
            // Transformation logic is needed here too, but handled in the next effect
            // Force trigger save by keeping local state
          } else if (dbCart.length > 0) {
            // Convert DB format back to Frontend format if needed,
            // but ideally Frontend should handle both.
            // DB: { image, product, ... } -> Frontend uses this fine now.
            setCartItems(dbCart);
          }
        } catch (error) {
          console.error("Error syncing cart:", error);
        }
      }
    };
    if (user) syncCart();
  }, [user]);

  // 🟢 3. SAVE: Update DB with Correct Format
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));

    const updateDbCart = async () => {
      if (user && user.token) {
        try {
          // 🟢 FIX: Data Transformation for Backend
          const backendCart = cartItems.map((item) => ({
            // Backend 'product' field requires ObjectId
            product: item._id || item.product,

            // Backend 'image' field requires string URL
            image:
              item.imageUrl || item.image || "https://via.placeholder.com/150",

            // Other fields
            name: item.name,
            price: item.price,
            color: item.color,
            size: item.size,
            qty: item.quantity,
            id: item.id, // Unique Cart ID
          }));

          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.put(
            `${API_BASE_URL}/api/users/cart`,
            { cart: backendCart },
            config
          );
        } catch (error) {
          console.error(
            "Failed to save cart to DB:",
            error.response?.data?.message
          );
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (user && cartItems.length > 0) updateDbCart();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cartItems, user]);

  // --- Operations ---

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) =>
          item.id !== itemId && item.product !== itemId && item._id !== itemId
      )
    );
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId || item.product === itemId || item._id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cartItems");
    // Optionally clear DB cart too
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.quantity, 0);

  const value = {
    cartItems,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
