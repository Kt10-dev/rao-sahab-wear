// src/components/Routes/UserProtectedRoute.js

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const UserProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // यदि लोडिंग हो रही है, तो आप यहां लोडर दिखा सकते हैं
  if (loading) {
    return <div>Loading...</div>;
  }

  // यदि प्रमाणित (authenticated) है, तो चाइल्ड राउट (Outlet) को रेंडर करें
  if (isAuthenticated) {
    return <Outlet />;
  }

  // अन्यथा, यूजर को लॉगिन पेज पर रीडायरेक्ट करें
  return <Navigate to="/login" replace />;
};

export default UserProtectedRoute;
