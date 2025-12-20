// src/components/Profile/AddressManager.js

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  IconButton,
  SimpleGrid,
  Badge,
  useColorModeValue,
  Flex,
  Icon,
} from "@chakra-ui/react";
import {
  FaPlus,
  FaTrash,
  FaMapMarkerAlt,
  FaHome,
  FaPhone,
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Loader from "../Utility/Loader";
import EmptyState from "../Utility/EmptyState"; // Assuming you have this component

// 🟢 Import JSON Data
import indiaData from "../../data/states-and-districts.json";

const API_BASE_URL = "https://raosahab-api.onrender.com";

const AddressManager = () => {
  const { user } = useAuth();
  const toast = useToast();

  // UI States
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    district: "",
    postalCode: "",
    country: "India",
  });
  const [districts, setDistricts] = useState([]);

  // Colors
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = "cyan.400";

  // 1. Fetch Addresses
  const fetchAddresses = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        `${API_BASE_URL}/api/users/address`,
        config
      );
      setAddresses(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // 2. Handle State Change
  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    const stateObj = indiaData.states.find((s) => s.state === selectedState);
    const districtList = stateObj ? stateObj.districts : [];
    setFormData({ ...formData, state: selectedState, district: "" });
    setDistricts(districtList);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.id]: e.target.value });

  // 3. Save Address
  const handleSave = async () => {
    if (
      !formData.name ||
      !formData.address ||
      !formData.state ||
      !formData.mobile ||
      !formData.postalCode
    ) {
      toast({ title: "Please fill all required fields", status: "warning" });
      return;
    }

    setSaveLoading(true);
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.post(`${API_BASE_URL}/api/users/address`, formData, config);

      toast({ title: "Address Saved Successfully", status: "success" });
      setIsAdding(false);
      setFormData({
        name: "",
        mobile: "",
        address: "",
        city: "",
        state: "",
        district: "",
        postalCode: "",
        country: "India",
      });
      fetchAddresses();
    } catch (error) {
      toast({
        title: "Error saving address",
        description: error.response?.data?.message,
        status: "error",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  // 4. Delete Address
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${API_BASE_URL}/api/users/address/${id}`, config);
      toast({ title: "Address Deleted", status: "info" });
      fetchAddresses();
    } catch (error) {
      toast({ title: "Error deleting", status: "error" });
    }
  };

  if (loading) return <Loader message="Loading addresses..." size="md" />;

  return (
    <Box w="full">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={2}>
        <Heading size="md" color="cyan.600">
          Saved Addresses
        </Heading>
        {!isAdding && (
          <Button
            leftIcon={<FaPlus />}
            colorScheme="cyan"
            size="sm"
            onClick={() => setIsAdding(true)}
            shadow="md"
          >
            Add New Address
          </Button>
        )}
      </Flex>

      {/* 🟢 ADD FORM */}
      {isAdding ? (
        <Box
          p={6}
          borderWidth="1px"
          borderRadius="xl"
          bg={cardBg}
          boxShadow="lg"
          borderColor={accentColor}
        >
          <Heading size="sm" mb={4} color="gray.500">
            New Address Details
          </Heading>

          <VStack spacing={4} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Full Name</FormLabel>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Rao"
                  focusBorderColor={accentColor}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Mobile Number</FormLabel>
                <Input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  focusBorderColor={accentColor}
                />
              </FormControl>
            </SimpleGrid>

            <FormControl isRequired>
              <FormLabel fontSize="sm">
                Full Address (House No, Building, Street)
              </FormLabel>
              <Textarea
                id="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. Flat 101, Galaxy Apartments, MG Road"
                rows={2}
                focusBorderColor={accentColor}
              />
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">State</FormLabel>
                <Select
                  placeholder="Select State"
                  value={formData.state}
                  onChange={handleStateChange}
                  focusBorderColor={accentColor}
                >
                  {indiaData.states.map((s, i) => (
                    <option key={i} value={s.state}>
                      {s.state}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">District</FormLabel>
                <Select
                  id="district"
                  placeholder="Select District"
                  value={formData.district}
                  onChange={handleChange}
                  isDisabled={!formData.state}
                  focusBorderColor={accentColor}
                >
                  {districts.map((d, i) => (
                    <option key={i} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Pincode</FormLabel>
                <Input
                  id="postalCode"
                  type="number"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="e.g. 400001"
                  focusBorderColor={accentColor}
                />
              </FormControl>
            </SimpleGrid>

            <HStack justify="flex-end" mt={4}>
              <Button variant="ghost" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button
                colorScheme="cyan"
                onClick={handleSave}
                isLoading={saveLoading}
              >
                Save Address
              </Button>
            </HStack>
          </VStack>
        </Box>
      ) : (
        // 🟢 ADDRESS GRID LIST
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {addresses.length === 0 ? (
            <Box gridColumn="1 / -1">
              <EmptyState
                title="No Addresses Found"
                description="Add a new address for faster checkout."
                iconName="map"
              />
            </Box>
          ) : (
            addresses.map((addr) => (
              <Box
                key={addr._id}
                p={5}
                bg={cardBg}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                borderLeft="4px solid"
                borderLeftColor={accentColor}
                boxShadow="sm"
                position="relative"
                transition="transform 0.2s"
                _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              >
                <Flex justify="space-between" align="start">
                  <VStack align="start" spacing={1} w="85%">
                    <HStack mb={1}>
                      <Icon as={FaHome} color="gray.400" />
                      <Text fontWeight="bold" fontSize="md">
                        {addr.name}
                      </Text>
                      <Badge
                        colorScheme="cyan"
                        variant="subtle"
                        fontSize="0.7em"
                      >
                        HOME
                      </Badge>
                    </HStack>

                    <Text color="gray.600" fontSize="sm" lineHeight="tall">
                      {addr.address}, {addr.city}
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      {addr.district}, {addr.state} -{" "}
                      <strong>{addr.postalCode}</strong>
                    </Text>

                    <HStack mt={2} color="gray.500" fontSize="sm">
                      <Icon as={FaPhone} boxSize={3} />
                      <Text>{addr.mobile}</Text>
                    </HStack>
                  </VStack>

                  <IconButton
                    icon={<FaTrash />}
                    colorScheme="red"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(addr._id)}
                    aria-label="Delete Address"
                  />
                </Flex>
              </Box>
            ))
          )}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default AddressManager;
