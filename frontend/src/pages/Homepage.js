// src/pages/Homepage.js

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
  useBreakpointValue,
} from "@chakra-ui/react";
import { FaShippingFast, FaUndoAlt, FaLock } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// Components
import ProductCard from "../components/ProductCard/ProductCard";
import SplashScreen from "../components/Splash/SplashScreen";
import HeroSlider from "../components/Home/HeroSlider";
import ProductSkeleton from "../components/ProductSkeleton"; // 🟢 पक्का करें कि ये फाइल बनी हुई है

const MotionBox = motion(chakra.div);

const API_BASE_URL = "https://raosahab-api.onrender.com";

// --- Dummy featured (fallback for slow API or no data) ---
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
    images: [
      {
        url: "https://images.unsplash.com/photo-1577901764724-42b7858c44b3?q=80&w=1887&auto=format&fit=crop",
      },
    ],
  },
  {
    ...dummyProductBase,
    _id: "H2",
    name: "Classic Linen Kurta",
    price: 2499,
    isNew: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1626090407185-3091af465a95?q=80&w=1887&auto=format&fit=crop",
      },
    ],
  },
  {
    ...dummyProductBase,
    _id: "H3",
    name: "Signature Embroidered Sherwani",
    price: 15500,
    stock: 5,
    images: [
      {
        url: "https://images.unsplash.com/photo-1542272825-e51c140409a6?q=80&w=1887&auto=format&fit=crop",
      },
    ],
  },
];

// --- Animation Variants ---
const containerVariant = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, when: "beforeChildren" },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// --- Service Card Component ---
const ServiceCard = ({ icon, title, description }) => (
  <MotionBox
    variants={cardVariant}
    whileHover={{
      translateY: -8,
      boxShadow: "0 10px 30px rgba(6,182,212,0.3)",
    }}
    bg="rgba(255,255,255,0.05)"
    backdropFilter="blur(15px)"
    borderRadius="2xl"
    p={8}
    textAlign="center"
    border="1px solid rgba(255,255,255,0.1)"
  >
    <Box
      color="cyan.400"
      fontSize="3rem"
      display="flex"
      justifyContent="center"
      mb={4}
    >
      {icon}
    </Box>
    <Heading
      size="md"
      mb={3}
      bgGradient="linear(to-r, cyan.400, blue.500)"
      bgClip="text"
      fontWeight="bold"
    >
      {title}
    </Heading>
    <Text color="gray.400" fontSize="sm">
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

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const handleAnimationComplete = () => {
    try {
      sessionStorage.setItem("seenSplash", "1");
    } catch {}
    setShowSplash(false);
  };

  useEffect(() => {
    let mounted = true;
    const fetchLatest = async () => {
      try {
        setLoadingProducts(true);
        // Optimized: limit to 3 for faster response on Homepage
        const res = await axios.get(`${API_BASE_URL}/api/products?limit=3`);
        if (!mounted) return;

        let fetchedData = [];
        if (res.data.products && Array.isArray(res.data.products)) {
          fetchedData = res.data.products;
        } else if (Array.isArray(res.data)) {
          fetchedData = res.data;
        }

        setProducts(fetchedData.length > 0 ? fetchedData : featuredProducts);
      } catch (err) {
        console.error("Fetch error:", err);
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
    <Box bg="gray.900" minH="100vh" color="white">
      {/* Dynamic Hero Slider */}
      <HeroSlider />

      <Container maxW="1200px" py={20}>
        {/* Featured Section Header */}
        <VStack spacing={2} mb={12}>
          <Text
            letterSpacing="widest"
            fontSize="xs"
            fontWeight="black"
            color="cyan.400"
            textTransform="uppercase"
          >
            Exclusive Selection
          </Text>
          <Heading
            size="2xl"
            bgGradient="linear(to-r, white, gray.400)"
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
            mb={12}
          >
            {loadingProducts ? (
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                {/* 🟢 Improved Loading: 3 Skeleton Boxes */}
                {[1, 2, 3].map((n) => (
                  <ProductSkeleton key={n} />
                ))}
              </SimpleGrid>
            ) : (
              <>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                  {products.slice(0, 3).map((p, idx) => (
                    <MotionBox key={p._id || idx} variants={cardVariant}>
                      <ProductCard product={p} />
                    </MotionBox>
                  ))}
                </SimpleGrid>

                {/* 🟢 Call to Action: View All Button */}
                <Box textAlign="center" mt={16}>
                  <Button
                    as={RouterLink}
                    to="/shop"
                    size="lg"
                    height="60px"
                    px={12}
                    fontSize="md"
                    fontWeight="bold"
                    borderRadius="full"
                    bgGradient="linear(to-r, cyan.500, blue.600)"
                    color="white"
                    _hover={{
                      bgGradient: "linear(to-r, cyan.400, blue.500)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 5px 20px rgba(0, 255, 255, 0.3)",
                    }}
                    transition="all 0.3s"
                  >
                    Explore All Collections
                  </Button>
                </Box>
              </>
            )}
          </MotionBox>
        </AnimatePresence>
      </Container>

      {/* Services Section */}
      <Box bg="rgba(255,255,255,0.02)" py={20}>
        <Container maxW="1200px">
          <VStack spacing={2} mb={12}>
            <Text color="cyan.400" fontWeight="bold">
              WHY CHOOSE US?
            </Text>
            <Heading size="xl">Our Commitment</Heading>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <ServiceCard
              icon={<FaShippingFast />}
              title="Fast Delivery"
              description="Express shipping across India for all premium orders."
            />
            <ServiceCard
              icon={<FaUndoAlt />}
              title="Easy Returns"
              description="10-day hassle-free returns and exchanges policy."
            />
            <ServiceCard
              icon={<FaLock />}
              title="Secure Checkout"
              description="100% encrypted payments via trusted gateways."
            />
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  );
};

export default Homepage;
