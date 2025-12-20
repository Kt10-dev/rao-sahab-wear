// src/pages/Homepage.js

import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Container,
  VStack,
  SimpleGrid,
  chakra,
  Spinner,
  useBreakpointValue,
} from "@chakra-ui/react";
import { FaShippingFast, FaUndoAlt, FaLock } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../components/ProductCard/ProductCard";
import SplashScreen from "../components/Splash/SplashScreen";
import axios from "axios";

// 🟢 NEW IMPORT: Dynamic Slider
import HeroSlider from "../components/Home/HeroSlider";

const MotionBox = motion(chakra.div);

const API_BASE_URL = "http://localhost:5000";

// ----------------- dummy featured (fallback) -----------------
const dummyProductBase = {
  rating: 4.6,
  numReviews: 35,
  stock: 20,
  isNew: true,
};

const featuredProducts = [
  {
    ...dummyProductBase,
    _id: "H1",
    name: "The Royal Bandhgala Set",
    price: 8999,
    imageUrl:
      "https://images.unsplash.com/photo-1577901764724-42b7858c44b3?q=80&w=1887&auto=format&fit=crop",
  },
  {
    ...dummyProductBase,
    _id: "H2",
    name: "Classic Linen Kurta",
    price: 2499,
    isNew: false,
    imageUrl:
      "https://images.unsplash.com/photo-1626090407185-3091af465a95?q=80&w=1887&auto=format&fit=crop",
  },
  {
    ...dummyProductBase,
    _id: "H3",
    name: "Signature Embroidered Sherwani",
    price: 15500,
    stock: 5,
    isNew: true,
    imageUrl:
      "https://images.unsplash.com/photo-1542272825-e51c140409a6?q=80&w=1887&auto=format&fit=crop",
  },
];

// ----------------- Animated variants -----------------
const containerVariant = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, when: "beforeChildren" },
  },
};
const cardVariant = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

// ----------------- Service Card -----------------
const ServiceCard = ({ icon, title, description }) => (
  <MotionBox
    variants={cardVariant}
    whileHover={{
      translateY: -6,
      boxShadow: "0 0 20px rgba(6,182,212,0.4), 0 0 40px rgba(124,58,237,0.3)",
    }}
    bg="rgba(255,255,255,0.12)"
    backdropFilter="blur(12px)"
    borderRadius="2xl"
    p={6}
    textAlign="center"
    border="1px solid rgba(255,255,255,0.15)"
  >
    <Box color="cyan.400" fontSize="2.5rem">
      {icon}
    </Box>
    <Heading
      size="md"
      mt={3}
      mb={2}
      bgGradient="linear(to-r, #0ff, #00f, #f0f)"
      bgClip="text"
      fontWeight="extrabold"
    >
      {title}
    </Heading>
    <Text color="rgba(1, 127, 182, 1)" fontSize="sm">
      {description}
    </Text>
  </MotionBox>
);

const Homepage = () => {
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return sessionStorage.getItem("seenSplash") ? false : true;
    } catch {
      return true;
    }
  });

  const handleAnimationComplete = () => {
    try {
      sessionStorage.setItem("seenSplash", "1");
    } catch {}
    setShowSplash(false);
  };

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // eslint-disable-next-line no-unused-vars
  const columns = useBreakpointValue({ base: 1, md: 3 });

  useEffect(() => {
    let mounted = true;
    const fetchLatest = async () => {
      try {
        setLoadingProducts(true);
        const res = await axios.get(`${API_BASE_URL}/api/products?limit=9`);
        if (!mounted) return;
        setProducts(
          Array.isArray(res.data.products) && res.data.products.length // Corrected check for paginated response
            ? res.data.products
            : Array.isArray(res.data) && res.data.length
            ? res.data
            : featuredProducts
        );
      } catch {
        setProducts(featuredProducts);
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    };
    fetchLatest();
    return () => (mounted = false);
  }, []);

  if (showSplash)
    return <SplashScreen onAnimationComplete={handleAnimationComplete} />;

  return (
    <Box
      bgGradient="linear(to-b, rgba(8,12,20,0.03), rgba(8,12,20,0.00))"
      minH="100vh"
    >
      {/* 🟢 HERO SECTION REPLACED WITH DYNAMIC SLIDER */}
      <HeroSlider />

      <Container maxW="1200px" py={10}>
        {/* Featured Section */}
        <VStack spacing={2} mb={6}>
          <Text
            bgGradient="linear(to-r, #0ff,#00f,#f0f)"
            bgClip="text"
            fontWeight="bold"
          >
            EXCLUSIVE SELECTION
          </Text>
          <Heading
            size="lg"
            bgGradient="linear(to-r, #0ff,#00f,#f0f)"
            bgClip="text"
          >
            Best Sellers
          </Heading>
        </VStack>

        <AnimatePresence mode="wait">
          <MotionBox
            initial="hidden"
            animate="show"
            variants={containerVariant}
            mb={8}
          >
            {loadingProducts ? (
              <Box display="flex" justifyContent="center" py={16}>
                <Spinner size="xl" color="cyan.400" />
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                {products.slice(0, 3).map((p, idx) => (
                  <MotionBox key={p._id || p.id || idx} variants={cardVariant}>
                    <ProductCard product={p} />
                  </MotionBox>
                ))}
              </SimpleGrid>
            )}
          </MotionBox>
        </AnimatePresence>
      </Container>

      {/* Services */}
      <Container maxW="1200px" py={10}>
        <VStack spacing={2} mb={6}>
          <Text
            bgGradient="linear(to-r, #0ff,#00f,#f0f)"
            bgClip="text"
            fontWeight="bold"
          >
            WHY SHOP WITH US?
          </Text>
          <Heading
            size="lg"
            bgGradient="linear(to-r, #0ff,#00f,#f0f)"
            bgClip="text"
          >
            Our Commitment
          </Heading>
        </VStack>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <ServiceCard
            icon={<FaShippingFast />}
            title="Fast & Free Delivery"
            description="Orders above ₹5000 ship express across India."
          />
          <ServiceCard
            icon={<FaUndoAlt />}
            title="10-Day Easy Returns"
            description="Not satisfied? Return or exchange hassle-free within 10 days."
          />
          <ServiceCard
            icon={<FaLock />}
            title="Secure Payments"
            description="Trusted payment gateways and data security."
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Homepage;
