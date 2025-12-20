// src/pages/CheckoutPage.js

import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  useSteps,
  useToast,
  FormControl,
  FormLabel,
  Input,
  RadioGroup,
  Radio,
  Divider,
  Flex,
  useColorModeValue,
  SimpleGrid,
  Select,
  Textarea,
  Stack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaLocationArrow, FaTag } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import axios from "axios";
import indiaData from "../data/states-and-districts.json";

const API_BASE_URL = "https://raosahab-api.onrender.com";

// 🟢 FIX 1: Framer Motion Deprecation Warning Fix
const MotionBox = motion.create(Box);
const MotionButton = motion.create(Button);

const steps = [
  { title: "Shipping", description: "Address" },
  { title: "Payment", description: "Method" },
  { title: "Review", description: "Finalize" },
];

// Load Razorpay Script Helper
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// -----------------------------
// Step 1: Shipping Form
// -----------------------------
const ShippingForm = ({ onNext, setShippingData, shippingData }) => {
  const toast = useToast();
  const [formData, setFormData] = useState(
    shippingData || {
      name: "",
      email: "",
      address: "",
      landmark: "",
      country: "India",
      state: "",
      district: "",
      postalCode: "",
      mobile: "",
      locationUrl: "",
    }
  );
  const [districts, setDistricts] = useState([]);
  const [locLoading, setLocLoading] = useState(false);

  useEffect(() => {
    if (formData.state) {
      const stateObj = indiaData.states.find((s) => s.state === formData.state);
      if (stateObj) setDistricts(stateObj.districts);
    }
  }, [formData.state]);

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setFormData({ ...formData, state: selectedState, district: "" });
    const stateObj = indiaData.states.find((s) => s.state === selectedState);
    setDistricts(stateObj ? stateObj.districts : []);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation not supported.",
        status: "error",
      });
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsUrl = `http://maps.google.com/maps?q=${latitude},${longitude}`;
        setFormData((prev) => ({ ...prev, locationUrl: mapsUrl }));
        setLocLoading(false);
        toast({ title: "Location Captured!", status: "success" });
      },
      (error) => {
        setLocLoading(false);
        toast({
          title: "Location Error",
          description: "Enable location access.",
          status: "error",
        });
      }
    );
  };

  const handleSubmit = () => {
    const requiredFields = [
      "name",
      "email",
      "address",
      "state",
      "district",
      "postalCode",
      "mobile",
    ];

    // Check Empty Fields
    for (let field of requiredFields) {
      if (!formData[field]) {
        toast({
          title: "Missing Field",
          description: `Please fill ${field}`,
          status: "warning",
        });
        return;
      }
    }

    // 🟢 FIX 2: Strict Validation for Pincode (Shiprocket Error Fix)
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(formData.postalCode)) {
      toast({
        title: "Invalid Pincode",
        description: "Pincode must be exactly 6 digits without spaces.",
        status: "error",
      });
      return;
    }

    // 🟢 FIX 3: Strict Validation for Mobile
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      toast({
        title: "Invalid Mobile",
        description: "Mobile number must be 10 digits.",
        status: "error",
      });
      return;
    }

    setShippingData(formData);
    onNext();
  };

  return (
    <VStack spacing={5} align="stretch" p={{ base: 0, md: 2 }}>
      <Heading size="md" mb={2} color="cyan.300">
        Shipping Details
      </Heading>
      <Box
        p={4}
        bg="whiteAlpha.100"
        borderRadius="md"
        border="1px dashed"
        borderColor="cyan.500"
      >
        <HStack justify="space-between">
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold" fontSize="sm" color="cyan.200">
              Exact Location
            </Text>
            <Text fontSize="xs" color="gray.400">
              Share GPS for faster delivery.
            </Text>
          </VStack>
          <Button
            leftIcon={<FaLocationArrow />}
            colorScheme="cyan"
            size="sm"
            onClick={handleDetectLocation}
            isLoading={locLoading}
            variant={formData.locationUrl ? "solid" : "outline"}
          >
            {formData.locationUrl ? "Saved" : "Detect"}
          </Button>
        </HStack>
      </Box>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <FormControl id="name" isRequired>
          <FormLabel color="gray.200">Full Name</FormLabel>
          <Input
            value={formData.name}
            onChange={handleChange}
            color="white"
            bg="whiteAlpha.100"
            border="1px solid rgba(255,255,255,0.2)"
          />
        </FormControl>
        <FormControl id="email" isRequired>
          <FormLabel color="gray.200">Email</FormLabel>
          <Input
            value={formData.email}
            onChange={handleChange}
            type="email"
            color="white"
            bg="whiteAlpha.100"
            border="1px solid rgba(255,255,255,0.2)"
          />
        </FormControl>
        <FormControl id="address" isRequired gridColumn={{ md: "span 2" }}>
          <FormLabel color="gray.200">Address</FormLabel>
          <Textarea
            value={formData.address}
            onChange={handleChange}
            color="white"
            bg="whiteAlpha.100"
            border="1px solid rgba(255,255,255,0.2)"
            placeholder="House No, Street, Area"
          />
        </FormControl>
        <FormControl id="landmark" gridColumn={{ md: "span 2" }}>
          <FormLabel color="gray.200">Landmark</FormLabel>
          <Input
            value={formData.landmark}
            onChange={handleChange}
            color="white"
            bg="whiteAlpha.100"
            border="1px solid rgba(255,255,255,0.2)"
          />
        </FormControl>
        <FormControl id="country" isRequired>
          <FormLabel color="gray.200">Country</FormLabel>
          <Input
            value="India"
            isReadOnly
            bg="whiteAlpha.50"
            color="gray.400"
            border="1px solid rgba(255,255,255,0.1)"
          />
        </FormControl>
        <FormControl id="state" isRequired>
          <FormLabel color="gray.200">State</FormLabel>
          <Select
            placeholder="Select State"
            value={formData.state}
            onChange={handleStateChange}
            bg="gray.800"
            color="white"
            border="1px solid rgba(255,255,255,0.2)"
            sx={{ option: { color: "black" } }}
          >
            {indiaData.states.map((s) => (
              <option key={s.state} value={s.state}>
                {s.state}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl id="district" isRequired>
          <FormLabel color="gray.200">District</FormLabel>
          <Select
            placeholder="Select District"
            id="district"
            value={formData.district}
            onChange={handleChange}
            bg="gray.800"
            color="white"
            border="1px solid rgba(255,255,255,0.2)"
            isDisabled={!formData.state}
            sx={{ option: { color: "black" } }}
          >
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl id="postalCode" isRequired>
          <FormLabel color="gray.200">PIN Code</FormLabel>
          <Input
            value={formData.postalCode}
            onChange={handleChange}
            type="number"
            color="white"
            bg="whiteAlpha.100"
            border="1px solid rgba(255,255,255,0.2)"
          />
        </FormControl>
        <FormControl id="mobile" isRequired>
          <FormLabel color="gray.200">Mobile</FormLabel>
          <Input
            value={formData.mobile}
            onChange={handleChange}
            type="tel"
            color="white"
            bg="whiteAlpha.100"
            border="1px solid rgba(255,255,255,0.2)"
          />
        </FormControl>
      </SimpleGrid>
      <MotionButton
        colorScheme="cyan"
        onClick={handleSubmit}
        mt={6}
        size="lg"
        w="full"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Proceed to Payment
      </MotionButton>
    </VStack>
  );
};

// -----------------------------
// Step 2: Payment Form
// -----------------------------
const PaymentForm = ({ onNext, setPaymentMethod, paymentMethod }) => (
  <VStack spacing={6} align="stretch">
    <Heading size="md" color="cyan.300">
      Select Payment Method
    </Heading>
    <RadioGroup onChange={setPaymentMethod} value={paymentMethod}>
      <VStack align="start" spacing={4} w="full">
        <Box
          w="full"
          p={4}
          border="1px solid"
          borderColor={paymentMethod === "cod" ? "cyan.400" : "whiteAlpha.200"}
          borderRadius="md"
          bg={paymentMethod === "cod" ? "whiteAlpha.100" : "transparent"}
          cursor="pointer"
          onClick={() => setPaymentMethod("cod")}
        >
          <Radio value="cod" colorScheme="cyan">
            <Text color="white" ml={2} fontWeight="bold">
              Cash On Delivery (COD)
            </Text>
          </Radio>
        </Box>
        <Box
          w="full"
          p={4}
          border="1px solid"
          borderColor={
            paymentMethod === "online" ? "cyan.400" : "whiteAlpha.200"
          }
          borderRadius="md"
          bg={paymentMethod === "online" ? "whiteAlpha.100" : "transparent"}
          cursor="pointer"
          onClick={() => setPaymentMethod("online")}
        >
          <Radio value="online" colorScheme="cyan">
            <Text color="white" ml={2} fontWeight="bold">
              Pay Online (Razorpay)
            </Text>
          </Radio>
        </Box>
      </VStack>
    </RadioGroup>
    <MotionButton
      colorScheme="cyan"
      onClick={onNext}
      mt={4}
      size="lg"
      w="full"
      isDisabled={!paymentMethod}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      Review Order
    </MotionButton>
  </VStack>
);

// -----------------------------
// Step 3: Review Order
// -----------------------------
const ReviewOrder = ({
  onFinalSubmit,
  shippingData,
  paymentMethod,
  subtotal,
  shippingCost,
  taxPrice,
  discountAmount,
  finalTotal,
  loading,
  onApplyCoupon,
  couponCode,
  setCouponCode,
  isCalculating,
}) => {
  return (
    <VStack spacing={6} align="stretch">
      <Heading size="md" color="cyan.300">
        Review & Place Order
      </Heading>
      <Stack direction={{ base: "column", md: "row" }} spacing={4}>
        <Box
          p={4}
          flex={1}
          borderRadius="lg"
          bg="rgba(255,255,255,0.05)"
          border="1px solid rgba(255,255,255,0.2)"
        >
          <Text fontWeight="bold" mb={2} color="cyan.200">
            Shipping To:
          </Text>
          <Text color="gray.300">
            {shippingData.name}
            <br />
            {shippingData.address}, {shippingData.district}
            <br />
            {shippingData.state} - {shippingData.postalCode}
          </Text>
          <Text color="gray.300">Mobile: {shippingData.mobile}</Text>
        </Box>
        <Box
          p={4}
          flex={1}
          borderRadius="lg"
          bg="rgba(255,255,255,0.05)"
          border="1px solid rgba(255,255,255,0.2)"
        >
          <Text fontWeight="bold" mb={2} color="cyan.200">
            Payment Method:
          </Text>
          <Text
            color={paymentMethod === "online" ? "green.300" : "orange.300"}
            fontSize="lg"
            fontWeight="bold"
          >
            {paymentMethod === "cod" ? "CASH ON DELIVERY" : "ONLINE (RAZORPAY)"}
          </Text>
        </Box>
      </Stack>

      <Box
        p={4}
        borderRadius="lg"
        bg="whiteAlpha.100"
        border="1px dashed"
        borderColor="cyan.500"
      >
        <Text fontWeight="bold" mb={3} color="cyan.200" fontSize="sm">
          HAVE A COUPON?
        </Text>
        <HStack>
          <Input
            placeholder="Enter Code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            bg="gray.800"
            color="white"
            border="1px solid gray"
          />
          <Button
            leftIcon={<FaTag />}
            colorScheme="cyan"
            onClick={onApplyCoupon}
            isDisabled={!couponCode}
          >
            Apply
          </Button>
        </HStack>
        {discountAmount > 0 && (
          <Text color="green.400" fontSize="sm" mt={2}>
            ✅ Coupon Applied! Saved ₹{discountAmount.toLocaleString()}
          </Text>
        )}
      </Box>

      <Divider borderColor="whiteAlpha.300" />

      <VStack align="stretch" spacing={2}>
        <Flex justify="space-between">
          <Text color="gray.400">Subtotal:</Text>
          <Text color="white">₹{subtotal.toLocaleString()}</Text>
        </Flex>
        <Flex justify="space-between">
          <Text color="gray.400">Shipping (Shiprocket):</Text>
          <Text color={isCalculating ? "yellow.300" : "white"}>
            {isCalculating
              ? "Calculating..."
              : shippingCost === 0
              ? "FREE"
              : `₹${shippingCost}`}
          </Text>
        </Flex>
        <Flex justify="space-between">
          <Text color="gray.400">Tax (18% GST):</Text>
          <Text color="white">₹{taxPrice?.toLocaleString() || 0}</Text>
        </Flex>
        {discountAmount > 0 && (
          <Flex justify="space-between">
            <Text color="green.400">Discount:</Text>
            <Text color="green.400">- ₹{discountAmount.toLocaleString()}</Text>
          </Flex>
        )}
        <Divider borderColor="whiteAlpha.200" />
        <Flex justify="space-between" align="center">
          <Heading size="md" color="white">
            Total:
          </Heading>
          <Heading size="lg" color="green.300">
            ₹{finalTotal.toLocaleString()}
          </Heading>
        </Flex>
      </VStack>

      <MotionButton
        colorScheme="green"
        onClick={onFinalSubmit}
        mt={4}
        size="lg"
        w="full"
        isLoading={loading}
        loadingText="Processing..."
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {paymentMethod === "online"
          ? `Pay ₹${finalTotal.toLocaleString()}`
          : "Place COD Order"}
      </MotionButton>
    </VStack>
  );
};

// -----------------------------
// Main Checkout Page
// -----------------------------
const CheckoutPage = () => {
  const { cartItems, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { activeStep, goToNext, goToPrevious } = useSteps({ initialStep: 0 });

  const [shippingData, setShippingData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);

  // Stats
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPrice, setTaxPrice] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  );

  // Rate Calculation
  useEffect(() => {
    const calculateRates = async () => {
      let ship = subtotal > 5000 ? 0 : 250;
      let tax = Math.round(subtotal * 0.18);

      if (shippingData?.postalCode?.length === 6 && user?.token) {
        setIsCalculating(true);
        try {
          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          };
          const { data } = await axios.post(
            `${API_BASE_URL}/api/orders/calc-shipping`,
            { pincode: shippingData.postalCode, orderAmount: subtotal },
            config
          );
          ship = data.shippingPrice;
          tax = data.taxPrice;
        } catch (error) {
          console.error("Rate fetch failed");
        } finally {
          setIsCalculating(false);
        }
      }
      setShippingCost(ship);
      setTaxPrice(tax);
    };
    calculateRates();
  }, [shippingData, subtotal, user]);

  const discountAmount = (subtotal * discountPercent) / 100;
  const finalTotal = Math.round(
    subtotal + shippingCost + taxPrice - discountAmount
  );
  const bg = useColorModeValue("gray.900", "gray.900");

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        `${API_BASE_URL}/api/coupons/validate`,
        { code: couponCode },
        config
      );
      setDiscountPercent(data.discountPercentage);
      toast({ title: "Coupon Applied!", status: "success" });
    } catch (error) {
      setDiscountPercent(0);
      toast({
        title: "Invalid Coupon",
        description: error.response?.data?.message,
        status: "error",
      });
    }
  };

  const handleFinalOrderSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Login required.",
        status: "error",
      });
      navigate("/login");
      return;
    }
    if (!paymentMethod) {
      toast({ title: "Select Payment Method", status: "warning" });
      return;
    }

    if (paymentMethod === "online") {
      await handleRazorpayPayment();
      return;
    }
    await placeOrderInDB(false, null);
  };

  // 🟢🟢 FIXED RAZORPAY HANDLER 🟢🟢
  const handleRazorpayPayment = async () => {
    setLoading(true);

    // 1. Script Load Check
    const res = await loadRazorpayScript();
    if (!res) {
      toast({
        title: "Error",
        description: "Razorpay SDK failed to load. Check internet connection.",
        status: "error",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      // 2. Create Order on Backend
      const { data: orderData } = await axios.post(
        `${API_BASE_URL}/api/payment/create`,
        { amount: finalTotal },
        config
      );

      // 3. Get Key ID
      const { data: keyData } = await axios.get(
        `${API_BASE_URL}/api/payment/key`
      );
      const razorpayKey = keyData.key || keyData;

      console.log("Razorpay Key:", razorpayKey);
      console.log("Order Data:", orderData);

      // 4. Options
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: "INR",
        name: "Rao Sahab Wear",
        description: "Payment for Order",
        // 🟢 FIX 4: Removed Broken Image Link
        // image: "https://your-logo-url.com/logo.png",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // Verify Payment
            await axios.post(
              `${API_BASE_URL}/api/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              config
            );
            // Place Order in DB
            await placeOrderInDB(true, response.razorpay_payment_id);
          } catch (error) {
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if money deducted.",
              status: "error",
            });
          }
        },
        prefill: {
          name: shippingData.name,
          email: shippingData.email,
          contact: shippingData.mobile,
        },
        notes: {
          address: shippingData.address,
        },
        theme: { color: "#0BC5EA" },
      };

      // 5. Open Window
      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", function (response) {
        toast({
          title: "Payment Failed",
          description: response.error.description,
          status: "error",
        });
        setLoading(false);
      });

      paymentObject.open();
    } catch (error) {
      console.error("Razorpay Error:", error);
      toast({
        title: "Payment Initiation Failed",
        description: error.response?.data?.message || error.message,
        status: "error",
      });
      setLoading(false);
    }
  };

  const placeOrderInDB = async (isPaid = false, paymentResultId = null) => {
    setLoading(true);
    try {
      const orderItems = cartItems.map((item) => ({
        product: item.product || item._id || item.id,
        name: item.name,
        image: item.image || item.imageUrl || "https://via.placeholder.com/150",
        price: item.price,
        qty: item.quantity,
      }));

      const orderPayload = {
        orderItems,
        shippingAddress: shippingData,
        paymentMethod: paymentMethod === "online" ? "Razorpay" : "COD",
        itemsPrice: subtotal,
        shippingPrice: shippingCost,
        taxPrice: taxPrice,
        totalPrice: finalTotal,
        isPaid: isPaid,
        paidAt: isPaid ? Date.now() : null,
        paymentResult: paymentResultId
          ? { id: paymentResultId, status: "COMPLETED" }
          : {},
      };

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `${API_BASE_URL}/api/orders`,
        orderPayload,
        config
      );

      toast({
        title: "Order Placed!",
        description: `Order ID: ${data._id}`,
        status: "success",
        duration: 5000,
      });

      // Clear Cart
      cartItems.forEach((item) => removeFromCart(item.id || item._id));
      localStorage.removeItem("cartItems");

      navigate("/profile");
    } catch (error) {
      toast({
        title: "Order Failed",
        description: error.response?.data?.message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetCart = () => {
    localStorage.removeItem("cartItems");
    window.location.reload();
  };

  if (cartItems.length === 0 && activeStep < steps.length) {
    return (
      <VStack
        py={20}
        spacing={5}
        textAlign="center"
        maxW="900px"
        mx="auto"
        bg={bg}
        minH="60vh"
        px={4}
      >
        <Heading size="xl" color="cyan.300">
          Your Bag is Empty
        </Heading>
        <Button
          as={RouterLink}
          to="/products"
          colorScheme="cyan"
          size="lg"
          mt={4}
        >
          Continue Shopping
        </Button>
      </VStack>
    );
  }

  return (
    <Box
      w="100%"
      minH="100vh"
      bg={bg}
      py={{ base: 6, md: 10 }}
      px={{ base: 4, md: 8 }}
    >
      <Box maxW="1000px" mx="auto">
        <Box mb={8} textAlign="center">
          <Button
            colorScheme="red"
            variant="outline"
            size="xs"
            onClick={handleResetCart}
          >
            ⚠️ Reset & Fix Cart Data
          </Button>
        </Box>

        <Heading as="h1" mb={8} size="xl" textAlign="center" color="cyan.300">
          Checkout
        </Heading>

        <Stepper
          index={activeStep}
          size="lg"
          colorScheme="cyan"
          mb={10}
          display={{ base: "none", md: "flex" }}
        >
          {steps.map((step, index) => (
            <Step key={index}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>
              <Box flexShrink="0">
                <StepTitle color="cyan.200">{step.title}</StepTitle>
                <StepDescription color="gray.400">
                  {step.description}
                </StepDescription>
              </Box>
              <StepSeparator />
            </Step>
          ))}
        </Stepper>

        {/* Mobile Stepper */}
        <Box display={{ base: "block", md: "none" }} mb={6}>
          <Text color="cyan.400" fontWeight="bold" textAlign="center" mb={2}>
            Step {activeStep + 1}: {steps[activeStep].title}
          </Text>
          <Box w="100%" h="4px" bg="gray.700" borderRadius="full">
            <Box
              h="100%"
              bg="cyan.400"
              borderRadius="full"
              width={`${((activeStep + 1) / 3) * 100}%`}
              transition="width 0.3s ease"
            />
          </Box>
        </Box>

        <MotionBox
          p={{ base: 4, md: 8 }}
          borderRadius="xl"
          bg="rgba(0,0,0,0.6)"
          border="1px solid rgba(0,255,255,0.3)"
          backdropFilter="blur(15px)"
          boxShadow={{ base: "none", md: "0 0 25px cyan" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {activeStep === 0 && (
            <ShippingForm
              onNext={goToNext}
              setShippingData={setShippingData}
              shippingData={shippingData}
            />
          )}
          {activeStep === 1 && (
            <PaymentForm
              onNext={goToNext}
              setPaymentMethod={setPaymentMethod}
              paymentMethod={paymentMethod}
            />
          )}
          {activeStep === 2 && (
            <ReviewOrder
              onFinalSubmit={handleFinalOrderSubmit}
              shippingData={shippingData}
              paymentMethod={paymentMethod}
              cartItems={cartItems}
              subtotal={subtotal}
              shippingCost={shippingCost}
              taxPrice={taxPrice}
              discountAmount={discountAmount}
              finalTotal={finalTotal}
              loading={loading}
              onApplyCoupon={handleApplyCoupon}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              isCalculating={isCalculating}
            />
          )}
          {activeStep > 0 && (
            <MotionButton
              variant="outline"
              onClick={goToPrevious}
              mt={6}
              w="full"
              colorScheme="cyan"
              whileHover={{ scale: 1.02 }}
            >
              Back
            </MotionButton>
          )}
        </MotionBox>
      </Box>
    </Box>
  );
};

export default CheckoutPage;
