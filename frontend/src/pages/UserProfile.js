// src/pages/UserProfile.js

import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Avatar,
  Stack,
  Button,
  Divider,
  useColorModeValue,
  useToast,
  Center,
  Spinner,
  Badge,
  Flex,
} from "@chakra-ui/react";
import {
  FaEdit,
  FaShoppingBag,
  FaUserCircle,
  FaMapMarkedAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Loader from "../components/Utility/Loader";
import EmptyState from "../components/Utility/EmptyState";
import AddressManager from "../components/Profile/AddressManager";

// 🟢 LIVE API URL
const API_BASE_URL = "https://raosahab-api.onrender.com";

// ---------------------------------------------------
// 1. Profile Info Panel
// ---------------------------------------------------
const ProfileInfo = ({ user, handleLogout }) => {
  const cardBg = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue("md", "dark-lg");

  return (
    <VStack
      align="start"
      spacing={4}
      p={{ base: 4, md: 6 }}
      borderRadius="lg"
      bg={cardBg}
      boxShadow={cardShadow}
      w="full"
    >
      <Heading size="md">Personal Information</Heading>
      <Divider />
      <Box w="full">
        <Text fontSize={{ base: "sm", md: "md" }}>
          <strong>Name:</strong> {user?.name || "N/A"}
        </Text>
        <Text fontSize={{ base: "sm", md: "md" }} mt={2}>
          <strong>Email:</strong> {user?.email || "N/A"}
        </Text>
        <Text fontSize={{ base: "sm", md: "md" }} mt={2}>
          <strong>Role:</strong> {user?.role ? user.role.toUpperCase() : "USER"}
        </Text>
      </Box>
      <Divider />

      <Stack direction={{ base: "column", sm: "row" }} spacing={4} w="full">
        <Button
          leftIcon={<FaEdit />}
          colorScheme="blue"
          size="sm"
          w={{ base: "full", sm: "auto" }}
        >
          Edit Profile
        </Button>
        <Button
          leftIcon={<FaSignOutAlt />}
          colorScheme="red"
          size="sm"
          variant="outline"
          onClick={handleLogout}
          w={{ base: "full", sm: "auto" }}
        >
          Logout
        </Button>
      </Stack>
    </VStack>
  );
};

// ---------------------------------------------------
// 2. Order History Panel
// ---------------------------------------------------
const OrderHistory = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cardBg = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue("sm", "dark-lg");
  const hoverBg = useColorModeValue("gray.50", "gray.600");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        const { data } = await axios.get(
          `${API_BASE_URL}/api/orders/myorders`,
          config
        );
        setOrders(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load orders.");
        setLoading(false);
      }
    };

    if (user && user.token) {
      fetchOrders();
    }
  }, [user]);

  if (loading) return <Loader message="Loading your orders..." size="md" />;
  if (error) return <Text color="red.500">{error}</Text>;

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No Orders Yet"
        description="You haven't placed any orders yet. Start shopping!"
        iconName="box"
        ctaText="Browse Products"
        ctaLink="/shop" // 🟢 Fixed Link
      />
    );
  }

  return (
    <VStack align="stretch" spacing={4}>
      <Heading size="md" mb={2}>
        Order History ({orders.length})
      </Heading>

      {orders.map((order) => (
        <Stack
          key={order._id}
          direction={{ base: "column", md: "row" }}
          p={{ base: 4, md: 5 }}
          borderRadius="lg"
          bg={cardBg}
          boxShadow={cardShadow}
          justify="space-between"
          align={{ base: "start", md: "center" }}
          _hover={{
            bg: hoverBg,
            transform: "translateY(-2px)",
            transition: "0.2s",
          }}
          border="1px solid"
          borderColor={useColorModeValue("gray.200", "gray.600")}
          spacing={{ base: 4, md: 0 }}
        >
          <VStack align="start" spacing={1} w="full">
            <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }}>
              Order #{order._id.substring(0, 10).toUpperCase()}...
            </Text>
            <Text fontSize="sm" color="gray.500">
              Placed on:{" "}
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString()
                : "N/A"}
            </Text>
            <Text fontSize="xs" color="gray.400">
              Items: {order.orderItems.length} | Payment:{" "}
              {order.paymentMethod.toUpperCase()}
            </Text>
          </VStack>

          <VStack
            align={{ base: "start", md: "end" }}
            spacing={2}
            w={{ base: "full", md: "auto" }}
          >
            <Text fontWeight="extrabold" fontSize="xl" color="green.600">
              ₹{order.totalPrice.toLocaleString()}
            </Text>

            <Flex gap={2} wrap="wrap">
              <Badge colorScheme={order.isPaid ? "green" : "red"}>
                {order.isPaid ? "PAID" : "NOT PAID"}
              </Badge>
              <Badge colorScheme={order.isDelivered ? "green" : "orange"}>
                {order.isDelivered ? "DELIVERED" : "PROCESSING"}
              </Badge>
            </Flex>

            {/* 🟢 Fixed Link to Order Details */}
            <Button
              as={RouterLink}
              to={`/order/${order._id}`}
              size="xs"
              variant="outline"
              colorScheme="blue"
              w={{ base: "full", md: "auto" }}
            >
              View Details
            </Button>
          </VStack>
        </Stack>
      ))}
    </VStack>
  );
};

// ---------------------------------------------------
// 3. Main UserProfile Page
// ---------------------------------------------------
const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const bg = useColorModeValue("gray.50", "gray.900");

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
    navigate("/login");
  };

  if (!user) {
    return (
      <Center h="80vh" bg={bg}>
        <VStack>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading User Profile...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box
      w="full"
      minH="80vh"
      bg={bg}
      py={{ base: 6, md: 10 }}
      px={{ base: 4, md: 8 }}
    >
      <Box maxW="1200px" mx="auto">
        <Stack
          direction={{ base: "column", md: "row" }}
          spacing={{ base: 4, md: 10 }}
          mb={8}
          align="center"
          justify={{ base: "center", md: "start" }}
          textAlign={{ base: "center", md: "left" }}
        >
          {/* 🟢 Removed broken 'src' to fix 404 error */}
          <Avatar
            size={{ base: "xl", md: "2xl" }}
            name={user?.name}
            boxShadow="lg"
          />
          <Box>
            <Heading as="h1" size={{ base: "lg", md: "xl" }}>
              Hello, {user?.name}!
            </Heading>
            <Text color="gray.500" fontSize={{ base: "sm", md: "md" }}>
              Manage your profile and track your orders.
            </Text>
          </Box>
        </Stack>

        <Tabs isLazy colorScheme="blue" variant="enclosed">
          <TabList
            overflowX="auto"
            overflowY="hidden"
            whiteSpace="nowrap"
            pb={1}
            css={{
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            <Tab>
              <HStack>
                <FaUserCircle /> <Text>Profile</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <FaShoppingBag /> <Text>Orders</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <FaMapMarkedAlt /> <Text>Addresses</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels
            p={{ base: 2, md: 4 }}
            borderWidth="1px"
            borderTop="none"
            borderRadius="lg"
            bg="transparent"
            mt={{ base: 2, md: 0 }}
          >
            <TabPanel px={{ base: 0, md: 4 }}>
              <ProfileInfo user={user} handleLogout={handleLogout} />
            </TabPanel>

            <TabPanel px={{ base: 0, md: 4 }}>
              <OrderHistory user={user} />
            </TabPanel>

            <TabPanel px={{ base: 0, md: 4 }}>
              <AddressManager />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default UserProfile;
