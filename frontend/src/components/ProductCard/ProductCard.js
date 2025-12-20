// src/components/ProductCard/ProductCard.js

import React, { useState } from "react";
import {
  Box,
  Image,
  Text,
  Stack,
  Heading,
  Button,
  useColorModeValue,
  Badge,
  IconButton,
  AspectRatio,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import Rating from "../Utility/Rating";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart } from "react-icons/fa";

// Motion Components (using motion.create to avoid warnings)
const MotionButton = motion.create(Button);
const MotionIcon = motion.create(FaHeart);
const MotionBox = motion.create(Box);

// Backend URL
const API_BASE_URL = "https://raosahab-api.onrender.com";

const ProductCard = ({ product, glassmorphic }) => {
  // 🟢 HOOKS
  const defaultBg = useColorModeValue("white", "gray.700");
  const defaultBorder = useColorModeValue(
    "1px solid #e2e8f0",
    "1px solid #2D3748"
  );
  const defaultTextColor = useColorModeValue("gray.800", "white");

  // 🟢 Wishlist & Animation State
  const [isLiked, setIsLiked] = useState(false);
  const [showBigHeart, setShowBigHeart] = useState(false);

  // 🟢 Image Helper Logic
  const getImageUrl = (img) => {
    if (!img) return "https://via.placeholder.com/400x300?text=No+Image";
    let imgUrl = img;
    if (typeof img === "object" && img.url) imgUrl = img.url;
    if (typeof imgUrl !== "string")
      return "https://via.placeholder.com/400x300?text=Invalid+Image";
    if (imgUrl.startsWith("http") || imgUrl.startsWith("https")) return imgUrl;
    const cleanPath = imgUrl.replace(/\\/g, "/");
    const finalPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
    return `${API_BASE_URL}${finalPath}`;
  };

  let rawImage = null;
  if (product.images && product.images.length > 0) {
    rawImage = product.images[0];
  } else if (product.imageUrl) {
    rawImage = product.imageUrl;
  }
  const displayImage = getImageUrl(rawImage);

  // Style Logic
  const cardBg = glassmorphic ? "rgba(255, 255, 255, 0.1)" : defaultBg;
  const cardBorder = glassmorphic
    ? "1px solid rgba(255, 255, 255, 0.2)"
    : defaultBorder;
  const textColor = glassmorphic ? "white" : defaultTextColor;
  const categoryName = product.category?.name || product.category || "General";

  // 🟢 HANDLE DOUBLE CLICK (Instagram Logic)
  const handleDoubleClick = (e) => {
    e.preventDefault(); // Image open hone se roko (agar link hai)

    if (!isLiked) {
      setIsLiked(true);
      // Future: Yahan API call lagana wishlist me save karne ke liye
    }

    // Trigger Animation
    setShowBigHeart(true);
    setTimeout(() => {
      setShowBigHeart(false);
    }, 1000); // 1 second baad gayab
  };

  const handleLikeButton = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <Box
      maxW="sm"
      borderWidth="1px"
      borderRadius="2xl"
      overflow="hidden"
      bg={cardBg}
      backdropFilter={glassmorphic ? "blur(10px)" : "none"}
      border={cardBorder}
      _hover={{ transform: "translateY(-8px)", shadow: "2xl" }}
      transition="all 0.3s ease-in-out"
      position="relative"
      role="group"
    >
      {/* 🟢 Category Badge */}
      <Badge
        position="absolute"
        top={3}
        left={3} // Left side looks better with heart on right
        colorScheme="cyan"
        variant="solid"
        borderRadius="full"
        px={2}
        zIndex={2}
        boxShadow="md"
      >
        {typeof categoryName === "string" ? categoryName : "Category"}
      </Badge>

      {/* 🟢 Wishlist Icon Button (Top Right) */}
      <IconButton
        icon={<FaHeart />}
        size="sm"
        position="absolute"
        top={3}
        right={3}
        zIndex={10}
        borderRadius="full"
        colorScheme={isLiked ? "pink" : "gray"}
        color={isLiked ? "red.500" : "gray.400"}
        bg={glassmorphic ? "whiteAlpha.200" : "white"}
        onClick={handleLikeButton}
        boxShadow="md"
        _hover={{ transform: "scale(1.1)" }}
        aria-label="Wishlist"
      />

      {/* 🟢 IMAGE CONTAINER (Clickable Zone) */}
      <Box
        position="relative"
        cursor="pointer"
        onDoubleClick={handleDoubleClick} // 👈 Double Click Event
      >
        <RouterLink to={`/product/${product._id}`}>
          <AspectRatio ratio={1 / 1} w="100%">
            <Image
              src={displayImage}
              alt={product.name}
              objectFit="cover"
              fallbackSrc="https://via.placeholder.com/400x300?text=Loading..."
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/400x300?text=Image+Error";
              }}
            />
          </AspectRatio>
        </RouterLink>

        {/* 🟢 BIG HEART ANIMATION OVERLAY */}
        <AnimatePresence>
          {showBigHeart && (
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              zIndex={5}
              pointerEvents="none"
            >
              {/* Instagram Gradient Definition */}
              <svg width="0" height="0">
                <linearGradient
                  id="instaGradient"
                  x1="100%"
                  y1="100%"
                  x2="0%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: "#f09433", stopOpacity: 1 }}
                  />
                  <stop
                    offset="25%"
                    style={{ stopColor: "#e6683c", stopOpacity: 1 }}
                  />
                  <stop
                    offset="50%"
                    style={{ stopColor: "#dc2743", stopOpacity: 1 }}
                  />
                  <stop
                    offset="75%"
                    style={{ stopColor: "#cc2366", stopOpacity: 1 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "#bc1888", stopOpacity: 1 }}
                  />
                </linearGradient>
              </svg>

              <MotionIcon
                initial={{ scale: 0, opacity: 0, rotate: -30 }}
                animate={{
                  scale: [0, 1.5, 1.2],
                  opacity: [0, 1, 1],
                  rotate: [0, 10, 0],
                }}
                exit={{ scale: 0, opacity: 0, y: -50 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                  filter: "drop-shadow(0px 5px 15px rgba(0,0,0,0.3))",
                  fill: "url(#instaGradient)", // Using the gradient
                }}
                color="white" // Fallback
                fontSize="100px"
              />
            </Box>
          )}
        </AnimatePresence>
      </Box>

      <Box p="5">
        <Stack spacing={2}>
          <Heading size="md" isTruncated color={textColor}>
            <RouterLink to={`/product/${product._id}`}>
              {product.name}
            </RouterLink>
          </Heading>

          <Rating
            rating={product.rating}
            numReviews={product.numReviews}
            color={glassmorphic ? "yellow.300" : "yellow.500"}
          />

          <Text
            color={glassmorphic ? "cyan.300" : "blue.600"}
            fontSize="2xl"
            fontWeight="extrabold"
          >
            ₹{product.price ? product.price.toLocaleString() : "0"}
          </Text>
        </Stack>

        <MotionButton
          mt={4}
          w="full"
          colorScheme="cyan"
          variant={glassmorphic ? "solid" : "outline"}
          as={RouterLink}
          to={`/product/${product._id}`}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 0 12px cyan",
          }}
          whileTap={{ scale: 0.95 }}
        >
          View Details
        </MotionButton>
      </Box>
    </Box>
  );
};

export default ProductCard;
