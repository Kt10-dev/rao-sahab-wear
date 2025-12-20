// src/pages/Admin/DashboardHome.js

import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Flex,
  Text,
  Skeleton,
} from "@chakra-ui/react";
import {
  FaChartLine,
  FaBoxOpen,
  FaUsers,
  FaClipboardCheck,
  FaArrowUp,
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE_URL = "https://raosahab-api.onrender.com";

const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch Real Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        // Parallel API calls for speed
        const [ordersRes, usersRes, productsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/orders`, config),
          axios.get(`${API_BASE_URL}/api/users`, config),
          axios.get(`${API_BASE_URL}/api/products`),
        ]);

        const orders = ordersRes.data;
        const totalRevenue = orders.reduce(
          (acc, order) => acc + (order.isPaid ? order.totalPrice : 0),
          0
        );

        setStats({
          totalOrders: orders.length,
          totalUsers: usersRes.data.length,
          totalProducts:
            productsRes.data.length || productsRes.data.products.length, // Handle pagination structure
          totalRevenue: totalRevenue,
        });
        setLoading(false);
      } catch (error) {
        console.error("Stats fetch failed", error);
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.token]);

  // Dummy Chart Data (Real data needs aggregation logic on backend)
  const chartData = [
    { name: "Jan", sales: 4000 },
    { name: "Feb", sales: 3000 },
    { name: "Mar", sales: 5000 },
    { name: "Apr", sales: 7000 },
    { name: "May", sales: 6000 },
    { name: "Jun", sales: 8500 },
  ];

  const bg = useColorModeValue("white", "gray.800");
  const statBg = useColorModeValue("blue.50", "gray.700");

  const StatCard = ({ label, value, icon, color }) => (
    <Stat
      p={6}
      bg={bg}
      borderRadius="xl"
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.100"
      position="relative"
      overflow="hidden"
    >
      <Flex justify="space-between" align="center">
        <Box>
          <StatLabel color="gray.500" fontWeight="medium">
            {label}
          </StatLabel>
          <StatNumber fontSize="3xl" fontWeight="bold" mt={1}>
            {loading ? <Skeleton height="30px" w="100px" /> : value}
          </StatNumber>
          <StatHelpText
            mb={0}
            display="flex"
            alignItems="center"
            color="green.500"
          >
            <Icon as={FaArrowUp} mr={1} /> +12%{" "}
            <Text as="span" color="gray.400" ml={1} fontSize="xs">
              vs last month
            </Text>
          </StatHelpText>
        </Box>
        <Box p={3} bg={statBg} borderRadius="lg" color={color}>
          <Icon as={icon} w={8} h={8} />
        </Box>
      </Flex>
    </Stat>
  );

  return (
    <Box>
      <Heading size="lg" mb={2}>
        Dashboard Overview
      </Heading>
      <Text color="gray.500" mb={8}>
        Welcome back, {user.name} 👋
      </Text>

      {/* 1. Key Metrics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={10}>
        <StatCard
          label="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={FaChartLine}
          color="green.500"
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders}
          icon={FaClipboardCheck}
          color="blue.500"
        />
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={FaUsers}
          color="purple.500"
        />
        <StatCard
          label="Total Products"
          value={stats.totalProducts}
          icon={FaBoxOpen}
          color="orange.500"
        />
      </SimpleGrid>

      {/* 2. Analytics Chart */}
      <Box
        bg={bg}
        p={6}
        borderRadius="xl"
        boxShadow="sm"
        border="1px solid"
        borderColor="gray.100"
        mb={10}
      >
        <Heading size="md" mb={6}>
          Sales Overview
        </Heading>
        <Box h="350px" w="100%">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar
                dataKey="sales"
                fill="#3182CE"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* You can add Recent Orders Table here if needed */}
    </Box>
  );
};

export default DashboardHome;
