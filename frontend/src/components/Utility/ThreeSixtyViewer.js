import React, { useState, useEffect, useRef } from "react";
import { Box, Image, Text, Center, Spinner } from "@chakra-ui/react";

const ThreeSixtyViewer = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [loading, setLoading] = useState(true);

  // Images Load Check
  useEffect(() => {
    let loadedCount = 0;
    images.forEach((src) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === images.length) setLoading(false);
      };
    });
  }, [images]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX || e.touches[0].pageX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const currentX = e.pageX || (e.touches ? e.touches[0].pageX : 0);
    const diff = startX - currentX;

    // Sensitivity: 15px drag = 1 frame change
    if (Math.abs(diff) > 15) {
      if (diff > 0) {
        // Drag Left -> Rotate Right
        setCurrentIndex((prev) => (prev + 1) % images.length);
      } else {
        // Drag Right -> Rotate Left
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      }
      setStartX(currentX);
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  if (loading) {
    return (
      <Center h="400px">
        <Spinner color="cyan.500" />
        <Text ml={3}>Loading 360° View...</Text>
      </Center>
    );
  }

  return (
    <Box
      position="relative"
      cursor={isDragging ? "grabbing" : "grab"}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
      borderRadius="2xl"
      overflow="hidden"
      userSelect="none"
      bg="blackAlpha.300"
    >
      <Image
        src={images[currentIndex]}
        alt={`Product Angle ${currentIndex}`}
        w="full"
        h={{ base: "380px", md: "550px" }}
        objectFit="cover"
        draggable="false"
      />

      {/* 🟢 Helper Overlay */}
      <Box
        position="absolute"
        bottom={4}
        left="50%"
        transform="translateX(-50%)"
        bg="blackAlpha.700"
        px={4}
        py={1}
        borderRadius="full"
      >
        <Text fontSize="xs" color="white">
          ↔️ Drag to Rotate 360°
        </Text>
      </Box>
    </Box>
  );
};

export default ThreeSixtyViewer;
