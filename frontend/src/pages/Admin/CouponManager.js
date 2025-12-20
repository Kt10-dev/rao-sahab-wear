// src/pages/Admin/CouponManager.js

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  IconButton,
  useToast,
  Heading,
  Divider,
  Spinner,
  Flex,
  useColorModeValue,
  Badge,
  SimpleGrid,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { FaTrash, FaPlus, FaTicketAlt } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "https://raosahab-api.onrender.com";

const CouponManager = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [expiry, setExpiry] = useState("");

  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);

  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const fetchCoupons = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_BASE_URL}/api/coupons`, config);
      setCoupons(data);
      setLoading(false);
    } catch (error) {
      toast({ title: "Error fetching coupons", status: "error" });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAdd = async () => {
    if (!code || !discount || !expiry) {
      toast({ title: "Please fill all fields", status: "warning" });
      return;
    }

    setAddLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(
        `${API_BASE_URL}/api/coupons`,
        {
          code: code.toUpperCase(),
          discountPercentage: Number(discount),
          expiryDate: expiry,
        },
        config
      );

      toast({ title: "Coupon Created!", status: "success" });
      setCode("");
      setDiscount("");
      setExpiry("");
      fetchCoupons();
    } catch (error) {
      toast({
        title: error.response?.data?.message || "Error",
        status: "error",
      });
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${API_BASE_URL}/api/coupons/${id}`, config);
      toast({ title: "Coupon Deleted", status: "info" });
      fetchCoupons();
    } catch (error) {
      toast({ title: "Error", status: "error" });
    }
  };

  return (
    <Box
      p={6}
      bg={bg}
      borderRadius="xl"
      boxShadow="sm"
      border="1px solid"
      borderColor={borderColor}
      maxW="800px"
      mx="auto"
    >
      <Flex align="center" mb={6} gap={3}>
        <Box p={2} bg="green.50" borderRadius="md" color="green.500">
          <FaTicketAlt size="20px" />
        </Box>
        <Box>
          <Heading size="md">Manage Coupons</Heading>
          <Text fontSize="sm" color="gray.500">
            Create discount codes for customers
          </Text>
        </Box>
      </Flex>

      {/* Add Form */}
      <SimpleGrid
        columns={{ base: 1, md: 3 }}
        spacing={4}
        mb={6}
        alignItems="end"
      >
        <FormControl>
          <FormLabel fontSize="xs">Code</FormLabel>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. DIWALI20"
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="xs">Discount (%)</FormLabel>
          <Input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="e.g. 20"
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="xs">Expiry Date</FormLabel>
          <Input
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
          />
        </FormControl>
        <Button
          leftIcon={<FaPlus />}
          colorScheme="green"
          onClick={handleAdd}
          isLoading={addLoading}
          w="full"
        >
          Create
        </Button>
      </SimpleGrid>

      <Divider mb={4} />

      {/* List */}
      {loading ? (
        <Spinner />
      ) : (
        <VStack align="stretch" spacing={3} maxH="400px" overflowY="auto">
          {coupons.map((coupon) => (
            <HStack
              key={coupon._id}
              justify="space-between"
              p={3}
              bg="gray.50"
              borderRadius="md"
              border="1px dashed"
              borderColor="gray.300"
            >
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" color="green.600" fontSize="lg">
                  {coupon.code}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                </Text>
              </VStack>
              <HStack>
                <Badge colorScheme="purple" fontSize="md">
                  {coupon.discountPercentage}% OFF
                </Badge>
                <IconButton
                  icon={<FaTrash />}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => handleDelete(coupon._id)}
                />
              </HStack>
            </HStack>
          ))}
          {coupons.length === 0 && (
            <Text textAlign="center" color="gray.500">
              No active coupons.
            </Text>
          )}
        </VStack>
      )}
    </Box>
  );
};

export default CouponManager;
