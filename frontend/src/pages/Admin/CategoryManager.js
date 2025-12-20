// src/pages/Admin/CategoryManager.js

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
  Stack,
  Image,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { FaTrash, FaPlus, FaTags, FaCamera } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "https://raosahab-api.onrender.com";

const CategoryManager = () => {
  const { user } = useAuth();
  const toast = useToast();

  // Data State
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [description, setDescription] = useState("");

  // 🟢 Image State (Backend needs this)
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Loading States
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);

  // Colors (Hooks at top level)
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const itemBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const textColor = useColorModeValue("gray.700", "white");
  const descColor = useColorModeValue("gray.500", "gray.400");

  // 1. Fetch Categories
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/categories`);
      setCategories(data);
      setLoading(false);
    } catch (error) {
      toast({ title: "Error fetching categories", status: "error" });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Image Select Handler
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 3. Add Category (Upload Image -> Save Category)
  const handleAdd = async () => {
    if (!newCategory.trim() || !image) {
      toast({ title: "Name and Image are required", status: "warning" });
      return;
    }

    setAddLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      // A. Upload Image first
      const formData = new FormData();
      formData.append("images", image);
      const uploadConfig = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data: imageUrls } = await axios.post(
        `${API_BASE_URL}/api/upload`,
        formData,
        uploadConfig
      );

      // B. Create Category with Image URL
      await axios.post(
        `${API_BASE_URL}/api/categories`,
        {
          name: newCategory,
          description: description,
          image: imageUrls[0], // 🟢 Sending URL
        },
        config
      );

      toast({ title: "Category Added Successfully", status: "success" });

      // Reset Form
      setNewCategory("");
      setDescription("");
      setImage(null);
      setImagePreview("");
      fetchCategories();
    } catch (error) {
      toast({
        title: "Error Adding Category",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
      });
    } finally {
      setAddLoading(false);
    }
  };

  // 4. Delete Category
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${API_BASE_URL}/api/categories/${id}`, config);

      toast({ title: "Category Deleted", status: "info", duration: 2000 });
      fetchCategories();
    } catch (error) {
      toast({ title: "Error Deleting", status: "error" });
    }
  };

  return (
    <Box
      p={{ base: 4, md: 6 }} // 🟢 Responsive Padding
      bg={bg}
      borderRadius="xl"
      boxShadow="sm"
      border="1px solid"
      borderColor={borderColor}
      maxW="800px"
      w={{ base: "95%", md: "full" }} // 🟢 Responsive Width
      mx="auto"
    >
      <Flex align="center" mb={6} gap={3}>
        <Box p={2} bg="blue.50" borderRadius="md" color="blue.500">
          <FaTags size="20px" />
        </Box>
        <Box>
          <Heading size="md">Manage Collections</Heading>
          <Text fontSize="sm" color="gray.500">
            Add categories with images
          </Text>
        </Box>
      </Flex>

      {/* 🟢 ADD FORM SECTION */}
      <Box
        p={4}
        borderWidth="1px"
        borderRadius="lg"
        borderColor="gray.200"
        mb={6}
        bg="gray.50"
      >
        <VStack spacing={4} align="stretch">
          {/* Inputs Row (Stack on mobile) */}
          <Stack direction={{ base: "column", md: "row" }} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="xs" mb={1}>
                Name
              </FormLabel>
              <Input
                bg="white"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Summer Vibes"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs" mb={1}>
                Description
              </FormLabel>
              <Input
                bg="white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Best for beach"
              />
            </FormControl>
          </Stack>

          {/* Image Upload & Button Row (Stack on mobile) */}
          <Stack
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            align="end"
            spacing={4}
          >
            <Flex align="center" gap={3} w={{ base: "full", sm: "auto" }}>
              <Button
                as="label"
                leftIcon={<FaCamera />}
                size="sm"
                cursor="pointer"
                colorScheme="gray"
                variant="outline"
                w="full"
              >
                {image ? "Change Cover" : "Upload Cover"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </Button>
              {imagePreview && (
                <Image
                  src={imagePreview}
                  boxSize="40px"
                  borderRadius="md"
                  objectFit="cover"
                  border="1px solid gray"
                />
              )}
            </Flex>

            <Button
              leftIcon={<FaPlus />}
              colorScheme="blue"
              onClick={handleAdd}
              isLoading={addLoading}
              loadingText="Creating..."
              size="sm"
              w={{ base: "full", sm: "auto" }} // 🟢 Full width button on mobile
            >
              Create Collection
            </Button>
          </Stack>
        </VStack>
      </Box>

      <Divider mb={4} />

      {/* 🟢 CATEGORY LIST */}
      {loading ? (
        <Flex justify="center" py={10}>
          <Spinner color="blue.500" />
        </Flex>
      ) : (
        <VStack
          align="stretch"
          spacing={3}
          maxH="400px"
          overflowY="auto"
          pr={2}
        >
          {categories.length === 0 && (
            <Text color="gray.500" textAlign="center">
              No categories found.
            </Text>
          )}

          {categories.map((cat) => (
            <HStack
              key={cat._id}
              justify="space-between"
              p={3}
              bg={itemBg}
              borderRadius="md"
              border="1px solid"
              borderColor="transparent"
              _hover={{ borderColor: "blue.200", boxShadow: "sm" }}
            >
              <HStack spacing={3}>
                {/* Show Image */}
                <Image
                  src={cat.image || "https://via.placeholder.com/50"}
                  boxSize="50px"
                  borderRadius="md"
                  objectFit="cover"
                />
                <Box>
                  <Text fontWeight="bold" fontSize="sm" color={textColor}>
                    {cat.name}
                  </Text>
                  <Text fontSize="xs" color={descColor}>
                    {cat.description}
                  </Text>
                </Box>
              </HStack>

              <IconButton
                icon={<FaTrash />}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={() => handleDelete(cat._id)}
                aria-label="Delete"
              />
            </HStack>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default CategoryManager;
