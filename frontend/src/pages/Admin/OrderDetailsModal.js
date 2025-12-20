// src/pages/Admin/OrderDetailsModal.js

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  HStack,
  Divider,
  Box,
  Image,
  Badge,
  SimpleGrid,
  useToast,
  Select,
  FormControl,
  Heading,
  Link,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepSeparator,
} from "@chakra-ui/react";
import {
  FaMapMarkerAlt,
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaUndoAlt,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "https://raosahab-api.onrender.com";

// 🟢 Defined Steps for Stepper
const steps = [
  { title: "Processing", value: "Processing" },
  { title: "Packed", value: "Packed" },
  { title: "Shipped", value: "Shipped" },
  { title: "Delivered", value: "Delivered" },
];

const OrderDetailsModal = ({ isOpen, onClose, order, onOrderUpdated }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);

  // 🟢 FIX 1: Initial state logic
  const [currentStatus, setCurrentStatus] = useState(
    order?.orderStatus || "Processing"
  );

  // 🟢 FIX 2: Sync state when 'order' prop changes (Jab modal khule)
  useEffect(() => {
    if (order) {
      setCurrentStatus(order.orderStatus || "Processing");
    }
  }, [order]);

  // Determine Active Step Index for Stepper UI
  const activeStep = steps.findIndex((s) => s.value === currentStatus);

  if (!order) return null;

  // 1. Update Delivery Status (Sequential)
  const updateStatusHandler = async (newStatus) => {
    try {
      setLoading(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.put(
        `${API_BASE_URL}/api/orders/${order._id}/status`,
        { status: newStatus },
        config
      );

      toast({
        title: "Status Updated",
        description: `Order is now ${newStatus}`,
        status: "success",
      });

      setCurrentStatus(newStatus); // Update UI immediately
      if (onOrderUpdated) onOrderUpdated(); // Refresh parent list
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.response?.data?.message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Return Actions
  const handleReturnAction = async (actionStatus) => {
    if (
      !window.confirm(`Are you sure you want to ${actionStatus} this return?`)
    )
      return;

    setReturnLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(
        `${API_BASE_URL}/api/orders/${order._id}/return-handle`,
        { status: actionStatus },
        config
      );

      toast({ title: `Return ${actionStatus}`, status: "success" });
      if (onOrderUpdated) onOrderUpdated();
      onClose();
    } catch (error) {
      toast({
        title: "Action Failed",
        description: error.response?.data?.message,
        status: "error",
      });
    } finally {
      setReturnLoading(false);
    }
  };

  const getStatusColor = (st) => {
    if (st === "Delivered") return "green";
    if (st === "Shipped") return "purple";
    if (st === "Packed") return "blue";
    if (st === "Cancelled") return "red";
    return "orange";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent borderRadius="xl">
        <ModalHeader
          bg="gray.50"
          borderBottom="1px solid"
          borderColor="gray.100"
        >
          <HStack justify="space-between">
            <Text>Order #{order._id.substring(0, 10).toUpperCase()}</Text>
            <HStack>
              <Badge colorScheme={getStatusColor(currentStatus)}>
                {currentStatus}
              </Badge>
            </HStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            {/* 🔴 RETURN REQUEST SECTION */}
            {order.returnStatus === "Requested" && (
              <Box
                p={5}
                bg="orange.50"
                border="1px dashed"
                borderColor="orange.400"
                borderRadius="lg"
              >
                <Heading
                  size="sm"
                  mb={4}
                  color="orange.800"
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <FaUndoAlt /> Return Requested
                </Heading>
                <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>
                  REASON:
                </Text>
                <Text
                  fontSize="sm"
                  mb={4}
                  bg="white"
                  p={3}
                  borderRadius="md"
                  border="1px solid"
                  borderColor="orange.100"
                >
                  {order.returnReason}
                </Text>
                {/* Proof Images */}
                {order.returnImages && order.returnImages.length > 0 && (
                  <Box mb={4}>
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      color="gray.500"
                      mb={2}
                    >
                      PROOF PHOTOS:
                    </Text>
                    <HStack spacing={3}>
                      {order.returnImages.map((img, idx) => (
                        <Link key={idx} href={img} isExternal>
                          <Image
                            src={img}
                            boxSize="80px"
                            objectFit="cover"
                            borderRadius="md"
                            border="2px solid white"
                            boxShadow="sm"
                            _hover={{ transform: "scale(1.1)" }}
                            transition="0.2s"
                          />
                        </Link>
                      ))}
                    </HStack>
                  </Box>
                )}
                <HStack justify="flex-end">
                  <Button
                    size="sm"
                    colorScheme="red"
                    leftIcon={<FaTimes />}
                    onClick={() => handleReturnAction("Rejected")}
                    isLoading={returnLoading}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="green"
                    leftIcon={<FaCheck />}
                    onClick={() => handleReturnAction("Approved")}
                    isLoading={returnLoading}
                  >
                    Approve
                  </Button>
                </HStack>
              </Box>
            )}

            {/* 🟢 ADMIN TRACKER & ACTIONS */}
            {order.returnStatus === "None" && (
              <Box
                p={5}
                borderWidth="1px"
                borderColor="blue.100"
                borderRadius="lg"
                bg="blue.50"
              >
                <Text fontWeight="bold" mb={4} color="blue.700">
                  Order Progress
                </Text>

                {/* Stepper UI */}
                <Stepper index={activeStep} size="sm" colorScheme="blue" mb={6}>
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
                        <StepTitle fontSize="xs">{step.title}</StepTitle>
                      </Box>
                      <StepSeparator />
                    </Step>
                  ))}
                </Stepper>

                {/* Action Buttons Logic */}
                <HStack
                  spacing={3}
                  wrap="wrap"
                  justify="space-between"
                  align="center"
                >
                  <Box>
                    {currentStatus === "Processing" && (
                      <Button
                        leftIcon={<FaBox />}
                        colorScheme="blue"
                        onClick={() => updateStatusHandler("Packed")}
                        isLoading={loading}
                      >
                        Mark as Packed
                      </Button>
                    )}
                    {currentStatus === "Packed" && (
                      <Button
                        leftIcon={<FaTruck />}
                        colorScheme="purple"
                        onClick={() => updateStatusHandler("Shipped")}
                        isLoading={loading}
                      >
                        Mark as Shipped
                      </Button>
                    )}
                    {currentStatus === "Shipped" && (
                      <Button
                        leftIcon={<FaCheckCircle />}
                        colorScheme="green"
                        onClick={() => updateStatusHandler("Delivered")}
                        isLoading={loading}
                      >
                        Mark as Delivered
                      </Button>
                    )}
                    {currentStatus === "Delivered" && (
                      <Text color="green.600" fontWeight="bold">
                        ✅ Order Completed
                      </Text>
                    )}
                  </Box>

                  {/* Manual Override Dropdown */}
                  <FormControl w="150px">
                    <Select
                      size="sm"
                      bg="white"
                      value={currentStatus}
                      onChange={(e) => updateStatusHandler(e.target.value)}
                      isDisabled={loading}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </Select>
                  </FormControl>
                </HStack>
              </Box>
            )}

            <Divider />

            {/* Info Grids (Customer, Address) */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
              <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
                <Text fontWeight="bold" mb={2} color="gray.600">
                  Customer Info
                </Text>
                <Text>
                  <strong>Name:</strong> {order.user?.name}
                </Text>
                <Text>
                  <strong>Email:</strong> {order.user?.email}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  ID: {order.user?._id}
                </Text>
              </Box>
              <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
                <Text fontWeight="bold" mb={2} color="gray.600">
                  Shipping Address
                </Text>
                <Text>
                  {order.shippingAddress.address}, {order.shippingAddress.city}
                </Text>
                <Text>
                  {order.shippingAddress.state} -{" "}
                  {order.shippingAddress.postalCode}
                </Text>
                <Text mt={1}>
                  <strong>Mobile:</strong> {order.shippingAddress.mobile}
                </Text>
                {order.shippingAddress.locationUrl && (
                  <Button
                    as="a"
                    href={order.shippingAddress.locationUrl}
                    target="_blank"
                    size="xs"
                    colorScheme="red"
                    leftIcon={<FaMapMarkerAlt />}
                    mt={2}
                  >
                    Live Location
                  </Button>
                )}
              </Box>
            </SimpleGrid>

            {/* Order Items */}
            <Box>
              <Text fontWeight="bold" mb={3} fontSize="lg">
                Ordered Items
              </Text>
              <VStack spacing={3} align="stretch">
                {order.orderItems.map((item, index) => (
                  <HStack
                    key={index}
                    justify="space-between"
                    p={2}
                    borderWidth="1px"
                    borderRadius="md"
                    bg="white"
                  >
                    <HStack>
                      <Image
                        src={item.image}
                        alt={item.name}
                        boxSize="50px"
                        objectFit="cover"
                        borderRadius="md"
                        fallbackSrc="https://via.placeholder.com/50"
                      />
                      <Box>
                        <Text fontWeight="bold" fontSize="sm">
                          {item.name}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Qty: {item.qty} | Size: {item.size || "N/A"}
                        </Text>
                      </Box>
                    </HStack>
                    <Text fontWeight="bold">₹{item.price * item.qty}</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>

            {/* Total */}
            <HStack
              justify="space-between"
              bg="gray.50"
              p={4}
              borderRadius="md"
            >
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color="gray.500">
                  Payment Method
                </Text>
                <Badge colorScheme={order.isPaid ? "green" : "red"}>
                  {order.isPaid ? "PAID" : "COD"}
                </Badge>
              </VStack>
              <Text fontWeight="bold" fontSize="xl" color="green.600">
                Total: ₹{order.totalPrice}
              </Text>
            </HStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OrderDetailsModal;
