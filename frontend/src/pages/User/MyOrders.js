import React, { useState, useEffect } from "react";
import {
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Divider,
  Box,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepTitle,
  StepDescription,
  StepSeparator,
  Stepper,
  useDisclosure,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import axios from "axios";
import { FaTruck, FaFilePdf, FaEye } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { Link as RouterLink } from "react-router-dom";
import Loader from "../../components/Utility/Loader";
import EmptyState from "../../components/Utility/EmptyState";

// 🟢 LIVE API URL - सुनिश्चित करें कि यहाँ localhost न हो
const API_BASE_URL = "https://raosahab-api.onrender.com";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

// --- Tracking Modal ---
const TrackingModal = ({ isOpen, onClose, trackingData }) => {
  if (!trackingData) return null;
  const activities =
    trackingData.tracking_data?.shipment_track_activities || [];
  const currentStatus =
    trackingData.tracking_data?.track_status || "Processing";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
      <ModalContent borderRadius="xl" bg="gray.800" color="white">
        <ModalHeader>Tracking Details 🚚</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack align="stretch" spacing={4}>
            <Box
              p={3}
              bg="whiteAlpha.100"
              borderRadius="md"
              border="1px dashed"
              borderColor="cyan.300"
            >
              <Text fontWeight="bold" color="cyan.300">
                Status: {currentStatus}
              </Text>
              <Text fontSize="sm">
                AWB: {trackingData.tracking_data?.awb_code || "N/A"}
              </Text>
            </Box>
            {activities.length > 0 ? (
              <Stepper
                index={activities.length}
                orientation="vertical"
                height="300px"
                gap="0"
              >
                {activities.map((activity, index) => (
                  <Step key={index}>
                    <StepIndicator>
                      <StepStatus
                        complete={<StepIcon />}
                        incomplete={<StepIcon />}
                        active={<StepIcon />}
                      />
                    </StepIndicator>
                    <Box flexShrink="0">
                      <StepTitle fontSize="sm">{activity.activity}</StepTitle>
                      <StepDescription fontSize="xs" color="gray.400">
                        {activity.location} <br />
                        {new Date(activity.date).toLocaleString()}
                      </StepDescription>
                    </Box>
                    <StepSeparator />
                  </Step>
                ))}
              </Stepper>
            ) : (
              <Text textAlign="center" color="gray.500" py={4}>
                Shipment info received. Updates shortly.
              </Text>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// --- Main Component ---
const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [invoiceLoadingId, setInvoiceLoadingId] = useState(null);

  useEffect(() => {
    console.log("USER DATA:", user);
    const fetchOrders = async () => {
      try {
        if (!user || !user.token) return;

        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        console.log(`Fetching from: ${API_BASE_URL}/api/orders/myorders`);

        const { data } = await axios.get(
          `${API_BASE_URL}/api/orders/myorders`,
          config
        );
        setOrders(data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Orders Error:", err);
        setError("Failed to load orders. Please check your connection.");
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  const handleTrackOrder = async (orderId) => {
    setTrackLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        `${API_BASE_URL}/api/orders/${orderId}/track`,
        config
      );
      setTrackingInfo(data);
      onOpen();
    } catch (error) {
      toast({
        title: "Not Shipped Yet",
        description: "Your order is being packed. Check back later.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setTrackLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      setInvoiceLoadingId(orderId);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
        responseType: "blob",
      };
      const { data } = await axios.get(
        `${API_BASE_URL}/api/orders/${orderId}/invoice`,
        config
      );

      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({ title: "Invoice Downloaded", status: "success" });
    } catch (error) {
      toast({ title: "Download Failed", status: "error" });
    } finally {
      setInvoiceLoadingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
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

  if (loading) return <Loader message="Loading orders..." size="md" />;
  if (error)
    return (
      <Box p={10} textAlign="center">
        <Text color="red.400">{error}</Text>
      </Box>
    );

  if (orders.length === 0)
    return (
      <EmptyState
        title="No Orders"
        description="Start shopping!"
        iconName="box"
      />
    );

  return (
    <VStack align="stretch" spacing={6} w="full" px={{ base: 2, md: 0 }}>
      {orders.map((order) => (
        <MotionBox
          key={order._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          p={6}
          borderRadius="2xl"
          bg="rgba(7, 11, 46, 0.73)"
          backdropFilter="blur(18px)"
          border="1px solid rgba(255,255,255,0.2)"
          boxShadow="lg"
          _hover={{ transform: "translateY(-3px)", transition: "0.3s" }}
        >
          <HStack justify="space-between" align="start" mb={4}>
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold" fontSize="lg" color="cyan.300">
                Order #{order._id.substring(0, 10).toUpperCase()}
              </Text>
              <Text fontSize="sm" color="gray.400">
                Placed on: {new Date(order.createdAt).toLocaleDateString()}
              </Text>
            </VStack>
            <Text fontWeight="extrabold" fontSize="xl" color="green.300">
              ₹{order.totalPrice.toLocaleString()}
            </Text>
          </HStack>

          <Divider borderColor="whiteAlpha.200" mb={4} />

          <HStack justify="space-between" flexWrap="wrap" gap={4}>
            <HStack spacing={3}>
              <Badge
                colorScheme={order.isPaid ? "green" : "red"}
                borderRadius="full"
                px={3}
              >
                {order.isPaid ? "PAID" : "NOT PAID"}
              </Badge>

              <Badge
                colorScheme={getStatusColor(order.orderStatus || "Processing")}
                borderRadius="full"
                px={3}
              >
                {order.orderStatus || "Processing"}
              </Badge>
            </HStack>

            <HStack spacing={3}>
              {order.isPaid && (
                <Tooltip label="Download Invoice">
                  <IconButton
                    icon={<FaFilePdf />}
                    colorScheme="red"
                    variant="ghost"
                    size="sm"
                    isLoading={invoiceLoadingId === order._id}
                    onClick={() => handleDownloadInvoice(order._id)}
                  />
                </Tooltip>
              )}

              <MotionButton
                size="sm"
                colorScheme="purple"
                leftIcon={<FaTruck />}
                onClick={() => handleTrackOrder(order._id)}
                isLoading={trackLoading}
                borderRadius="full"
              >
                Track
              </MotionButton>

              <MotionButton
                as={RouterLink}
                to={`/order/${order._id}`}
                size="sm"
                colorScheme="cyan"
                variant="outline"
                leftIcon={<FaEye />}
                borderRadius="full"
              >
                Details
              </MotionButton>
            </HStack>
          </HStack>
        </MotionBox>
      ))}

      <TrackingModal
        isOpen={isOpen}
        onClose={onClose}
        trackingData={trackingInfo}
      />
    </VStack>
  );
};

export default MyOrders;
