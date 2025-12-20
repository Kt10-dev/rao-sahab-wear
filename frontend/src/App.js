// frontend/src/App.js

import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// Context Providers
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

// Route Guards
import UserProtectedRoute from "./components/Routes/UserProtectedRoute";
import AdminProtectedRoute from "./components/Routes/AdminProtectedRoute";

// Layouts & UI
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import SplashScreen from "./components/Splash/SplashScreen";

// Public Pages
import Homepage from "./pages/Homepage";
import Collections from "./pages/Collections";
import ProductsPage from "./pages/ProductsPage";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CheckoutPage from "./pages/CheckoutPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";
import About from "./components/About";
import StylistBot from "./components/AIStylist/StylistBot";

// User Dashboard
import UserLayout from "./pages/User/UserLayout";
import ProfileInfo from "./pages/User/ProfileInfo";
import MyOrders from "./pages/User/MyOrders";

import OrderScreen from "./pages/OrderScreen";

// Admin Dashboard
import AdminLayout from "./pages/Admin/AdminLayout";
import UserManager from "./pages/Admin/UserManager";
import DashboardHome from "./pages/Admin/DashboardHome";
import CouponManager from "./pages/Admin/CouponManager";
import ProductManager from "./pages/Admin/ProductManager";
import OrderManager from "./pages/Admin/OrderManager";
import CategoryManager from "./pages/Admin/CategoryManager";
import FAQ from "./pages/FAQ";
import Returns from "./pages/Returns";
import Shipping from "./pages/Shipping";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import BannerManager from "./pages/Admin/BannerManager";

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <>
      {!isAdminRoute && <Header />}

      <main style={{ minHeight: "80vh" }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/stylistbot" element={<StylistBot />} />
          <Route
            path="/reset-password/:resetToken"
            element={<ResetPasswordPage />}
          />
          <Route path="*" element={<NotFound />} />
          <Route path="/faq" element={<FAQ />} />

          {/* USER PROTECTED ROUTES */}
          <Route element={<UserProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order/:id" element={<OrderScreen />} />

            <Route path="/profile" element={<UserLayout />}>
              <Route index element={<ProfileInfo />} />
              <Route path="orders" element={<MyOrders />} />
              <Route path="addresses" element={<h1>Addresses Page</h1>} />
            </Route>
          </Route>

          {/* ADMIN PROTECTED ROUTES */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="products" element={<ProductManager />} />
              <Route path="coupons" element={<CouponManager />} />
              <Route path="categories" element={<CategoryManager />} />
              <Route path="orders" element={<OrderManager />} />
              <Route path="users" element={<UserManager />} />
              <Route path="banners" element={<BannerManager />} />
            </Route>
          </Route>
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
