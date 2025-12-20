// src/components/ProtectedAuthRoute.js

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // AuthContext का उपयोग करें

const ProtectedAuthRoute = ({ allowedRoles }) => {
  const { user } = useAuth(); // Logged in user details

  // 1. Check if user is logged in
  if (user) {
    // 2. User logged in है, तो उसे उसके रोल के अनुसार रीडायरेक्ट करें

    // Admin के लिए:
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    // Normal User के लिए:
    return <Navigate to="/profile" replace />;
  }

  // 3. User logged out है, तो Children Routes (e.g., /login, /register) को Render करें
  return <Outlet />;
};

export default ProtectedAuthRoute;
