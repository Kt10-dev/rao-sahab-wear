// src/pages/Admin/OrderManager.js

import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Badge,
  useToast,
  IconButton,
  Tooltip,
  Input,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Text,
  VStack,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  Tab,
  Flex,
  Spacer,
  Divider,
} from "@chakra-ui/react";
import {
  FaCheck,
  FaTimes,
  FaTruck,
  FaEye,
  FaSearch,
  FaBoxOpen,
  FaShippingFast,
  FaClipboardCheck,
  FaUndoAlt,
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Utility/Loader";
import EmptyState from "../../components/Utility/EmptyState";
import OrderDetailsModal from "./OrderDetailsModal"; // 🟢 Ensure import is correct

const API_BASE_URL = "https://raosahab-api.onrender.com";

const OrderManager = () => {
  const { user } = useAuth();
  const toast = useToast();

  // Data State
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // 🟢 For Return Buttons

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  // Modal States
  const {
    isOpen: isDeliverOpen,
    onOpen: onDeliverOpen,
    onClose: onDeliverClose,
  } = useDisclosure();

  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [awbCode, setAwbCode] = useState("");

  // 1. Fetch Data
  const fetchOrders = async () => {
    try {
      // Don't set loading true on refresh to avoid flickering
      if (orders.length === 0) setLoading(true);

      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_BASE_URL}/api/orders`, config);
      setOrders(data);
      setFilteredOrders(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Filter Logic
  useEffect(() => {
    let result = orders;

    // Tabs Filter
    if (activeTab === 1)
      result = result.filter((o) => !o.isDelivered && !o.isShipped); // Pending
    if (activeTab === 2)
      result = result.filter((o) => o.isShipped && !o.isDelivered); // Shipped
    if (activeTab === 3) result = result.filter((o) => o.isDelivered); // Delivered
    if (activeTab === 4)
      result = result.filter((o) => o.returnStatus === "Requested"); // 🟢 Returns Tab

    // Search Filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o._id.toLowerCase().includes(lowerQuery) ||
          (o.user?.name || "").toLowerCase().includes(lowerQuery) ||
          (o.user?.email || "").toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredOrders(result);
  }, [searchQuery, activeTab, orders]);

  // 3. Handlers
  const handleViewClick = (order) => {
    setSelectedOrder(order);
    onViewOpen();
  };

  const handleDeliveryClick = (order) => {
    setSelectedOrder(order);
    setAwbCode(order.awbCode || "");
    onDeliverOpen();
  };

  // 🟢 Update Delivery Status (Packed/Shipped/Delivered)
  const handleDeliverHandler = async () => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const statusType = awbCode ? "Shipped" : "Delivered";

      await axios.put(
        `${API_BASE_URL}/api/orders/${selectedOrder._id}/status`,
        { status: statusType },
        config
      );

      toast({
        title: "Success",
        description: `Order marked as ${statusType}.`,
        status: "success",
      });
      onDeliverClose();
      fetchOrders();
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    }
  };

  // 🟢 Handle Return (Approve/Reject)
  const handleReturnAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this return?`))
      return;

    setActionLoading(id);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(
        `${API_BASE_URL}/api/orders/${id}/return-handle`,
        { status: action },
        config
      );

      toast({ title: `Return ${action}`, status: "success" });
      fetchOrders();
    } catch (error) {
      toast({
        title: "Action Failed",
        description: error.response?.data?.message,
        status: "error",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Loader message="Loading Orders..." />;
  if (error)
    return <EmptyState title="Error" description={error} iconName="box" />;

  const getStatusBadge = (order) => {
    if (order.isDelivered) return <Badge colorScheme="green">DELIVERED</Badge>;
    if (order.isShipped) return <Badge colorScheme="purple">SHIPPED</Badge>;
    return <Badge colorScheme="orange">PENDING</Badge>;
  };

  return (
    <Box>
      <Heading size="xl" mb={6}>
        Order Management
      </Heading>

      {/* Top Bar */}
      <Flex gap={6} mb={8} wrap="wrap">
        <InputGroup
          w={{ base: "100%", md: "400px" }}
          bg="white"
          borderRadius="md"
        >
          <InputLeftElement pointerEvents="none">
            <FaSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
        <Spacer />
      </Flex>

      {/* Tabs */}
      <Tabs
        variant="soft-rounded"
        colorScheme="cyan"
        onChange={(index) => setActiveTab(index)}
        mb={6}
      >
        <TabList
          overflowX="auto"
          pb={2}
          css={{ "&::-webkit-scrollbar": { display: "none" } }}
        >
          <Tab>
            <HStack>
              <FaBoxOpen />
              <Text>All</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <FaClipboardCheck />
              <Text>Pending</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <FaShippingFast />
              <Text>Shipped</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <FaCheck />
              <Text>Delivered</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <FaUndoAlt />
              <Text>Returns</Text>
            </HStack>
          </Tab>
        </TabList>
      </Tabs>

      {/* 🟢 DESKTOP TABLE */}
      <Box
        bg="white"
        borderRadius="xl"
        boxShadow="sm"
        overflow="hidden"
        border="1px solid"
        borderColor="gray.100"
        display={{ base: "none", md: "block" }}
      >
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th>Order ID</Th>
                <Th>Customer</Th>
                <Th>Date</Th>
                <Th isNumeric>Amount</Th>
                <Th>Payment</Th>
                <Th>Status</Th>
                <Th>Return</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredOrders.length === 0 ? (
                <Tr>
                  <Td colSpan={8} textAlign="center" py={10} color="gray.500">
                    No orders found.
                  </Td>
                </Tr>
              ) : (
                filteredOrders.map((order) => (
                  <Tr key={order._id} _hover={{ bg: "gray.50" }}>
                    <Td fontWeight="bold" fontSize="xs">
                      #{order._id.substring(0, 10).toUpperCase()}
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="xs">
                          {order.user?.name || "Guest"}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {order.user?.email}
                        </Text>
                      </VStack>
                    </Td>
                    <Td fontSize="xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Td>
                    <Td isNumeric fontWeight="bold">
                      ₹{order.totalPrice.toLocaleString()}
                    </Td>
                    <Td>
                      <Badge colorScheme={order.isPaid ? "green" : "red"}>
                        {order.isPaid ? "PAID" : "COD"}
                      </Badge>
                    </Td>
                    <Td>{getStatusBadge(order)}</Td>
                    <Td>
                      {order.returnStatus === "None" && (
                        <Text fontSize="xs" color="gray.400">
                          -
                        </Text>
                      )}
                      {order.returnStatus === "Requested" && (
                        <HStack>
                          <Badge colorScheme="yellow" fontSize="xs">
                            REQ
                          </Badge>
                          <Tooltip label="Approve Return">
                            <IconButton
                              icon={<FaCheck />}
                              size="xs"
                              colorScheme="green"
                              onClick={() =>
                                handleReturnAction(order._id, "Approved")
                              }
                              isLoading={actionLoading === order._id}
                            />
                          </Tooltip>
                          <Tooltip label="Reject Return">
                            <IconButton
                              icon={<FaTimes />}
                              size="xs"
                              colorScheme="red"
                              onClick={() =>
                                handleReturnAction(order._id, "Rejected")
                              }
                              isLoading={actionLoading === order._id}
                            />
                          </Tooltip>
                        </HStack>
                      )}
                      {order.returnStatus === "Approved" && (
                        <Badge colorScheme="green" fontSize="xs">
                          RETURNED
                        </Badge>
                      )}
                      {order.returnStatus === "Rejected" && (
                        <Badge colorScheme="red" fontSize="xs">
                          REJECTED
                        </Badge>
                      )}
                    </Td>
                    <Td>
                      <HStack>
                        <Tooltip label="View">
                          <IconButton
                            icon={<FaEye />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleViewClick(order)}
                          />
                        </Tooltip>
                        {!order.isDelivered && (
                          <Tooltip label="Update Status">
                            <IconButton
                              icon={<FaTruck />}
                              size="sm"
                              colorScheme="purple"
                              variant="solid"
                              onClick={() => handleDeliveryClick(order)}
                            />
                          </Tooltip>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      {/* 🟢 MOBILE CARDS */}
      <VStack
        display={{ base: "flex", md: "none" }}
        align="stretch"
        spacing={4}
      >
        {filteredOrders.length === 0 ? (
          <Text textAlign="center" color="gray.500">
            No orders found.
          </Text>
        ) : (
          filteredOrders.map((order) => (
            <Box
              key={order._id}
              p={5}
              bg="white"
              borderRadius="lg"
              borderWidth="1px"
              boxShadow="sm"
            >
              <Flex justify="space-between" mb={2}>
                <Text fontWeight="bold">
                  #{order._id.substring(0, 10).toUpperCase()}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </Text>
              </Flex>
              <Divider mb={3} />
              <Flex justify="space-between" align="start" mb={3}>
                <Box>
                  <Text fontSize="sm" fontWeight="bold">
                    {order.user?.name || "Guest"}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {order.user?.email}
                  </Text>
                </Box>
                <Text fontWeight="extrabold" color="green.600">
                  ₹{order.totalPrice.toLocaleString()}
                </Text>
              </Flex>
              <Flex gap={2} mb={4} wrap="wrap">
                <Badge colorScheme={order.isPaid ? "green" : "red"}>
                  {order.isPaid ? "PAID" : "COD"}
                </Badge>
                {getStatusBadge(order)}
                {order.returnStatus === "Requested" && (
                  <Badge colorScheme="yellow">RETURN REQ</Badge>
                )}
                {order.returnStatus === "Approved" && (
                  <Badge colorScheme="green">RETURNED</Badge>
                )}
              </Flex>
              {order.returnStatus === "Requested" && (
                <HStack
                  mb={4}
                  bg="orange.50"
                  p={2}
                  borderRadius="md"
                  justify="space-between"
                >
                  <Text fontSize="xs" fontWeight="bold" color="orange.800">
                    Return Requested
                  </Text>
                  <HStack>
                    <Button
                      size="xs"
                      colorScheme="green"
                      leftIcon={<FaCheck />}
                      onClick={() => handleReturnAction(order._id, "Approved")}
                      isLoading={actionLoading === order._id}
                    >
                      Approve
                    </Button>
                    <Button
                      size="xs"
                      colorScheme="red"
                      leftIcon={<FaTimes />}
                      onClick={() => handleReturnAction(order._id, "Rejected")}
                      isLoading={actionLoading === order._id}
                    >
                      Reject
                    </Button>
                  </HStack>
                </HStack>
              )}
              <HStack w="full" spacing={3}>
                <Button
                  flex={1}
                  size="sm"
                  leftIcon={<FaEye />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => handleViewClick(order)}
                >
                  View
                </Button>
                {!order.isDelivered && (
                  <Button
                    flex={1}
                    size="sm"
                    leftIcon={<FaTruck />}
                    colorScheme="purple"
                    onClick={() => handleDeliveryClick(order)}
                  >
                    Update
                  </Button>
                )}
              </HStack>
            </Box>
          ))
        )}
      </VStack>

      {/* Update Status Modal (Quick Action) */}
      <Modal isOpen={isDeliverOpen} onClose={onDeliverClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Update status for Order{" "}
              <strong>#{selectedOrder?._id.substring(0, 10)}</strong>
            </Text>
            <Text fontSize="sm" fontWeight="bold" mb={2}>
              Tracking ID / AWB (Optional):
            </Text>
            <Input
              placeholder="e.g. SHIP123456"
              value={awbCode}
              onChange={(e) => setAwbCode(e.target.value)}
            />
            <Text fontSize="xs" color="gray.500" mt={2}>
              * Entering AWB marks as <strong>SHIPPED</strong>.<br /> Leaving
              empty marks as <strong>DELIVERED</strong>.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeliverClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleDeliverHandler}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 🟢 FIX: Prop name matched with OrderDetailsModal */}
      <OrderDetailsModal
        isOpen={isViewOpen}
        onClose={onViewClose}
        order={selectedOrder}
        onOrderUpdated={fetchOrders} // 🟢 CHANGED from onUpdate to onOrderUpdated
      />
    </Box>
  );
};

export default OrderManager;
