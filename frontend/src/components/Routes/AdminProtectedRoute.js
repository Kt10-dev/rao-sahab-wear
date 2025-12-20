// src/components/Routes/AdminProtectedRoute.js

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminProtectedRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // यदि लोडिंग हो रही है
  if (loading) {
    return <div>Loading...</div>;
  }

  // यदि लॉग इन है और एडमिन है, तो चाइल्ड राउट को रेंडर करें
  if (isAuthenticated && isAdmin) {
    return <Outlet />;
  }

  // यदि लॉग इन नहीं है, तो लॉगिन पर भेजें
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // यदि लॉग इन है लेकिन एडमिन नहीं है, तो होमपेज पर भेजें या एक्सेस डिनाइड दिखाएँ
  return <Navigate to="/" replace />; // या "/access-denied"
};

export default AdminProtectedRoute;
