// src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      try {
        return JSON.parse(userInfo);
      } catch (e) {
        // यदि parsing में कोई एरर हो, तो localStorage को साफ़ करें
        console.error("Error parsing user info from localStorage:", e);
        localStorage.removeItem("userInfo");
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("userInfo", JSON.stringify(user));
    } else {
      localStorage.removeItem("userInfo");
    }
  }, [user]);
  const [loading, setLoading] = useState(false);

  // जब यूजर लॉग इन करता है, तो आप इस फ़ंक्शन को कॉल करेंगे
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("userInfo", JSON.stringify(userData));
  };

  // लॉगआउट फंक्शन
  const logout = () => {
    setUser(null);
    localStorage.removeItem("userInfo");
  };

  // चेकिंग फंक्शन
  const isAuthenticated = !!user;
  const isAdmin = user && user.role === "admin";

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
