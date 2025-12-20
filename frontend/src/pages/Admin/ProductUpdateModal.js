// src/pages/Admin/ProductUpdateModal.js

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  HStack,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Text,
  Image,
  Badge,
  Tag,
  TagLabel,
  TagCloseButton,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import axios from "axios";
import {
  FaSave,
  FaInfoCircle,
  FaImages,
  FaPalette,
  FaUpload,
  FaRulerCombined,
} from "react-icons/fa";

const API_BASE_URL = "https://raosahab-api.onrender.com";

const ProductUpdateModal = ({
  isOpen,
  onClose,
  user,
  productData,
  onProductUpdated,
}) => {
  // Basic Info
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState(0);
  const [categoriesList, setCategoriesList] = useState([]);

  // Images
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // 🟢 Size Chart
  const [sizeChart, setSizeChart] = useState(null); // New File
  const [sizeChartPreview, setSizeChartPreview] = useState(""); // Preview
  const [existingSizeChart, setExistingSizeChart] = useState(""); // Old URL

  // Variants
  const [sizeInput, setSizeInput] = useState("");
  const [sizes, setSizes] = useState([]);
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");
  const [selectedColorImageIndex, setSelectedColorImageIndex] = useState(0);
  const [colors, setColors] = useState([]);

  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const bg = useColorModeValue("gray.50", "gray.800");

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/categories`)
      .then((res) => setCategoriesList(res.data))
      .catch((e) => console.log(e));

    if (productData) {
      setName(productData.name || "");
      setPrice(productData.price || 0);
      setDescription(productData.description || "");
      setCategory(productData.category || "");
      setCountInStock(productData.countInStock || 0);

      const currentImages = productData.images || [productData.imageUrl];
      setExistingImages(currentImages);
      setImagePreviews(currentImages);

      // 🟢 Load Existing Size Chart
      if (productData.sizeChart) {
        setExistingSizeChart(productData.sizeChart);
        setSizeChartPreview(productData.sizeChart);
      } else {
        setExistingSizeChart("");
        setSizeChartPreview("");
      }

      setSizes(productData.sizes || []);
      setColors(productData.colors || []);
    }
  }, [productData]);

  // Handlers
  const handleImageSelect = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // 🟢 Size Chart File Handler
  const handleSizeChartSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSizeChart(file);
      setSizeChartPreview(URL.createObjectURL(file));
    }
  };

  const handleAddSize = () => {
    if (sizeInput && !sizes.includes(sizeInput)) {
      setSizes([...sizes, sizeInput.toUpperCase()]);
      setSizeInput("");
    }
  };
  const removeSize = (s) => setSizes(sizes.filter((size) => size !== s));
  const handleAddColor = () => {
    if (colorName) {
      setColors([
        ...colors,
        { name: colorName, hex: colorHex, imageIndex: selectedColorImageIndex },
      ]);
      setColorName("");
      setColorHex("#000000");
    }
  };
  const removeColor = (cName) =>
    setColors(colors.filter((c) => c.name !== cName));

  // Update Submit
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadConfig = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`,
        },
      };

      // 1. Upload New Product Images
      let finalImageUrls = [...existingImages];
      if (images.length > 0) {
        const uploadFormData = new FormData();
        images.forEach((image) => uploadFormData.append("images", image));
        const { data } = await axios.post(
          `${API_BASE_URL}/api/upload`,
          uploadFormData,
          uploadConfig
        );
        finalImageUrls = [...finalImageUrls, ...data];
      }

      // 🟢 2. Upload New Size Chart
      let finalSizeChartUrl = existingSizeChart;
      if (sizeChart) {
        const chartFormData = new FormData();
        chartFormData.append("images", sizeChart);
        const { data } = await axios.post(
          `${API_BASE_URL}/api/upload`,
          chartFormData,
          uploadConfig
        );
        finalSizeChartUrl = data[0];
      }

      const finalColors = colors.map((c) => ({
        name: c.name,
        hex: c.hex,
        image: finalImageUrls[c.imageIndex] || finalImageUrls[0],
      }));

      const updatedData = {
        name,
        price,
        description,
        category,
        countInStock,
        images: finalImageUrls,
        sizeChart: finalSizeChartUrl, // 🟢 Save URL
        sizes,
        colors: finalColors,
      };

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.put(
        `${API_BASE_URL}/api/products/${productData._id}`,
        updatedData,
        config
      );

      toast({ title: "Updated!", status: "success" });
      onClose();
      onProductUpdated();
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl" overflow="hidden">
        <ModalHeader bg="orange.500" color="white">
          Edit Product
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody p={0} bg={bg}>
          <Tabs isFitted variant="enclosed" colorScheme="orange">
            <TabList mb="1em" bg="white">
              <Tab
                _selected={{
                  color: "orange.500",
                  bg: "orange.50",
                  borderBottom: "2px solid",
                }}
              >
                <HStack>
                  <FaInfoCircle />
                  <Text>Basic Info</Text>
                </HStack>
              </Tab>
              <Tab
                _selected={{
                  color: "orange.500",
                  bg: "orange.50",
                  borderBottom: "2px solid",
                }}
              >
                <HStack>
                  <FaImages />
                  <Text>Images</Text>
                </HStack>
              </Tab>
              <Tab
                _selected={{
                  color: "orange.500",
                  bg: "orange.50",
                  borderBottom: "2px solid",
                }}
              >
                <HStack>
                  <FaPalette />
                  <Text>Variants</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels p={6}>
              {/* TAB 1 */}
              <TabPanel>
                <VStack spacing={5}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="bold">Name</FormLabel>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      bg="white"
                    />
                  </FormControl>
                  <SimpleGrid columns={2} spacing={5} w="full">
                    <FormControl isRequired>
                      <FormLabel fontWeight="bold">Category</FormLabel>
                      <Select
                        placeholder="Select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        bg="white"
                      >
                        {categoriesList.map((cat) => (
                          <option key={cat._id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontWeight="bold">Stock</FormLabel>
                      <NumberInput
                        min={0}
                        value={countInStock}
                        onChange={(v) => setCountInStock(v)}
                        bg="white"
                      >
                        <NumberInputField />
                      </NumberInput>
                    </FormControl>
                  </SimpleGrid>
                  <FormControl isRequired>
                    <FormLabel fontWeight="bold">Price</FormLabel>
                    <NumberInput
                      min={0}
                      value={price}
                      onChange={(v) => setPrice(v)}
                      bg="white"
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontWeight="bold">Description</FormLabel>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      bg="white"
                      rows={5}
                    />
                  </FormControl>
                </VStack>
              </TabPanel>

              {/* TAB 2: IMAGES & SIZE CHART */}
              <TabPanel>
                <VStack spacing={6} align="start">
                  <Box w="full">
                    <FormLabel fontWeight="bold">Product Images</FormLabel>
                    <Box
                      w="full"
                      border="2px dashed"
                      borderColor="gray.300"
                      borderRadius="md"
                      p={6}
                      textAlign="center"
                      bg="white"
                      cursor="pointer"
                      position="relative"
                    >
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        height="100%"
                        width="100%"
                        position="absolute"
                        top="0"
                        left="0"
                        opacity="0"
                        cursor="pointer"
                      />
                      <FaUpload
                        size="24px"
                        color="gray"
                        style={{ margin: "auto" }}
                      />
                      <Text fontSize="sm" color="gray.500">
                        Upload New Images
                      </Text>
                    </Box>
                    <HStack mt={3} spacing={4} wrap="wrap">
                      {imagePreviews.map((src, i) => (
                        <Box
                          key={i}
                          position="relative"
                          borderRadius="md"
                          overflow="hidden"
                          boxShadow="md"
                          border="1px solid #eee"
                        >
                          <Image src={src} boxSize="80px" objectFit="cover" />
                          <Badge
                            position="absolute"
                            top="0"
                            left="0"
                            colorScheme="orange"
                          >
                            Img {i}
                          </Badge>
                        </Box>
                      ))}
                    </HStack>
                  </Box>

                  <Divider />

                  {/* 🟢 Size Chart Update */}
                  <Box w="full">
                    <FormLabel fontWeight="bold">
                      <HStack>
                        <FaRulerCombined />
                        <Text>Size Chart</Text>
                      </HStack>
                    </FormLabel>
                    <Box
                      w="full"
                      border="2px dashed"
                      borderColor="gray.300"
                      borderRadius="md"
                      p={4}
                      textAlign="center"
                      bg="white"
                      cursor="pointer"
                      position="relative"
                    >
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleSizeChartSelect}
                        height="100%"
                        width="100%"
                        position="absolute"
                        top="0"
                        left="0"
                        opacity="0"
                        cursor="pointer"
                      />
                      <VStack spacing={1}>
                        <FaUpload size="20px" color="orange" />
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">
                          {sizeChart ? "Change Chart" : "Update Size Guide"}
                        </Text>
                      </VStack>
                    </Box>
                    {sizeChartPreview && (
                      <Box
                        mt={3}
                        borderRadius="md"
                        overflow="hidden"
                        border="1px solid orange"
                      >
                        <Image
                          src={sizeChartPreview}
                          maxH="150px"
                          objectFit="contain"
                        />
                      </Box>
                    )}
                  </Box>
                </VStack>
              </TabPanel>

              {/* TAB 3: VARIANTS */}
              <TabPanel>
                <VStack spacing={8} align="stretch">
                  <Box p={4} bg="white" borderRadius="md" boxShadow="sm">
                    <FormLabel fontWeight="bold">Sizes</FormLabel>
                    <HStack>
                      <Input
                        placeholder="e.g. XL"
                        value={sizeInput}
                        onChange={(e) => setSizeInput(e.target.value)}
                        w="200px"
                      />
                      <Button
                        size="sm"
                        onClick={handleAddSize}
                        colorScheme="orange"
                      >
                        Add
                      </Button>
                    </HStack>
                    <HStack mt={3} wrap="wrap">
                      {sizes.map((s, i) => (
                        <Tag
                          key={i}
                          size="lg"
                          borderRadius="full"
                          variant="solid"
                          colorScheme="orange"
                        >
                          <TagLabel>{s}</TagLabel>
                          <TagCloseButton onClick={() => removeSize(s)} />
                        </Tag>
                      ))}
                    </HStack>
                  </Box>
                  <Box p={4} bg="white" borderRadius="md" boxShadow="sm">
                    <FormLabel fontWeight="bold">Colors</FormLabel>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <Input
                        placeholder="Color Name"
                        value={colorName}
                        onChange={(e) => setColorName(e.target.value)}
                      />
                      <HStack>
                        <Input
                          type="color"
                          value={colorHex}
                          onChange={(e) => setColorHex(e.target.value)}
                          w="50px"
                          p={0}
                        />
                        <Text fontSize="sm">Hex</Text>
                      </HStack>
                      <Select
                        placeholder="Link Image"
                        onChange={(e) =>
                          setSelectedColorImageIndex(Number(e.target.value))
                        }
                      >
                        {imagePreviews.map((_, i) => (
                          <option key={i} value={i}>
                            Image {i}
                          </option>
                        ))}
                      </Select>
                    </SimpleGrid>
                    <Button
                      mt={3}
                      size="sm"
                      onClick={handleAddColor}
                      colorScheme="purple"
                      w="full"
                    >
                      Add Variant
                    </Button>
                    <HStack mt={4} wrap="wrap">
                      {colors.map((c, i) => (
                        <Tag
                          key={i}
                          size="lg"
                          borderRadius="full"
                          variant="outline"
                          colorScheme="purple"
                          p={2}
                        >
                          <Box
                            w="16px"
                            h="16px"
                            bg={c.hex}
                            borderRadius="full"
                            mr={2}
                            border="1px solid black"
                          />
                          <TagLabel>{c.name}</TagLabel>
                          <TagCloseButton onClick={() => removeColor(c.name)} />
                        </Tag>
                      ))}
                    </HStack>
                  </Box>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter bg="gray.50">
          <Button onClick={onClose} mr={3} variant="ghost">
            Cancel
          </Button>
          <Button
            colorScheme="green"
            leftIcon={<FaSave />}
            onClick={submitHandler}
            isLoading={loading}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProductUpdateModal;
