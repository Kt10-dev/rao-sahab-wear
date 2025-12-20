// src/components/Order/LiveOrderStatus.js

import React from "react";
import {
  Box,
  VStack,
  Text,
  HStack,
  Icon,
  Flex,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FaBox,
  FaClipboardCheck,
  FaShippingFast,
  FaHome,
  FaCheckCircle,
} from "react-icons/fa";

// Motion Components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const steps = [
  {
    status: "Processing",
    icon: FaClipboardCheck,
    title: "Order Placed",
    desc: "We have received your order.",
  },
  {
    status: "Packed",
    icon: FaBox,
    title: "Packed",
    desc: "Your item is packed & ready.",
  },
  {
    status: "Shipped",
    icon: FaShippingFast,
    title: "Shipped",
    desc: "Out for delivery.",
  },
  {
    status: "Delivered",
    icon: FaHome,
    title: "Delivered",
    desc: "Package arrived safely.",
  },
];

const LiveOrderStatus = ({ currentStatus }) => {
  // 🟢 FIX: Ensure status is never undefined
  const safeStatus = currentStatus || "Processing";

  // Determine current step index
  let activeIndex = 0;
  if (safeStatus === "Packed") activeIndex = 1;
  if (safeStatus === "Shipped") activeIndex = 2;
  if (safeStatus === "Delivered") activeIndex = 3;

  // Handle Return statuses visually
  // 🟢 FIX: Added safe check (?.)
  const isReturned = safeStatus.includes("Return");

  return (
    <Box w="full" py={6} px={2}>
      <VStack spacing={0} align="stretch" position="relative">
        {/* The Glowing Line (Background) */}
        <Box
          position="absolute"
          left="29px"
          top="20px"
          bottom="40px"
          w="4px"
          bg="gray.700"
          borderRadius="full"
          zIndex={0}
        />

        {/* Animated Progress Line (Fill) */}
        <MotionBox
          position="absolute"
          left="29px"
          top="20px"
          w="4px"
          bgGradient="linear(to-b, cyan.400, purple.500)"
          borderRadius="full"
          zIndex={1}
          initial={{ height: "0%" }}
          animate={{ height: `${(activeIndex / (steps.length - 1)) * 90}%` }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{ boxShadow: "0 0 15px #0BC5EA" }}
        />

        {/* Steps Loop */}
        {steps.map((step, index) => {
          const isCompleted = index <= activeIndex;
          const isCurrent = index === activeIndex;

          return (
            <MotionFlex
              key={index}
              align="center"
              mb={8}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              position="relative"
              zIndex={2}
            >
              {/* 1. 3D Icon Node */}
              <Flex
                align="center"
                justify="center"
                boxSize="60px"
                bg={isCompleted ? "cyan.900" : "gray.800"}
                border="2px solid"
                borderColor={isCompleted ? "cyan.400" : "gray.600"}
                borderRadius="full"
                boxShadow={isCurrent ? "0 0 20px cyan" : "none"}
                mr={6}
                position="relative"
              >
                {isCompleted ? (
                  <Icon as={FaCheckCircle} color="cyan.400" boxSize={6} />
                ) : (
                  <Icon as={step.icon} color="gray.500" boxSize={5} />
                )}

                {isCurrent && (
                  <MotionBox
                    position="absolute"
                    w="100%"
                    h="100%"
                    borderRadius="full"
                    border="2px solid cyan"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
              </Flex>

              {/* 2. 3D Glass Card */}
              <MotionBox
                flex={1}
                p={4}
                bg={isCurrent ? "rgba(11, 197, 234, 0.1)" : "whiteAlpha.50"}
                backdropFilter="blur(10px)"
                borderRadius="xl"
                border="1px solid"
                borderColor={isCurrent ? "cyan.500" : "whiteAlpha.200"}
                boxShadow={
                  isCurrent ? "0 10px 30px -10px rgba(0,255,255,0.3)" : "none"
                }
                transform={
                  isCurrent ? "scale(1.02) translateX(10px)" : "scale(1)"
                }
                transition="all 0.3s ease"
                whileHover={{ scale: 1.02 }}
              >
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text
                      fontWeight="bold"
                      fontSize="lg"
                      color={isCompleted ? "white" : "gray.500"}
                      textShadow={isCurrent ? "0 0 10px cyan" : "none"}
                    >
                      {step.title}
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      {step.desc}
                    </Text>
                  </VStack>

                  {isCurrent && (
                    <Badge
                      colorScheme="cyan"
                      variant="solid"
                      borderRadius="full"
                      px={2}
                    >
                      NOW
                    </Badge>
                  )}
                </HStack>
              </MotionBox>
            </MotionFlex>
          );
        })}
      </VStack>
    </Box>
  );
};

export default LiveOrderStatus;
