// src/pages/Admin/BannerManager.js

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
import { FaTrash, FaPlus, FaImages, FaCamera } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "https://raosahab-api.onrender.com";

const BannerManager = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [banners, setBanners] = useState([]);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);

  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Fetch Banners
  const fetchBanners = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/banners`);
      setBanners(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdd = async () => {
    if (!image) {
      toast({ title: "Image is required", status: "warning" });
      return;
    }

    setAddLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      // 1. Upload Image
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

      // 2. Create Banner
      await axios.post(
        `${API_BASE_URL}/api/banners`,
        {
          image: imageUrls[0],
          title,
          link,
        },
        config
      );

      toast({ title: "Banner Added", status: "success" });
      setTitle("");
      setLink("");
      setImage(null);
      setImagePreview("");
      fetchBanners();
    } catch (error) {
      toast({ title: "Error", status: "error" });
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${API_BASE_URL}/api/banners/${id}`, config);
      fetchBanners();
      toast({ title: "Deleted", status: "info" });
    } catch (error) {
      toast({ title: "Error", status: "error" });
    }
  };

  return (
    <Box
      p={{ base: 4, md: 6 }}
      bg={bg}
      borderRadius="xl"
      boxShadow="sm"
      border="1px solid"
      borderColor={borderColor}
      maxW="800px"
      mx="auto"
    >
      <Flex align="center" mb={6} gap={3}>
        <Box p={2} bg="purple.50" borderRadius="md" color="purple.500">
          <FaImages size="20px" />
        </Box>
        <Heading size="md">Home Banners</Heading>
      </Flex>

      {/* Add Form */}
      <Box p={4} borderWidth="1px" borderRadius="lg" mb={6} bg="gray.50">
        <VStack spacing={4}>
          <Stack direction={{ base: "column", md: "row" }} w="full" spacing={4}>
            <FormControl>
              <FormLabel fontSize="xs">Title (Optional)</FormLabel>
              <Input
                bg="white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Diwali Sale"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs">Link URL (Optional)</FormLabel>
              <Input
                bg="white"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="e.g. /collections/winter"
              />
            </FormControl>
          </Stack>
          <Stack
            direction={{ base: "column", sm: "row" }}
            w="full"
            justify="space-between"
            align="end"
          >
            <Button
              as="label"
              leftIcon={<FaCamera />}
              size="sm"
              cursor="pointer"
              variant="outline"
            >
              Upload Banner (16:9)
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageSelect}
              />
            </Button>
            {imagePreview && (
              <Image src={imagePreview} h="40px" borderRadius="md" />
            )}
            <Button
              colorScheme="purple"
              onClick={handleAdd}
              isLoading={addLoading}
              size="sm"
            >
              Add Banner
            </Button>
          </Stack>
        </VStack>
      </Box>

      <Divider mb={4} />

      {/* List */}
      {loading ? (
        <Spinner />
      ) : (
        <VStack align="stretch" spacing={4}>
          {banners.map((banner) => (
            <Box
              key={banner._id}
              position="relative"
              borderRadius="lg"
              overflow="hidden"
              border="1px solid"
              borderColor="gray.200"
            >
              <Image
                src={banner.image}
                w="full"
                h={{ base: "120px", md: "200px" }}
                objectFit="cover"
              />
              <Box
                position="absolute"
                bottom={0}
                left={0}
                w="full"
                bg="rgba(0,0,0,0.6)"
                p={2}
                color="white"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Text fontSize="sm" fontWeight="bold">
                  {banner.title || "No Title"}
                </Text>
                <IconButton
                  icon={<FaTrash />}
                  size="xs"
                  colorScheme="red"
                  onClick={() => handleDelete(banner._id)}
                />
              </Box>
            </Box>
          ))}
          {banners.length === 0 && (
            <Text textAlign="center" color="gray.500">
              No banners yet.
            </Text>
          )}
        </VStack>
      )}
    </Box>
  );
};

export default BannerManager;
