// src/pages/OrderScreen.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Image,
  Badge,
  Button,
  useToast,
  Link,
  Flex,
  Icon,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import {
  FaDownload,
  FaShippingFast,
  FaCheckCircle,
  FaBoxOpen,
  FaArrowLeft,
  FaBox,
  FaTruck,
  FaUndoAlt,
  FaCamera,
  FaTrash,
  FaExclamationCircle,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

// 🟢 Import Live Tracker
import LiveOrderStatus from "../components/Order/LiveOrderStatus";

const API_BASE_URL = "https://raosahab-api.onrender.com";

const OrderScreen = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // Return State
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [returnReason, setReturnReason] = useState("");
  const [returnFiles, setReturnFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [returnLoading, setReturnLoading] = useState(false);

  // 🟢 1. Helper: Fix Capitalization (shipped -> Shipped)
  const capitalizeStatus = (str) => {
    if (!str) return "Processing";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Helper Functions for Icons/Colors
  const getStatusColor = (status) => {
    const s = capitalizeStatus(status);
    switch (s) {
      case "Delivered":
        return "green";
      case "Shipped":
        return "purple";
      case "Packed":
        return "blue";
      case "Cancelled":
        return "red";
      default:
        return "orange";
    }
  };

  const getStatusIcon = (status) => {
    const s = capitalizeStatus(status);
    switch (s) {
      case "Delivered":
        return FaCheckCircle;
      case "Shipped":
        return FaTruck;
      case "Packed":
        return FaBox;
      case "Cancelled":
        return FaExclamationCircle;
      default:
        return FaShippingFast;
    }
  };

  // Fetch Order
  const fetchOrder = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        `${API_BASE_URL}/api/orders/${id}`,
        config
      );
      setOrder(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Order not found");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrder();
    // eslint-disable-next-line
  }, [id, user]);

  // Invoice Download
  const downloadInvoiceHandler = async () => {
    try {
      setInvoiceLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
        responseType: "blob",
      };
      const { data } = await axios.get(
        `${API_BASE_URL}/api/orders/${id}/invoice`,
        config
      );
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: "Invoice Downloaded", status: "success" });
      setInvoiceLoading(false);
    } catch (error) {
      setInvoiceLoading(false);
      toast({ title: "Failed to download invoice", status: "error" });
    }
  };

  // File Handlers
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + returnFiles.length > 3) {
      toast({ title: "Max 3 images allowed", status: "warning" });
      return;
    }
    setReturnFiles([...returnFiles, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviews]);
  };

  const clearFiles = () => {
    setReturnFiles([]);
    setPreviewImages([]);
  };

  // Return Submit
  const handleReturnSubmit = async () => {
    if (!returnReason.trim()) {
      toast({ title: "Reason required", status: "warning" });
      return;
    }
    setReturnLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      let imageUrls = [];

      // Upload Images
      if (returnFiles.length > 0) {
        const formData = new FormData();
        returnFiles.forEach((file) => formData.append("images", file));
        const uploadConfig = {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.post(
          `${API_BASE_URL}/api/upload`,
          formData,
          uploadConfig
        );
        imageUrls = data;
      }

      // Submit Return
      await axios.post(
        `${API_BASE_URL}/api/orders/${id}/return`,
        { reason: returnReason, images: imageUrls },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      toast({
        title: "Return Requested",
        description: "Request sent successfully.",
        status: "success",
      });
      onClose();
      fetchOrder(); // 🟢 Refresh Data Immediately
    } catch (error) {
      toast({
        title: "Request Failed",
        description: error.response?.data?.message,
        status: "error",
      });
    } finally {
      setReturnLoading(false);
    }
  };

  if (loading)
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" color="cyan.400" />
      </Flex>
    );
  if (error)
    return (
      <Box color="white" p={10} textAlign="center">
        <Heading size="md" color="red.400">
          {error}
        </Heading>
      </Box>
    );

  // 🟢 2. SMART STATUS LOGIC (Capitalization Fix)
  // Backend se kuch bhi aaye (packed, PACKED), hum use "Packed" bana denge
  let rawStatus = order.orderStatus || "Processing";
  let displayStatus = capitalizeStatus(rawStatus);

  if (order.isDelivered && displayStatus === "Processing")
    displayStatus = "Delivered";

  // Return Status Override
  if (order.returnStatus !== "None") {
    const returnState = capitalizeStatus(order.returnStatus); // Requested / Approved / Rejected
    displayStatus = `Return ${returnState}`;
  }

  // 🟢 3. TRACKER STATUS (Always Clean)
  const trackerStatus = order.isDelivered
    ? "Delivered"
    : capitalizeStatus(order.orderStatus);

  return (
    <Box
      bgGradient="linear(to-b, #0f0c29, #302b63, #24243e)"
      minH="100vh"
      color="white"
      py={10}
      px={4}
    >
      <Container maxW="1200px">
        <Link as={RouterLink} to="/profile" _hover={{ textDecor: "none" }}>
          <HStack mb={6} color="cyan.300" cursor="pointer">
            <FaArrowLeft />
            <Text>Back to Orders</Text>
          </HStack>
        </Link>

        {/* Header */}
        <Box
          bg="whiteAlpha.100"
          p={6}
          borderRadius="xl"
          backdropFilter="blur(10px)"
          border="1px solid rgba(255,255,255,0.1)"
          mb={8}
        >
          <Flex
            justify="space-between"
            direction={{ base: "column", md: "row" }}
            align="center"
            gap={4}
          >
            <VStack align="start" spacing={1}>
              <Heading size="lg">Order Details</Heading>
              <Text color="gray.400" fontSize="sm">
                ID: <span style={{ color: "#0BC5EA" }}>{order._id}</span>
              </Text>
            </VStack>
            <HStack>
              {order.isPaid && (
                <Button
                  leftIcon={<FaDownload />}
                  colorScheme="cyan"
                  isLoading={invoiceLoading}
                  onClick={downloadInvoiceHandler}
                >
                  Invoice
                </Button>
              )}
            </HStack>
          </Flex>
        </Box>

        {/* 🟢 3D LIVE ORDER TRACKING (Pass Clean Status) */}
        <Box
          bg="whiteAlpha.100"
          p={6}
          borderRadius="xl"
          border="1px solid rgba(255,255,255,0.1)"
          mb={8}
          backdropFilter="blur(10px)"
          boxShadow="0 0 20px rgba(0,0,0,0.3)"
        >
          <Heading
            size="md"
            mb={6}
            color="cyan.300"
            textShadow="0 0 10px rgba(0, 255, 255, 0.6)"
          >
            🚀 Live Status
          </Heading>
          <LiveOrderStatus currentStatus={trackerStatus} />
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
          {/* Items */}
          <Box gridColumn={{ lg: "span 2" }}>
            <Box
              bg="whiteAlpha.100"
              p={6}
              borderRadius="xl"
              border="1px solid rgba(255,255,255,0.1)"
            >
              <Heading size="md" mb={4} color="cyan.200">
                Items
              </Heading>
              {order.orderItems.map((item, index) => (
                <Flex
                  key={index}
                  justify="space-between"
                  align="center"
                  bg="rgba(0,0,0,0.2)"
                  p={3}
                  borderRadius="md"
                  mb={3}
                  gap={4}
                >
                  <HStack spacing={4}>
                    <Image
                      src={item.image}
                      boxSize="70px"
                      objectFit="cover"
                      borderRadius="md"
                      fallbackSrc="https://via.placeholder.com/70"
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">{item.name}</Text>
                      <Text fontSize="xs" color="gray.400">
                        Qty: {item.qty} | Size: {item.size}
                      </Text>
                    </VStack>
                  </HStack>
                  <Text fontWeight="bold" color="green.300">
                    ₹{item.price * item.qty}
                  </Text>
                </Flex>
              ))}
            </Box>
          </Box>

          {/* Status & Actions Card */}
          <VStack align="stretch" spacing={6}>
            <Box
              bg="whiteAlpha.100"
              p={6}
              borderRadius="xl"
              border="1px solid rgba(255,255,255,0.1)"
            >
              <Heading
                size="md"
                mb={4}
                display="flex"
                alignItems="center"
                gap={2}
                color="yellow.300"
              >
                <Icon as={getStatusIcon(displayStatus)} /> Current Status
              </Heading>
              <Badge
                colorScheme={
                  displayStatus.includes("Return")
                    ? displayStatus.includes("Approved")
                      ? "green"
                      : "yellow"
                    : displayStatus === "Delivered"
                    ? "green"
                    : "blue"
                }
                fontSize="lg"
                p={3}
                borderRadius="md"
                w="full"
                textAlign="center"
                mb={3}
              >
                {displayStatus.toUpperCase()}
              </Badge>

              {/* Return Button */}
              {order.isDelivered && order.returnStatus === "None" && (
                <Button
                  leftIcon={<FaUndoAlt />}
                  colorScheme="red"
                  variant="outline"
                  w="full"
                  mt={4}
                  onClick={onOpen}
                >
                  Return Item
                </Button>
              )}
            </Box>
          </VStack>
        </SimpleGrid>
      </Container>

      {/* Return Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(5px)" />
        <ModalContent
          bg="gray.800"
          color="white"
          border="1px solid rgba(255,255,255,0.2)"
        >
          <ModalHeader>Request Return</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm" color="gray.400">
                  Reason for Return
                </FormLabel>
                <Textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="e.g. Defective product..."
                  bg="whiteAlpha.100"
                  border="none"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color="gray.400">
                  Upload Photos (Max 3)
                </FormLabel>
                <HStack>
                  <Button
                    as="label"
                    leftIcon={<FaCamera />}
                    size="sm"
                    colorScheme="blue"
                    cursor="pointer"
                    w="full"
                  >
                    Select Photos
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </Button>
                  {previewImages.length > 0 && (
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={clearFiles}
                      leftIcon={<FaTrash />}
                    >
                      Clear
                    </Button>
                  )}
                </HStack>
                <HStack mt={3} spacing={2}>
                  {previewImages.map((src, idx) => (
                    <Image
                      key={idx}
                      src={src}
                      boxSize="60px"
                      objectFit="cover"
                      borderRadius="md"
                      border="1px solid gray"
                    />
                  ))}
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={onClose}
              colorScheme="whiteAlpha"
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleReturnSubmit}
              isLoading={returnLoading}
            >
              Submit Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default OrderScreen;
