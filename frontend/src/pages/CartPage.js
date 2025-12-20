// src/pages/CartPage.js (ULTRA-PREMIUM INTERACTIVE UI - FIXED)

import React from "react";
import {
  Box,
  Heading,
  Text,
  Grid,
  GridItem,
  VStack,
  Stack,
  Button,
  Image,
  Flex,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  useColorModeValue,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { FaTrash, FaShoppingCart } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";

// Motion components
const MotionBox = motion(Box);
const MotionStack = motion(Stack);
const MotionButton = motion(Button);

// ------------------------------------------------------
// 🔥 1. Individual Cart Item (Fixed Accessors)
// ------------------------------------------------------
const CartItem = ({ item }) => {
  const { removeFromCart, updateQuantity } = useCart();
  const toast = useToast();

  const glassBg = useColorModeValue(
    "rgba(255,255,255,0.08)",
    "rgba(0,0,0,0.4)"
  );
  const borderGlass = useColorModeValue(
    "rgba(255,255,255,0.15)",
    "rgba(0,255,255,0.2)"
  );

  // 🟢 FIX: Access properties directly from 'item', not 'item.product'
  // Handle both 'image' (DB) and 'imageUrl' (Frontend) keys
  const displayImage =
    item.image || item.imageUrl || "https://via.placeholder.com/150";
  const itemId = item.id || item._id; // Use the unique cart ID

  const handleQuantityChange = (valueString) => {
    const newQuantity = parseInt(valueString);
    if (newQuantity >= 1) updateQuantity(itemId, newQuantity);
  };

  const handleRemove = () => {
    removeFromCart(itemId);
    toast({
      title: "Removed",
      description: `${item.name} removed from cart`,
      status: "info",
      duration: 1500,
      isClosable: true,
      position: "top-right",
    });
  };

  return (
    <MotionStack
      direction={{ base: "column", sm: "row" }}
      spacing={5}
      p={6}
      borderWidth="1px"
      borderColor={borderGlass}
      borderRadius="2xl"
      backdropFilter="blur(18px)"
      bg={glassBg}
      boxShadow="0 0 25px rgba(0,255,255,0.2)"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, boxShadow: "0 0 35px cyan" }}
      transition={{ duration: 0.3 }}
    >
      <Image
        borderRadius="xl"
        boxSize={{ base: "120px", sm: "150px" }}
        objectFit="cover"
        src={displayImage}
        fallbackSrc="https://via.placeholder.com/150"
        _hover={{ transform: "scale(1.05)", transition: "0.3s" }}
      />

      <Flex direction="column" flexGrow={1} gap={1}>
        {/* 🟢 FIX: item.name */}
        <Heading size="md" color="cyan.200">
          {item.name}
        </Heading>

        <Badge colorScheme="purple" w="fit-content" borderRadius="md">
          Size: {item.size} | Color: {item.color}
        </Badge>

        <HStack mt={3} spacing={6}>
          {/* 🟢 FIX: item.price */}
          <Text fontWeight="bold" fontSize="xl" color="cyan.400">
            ₹{item.price?.toLocaleString()}
          </Text>

          <NumberInput
            size="md"
            maxW="90px"
            value={item.quantity}
            min={1}
            onChange={handleQuantityChange}
            borderRadius="md"
            bg="rgba(0,0,0,0.2)"
            color="white"
          >
            <NumberInputField borderRadius="md" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </HStack>
      </Flex>

      <VStack align="flex-end" spacing={3}>
        {/* 🟢 FIX: item.price * item.quantity */}
        <Text fontSize="2xl" fontWeight="extrabold" color="pink.400">
          ₹{(item.price * item.quantity).toLocaleString()}
        </Text>

        <MotionButton
          leftIcon={<FaTrash />}
          size="sm"
          colorScheme="red"
          variant="solid"
          borderRadius="full"
          onClick={handleRemove}
          whileHover={{ scale: 1.1, boxShadow: "0 0 15px red" }}
        >
          Remove
        </MotionButton>
      </VStack>
    </MotionStack>
  );
};

// ------------------------------------------------------
// 🔥 2. Order Summary (Fixed Calculations)
// ------------------------------------------------------
const CartSummary = ({ cartItems }) => {
  const bg = useColorModeValue("rgba(255,255,255,0.08)", "rgba(0,0,0,0.6)");
  const borderGlass = useColorModeValue(
    "rgba(255,255,255,0.2)",
    "rgba(0,255,255,0.3)"
  );

  // 🟢 FIX: Direct property access
  const totalItems = cartItems.reduce((a, i) => a + i.quantity, 0);
  const subtotal = cartItems.reduce((a, i) => a + i.price * i.quantity, 0);

  const shipping = subtotal > 5000 ? 0 : 250;
  const total = subtotal + shipping;

  return (
    <MotionBox
      p={6}
      borderRadius="2xl"
      bg={bg}
      borderWidth="1px"
      borderColor={borderGlass}
      backdropFilter="blur(20px)"
      boxShadow="0 0 25px cyan"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Heading size="lg" color="cyan.200">
        Order Summary
      </Heading>
      <Divider my={2} borderColor="cyan.400" />

      <Flex justify="space-between" w="full" my={1}>
        <Text color="cyan.100">Subtotal ({totalItems} items)</Text>
        <Text fontWeight="bold" color="cyan.400">
          ₹{subtotal.toLocaleString()}
        </Text>
      </Flex>

      <Flex justify="space-between" w="full" my={1}>
        <Text color="cyan.100">Shipping</Text>
        <Text fontWeight="bold" color="cyan.400">
          {shipping === 0 ? "Free" : `₹${shipping}`}
        </Text>
      </Flex>

      <Divider my={2} borderColor="cyan.400" />

      <Flex justify="space-between" w="full" my={2}>
        <Heading size="md" color="pink.400">
          Total
        </Heading>
        <Heading size="md" color="pink.400">
          ₹{total.toLocaleString()}
        </Heading>
      </Flex>

      <MotionButton
        colorScheme="pink"
        size="lg"
        w="full"
        borderRadius="full"
        as={RouterLink}
        to="/checkout"
        whileHover={{ scale: 1.05, boxShadow: "0 0 20px pink" }}
        mt={4}
      >
        Checkout
      </MotionButton>

      <MotionButton
        as={RouterLink}
        to="/products"
        variant="ghost"
        w="full"
        mt={2}
        whileHover={{ scale: 1.05, boxShadow: "0 0 15px cyan" }}
      >
        Continue Shopping
      </MotionButton>
    </MotionBox>
  );
};

// ------------------------------------------------------
// 🔥 3. Main Cart Page
// ------------------------------------------------------
const CartPage = () => {
  const { cartItems } = useCart();
  const bg = useColorModeValue("gray.900", "black");

  if (!cartItems || cartItems.length === 0) {
    return (
      <VStack py={20} spacing={8} bg={bg} minH="80vh">
        <FaShoppingCart size="80px" color="gray" />
        <Heading color="cyan.300">Your Cart is Empty</Heading>
        <Text color="gray.400" fontSize="lg">
          Add items to your cart to continue shopping.
        </Text>
        <MotionButton
          as={RouterLink}
          to="/products"
          colorScheme="cyan"
          size="lg"
          borderRadius="full"
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px cyan" }}
        >
          Shop Now
        </MotionButton>
      </VStack>
    );
  }

  return (
    <Box maxW="1300px" mx="auto" py={10} px={6} bg={bg} minH="100vh">
      <Heading mb={8} color="cyan.200">
        Your Cart ({cartItems.length} items)
      </Heading>

      <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={10}>
        <GridItem>
          <VStack spacing={6}>
            {cartItems.map((item) => (
              // 🟢 Key fix: Use item.id or item._id
              <CartItem key={item.id || item._id} item={item} />
            ))}
          </VStack>
        </GridItem>

        <GridItem>
          <CartSummary cartItems={cartItems} />
        </GridItem>
      </Grid>
    </Box>
  );
};

export default CartPage;
