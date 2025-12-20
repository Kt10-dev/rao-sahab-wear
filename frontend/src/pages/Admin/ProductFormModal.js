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
  Image,
  Box,
  Text,
  HStack,
  NumberInput,
  NumberInputField,
  Tag,
  TagLabel,
  TagCloseButton,
  Select,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import {
  FaUpload,
  FaInfoCircle,
  FaImages,
  FaPalette,
  FaRulerCombined,
} from "react-icons/fa";
import axios from "axios";

const API_BASE_URL = "https://raosahab-api.onrender.com";

const ProductFormModal = ({ isOpen, onClose, user, onProductCreated }) => {
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

  // Size Chart
  const [sizeChart, setSizeChart] = useState(null);
  const [sizeChartPreview, setSizeChartPreview] = useState("");

  // Variants
  const [sizeInput, setSizeInput] = useState("");
  const [sizes, setSizes] = useState([]);
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");
  const [selectedColorImageIndex, setSelectedColorImageIndex] = useState(0);
  const [colors, setColors] = useState([]);

  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Fetch Categories
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/categories`)
      .then((res) => setCategoriesList(res.data))
      .catch((err) => console.log(err));
  }, []);

  // --- Handlers ---

  const handleImageSelect = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

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

  // Submit
  const submitHandler = async (e) => {
    e.preventDefault();

    // Validation
    if (!category) {
      toast({ title: "Please select a category", status: "warning" });
      return;
    }

    setLoading(true);

    try {
      const uploadConfig = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`,
        },
      };

      // 1. Upload Product Images
      let finalImageUrls = [];
      if (images.length > 0) {
        const uploadFormData = new FormData();
        images.forEach((image) => uploadFormData.append("images", image));
        const { data } = await axios.post(
          `${API_BASE_URL}/api/upload`,
          uploadFormData,
          uploadConfig
        );
        finalImageUrls = data;
      }

      // 2. Upload Size Chart
      let sizeChartUrl = "";
      if (sizeChart) {
        const chartFormData = new FormData();
        chartFormData.append("images", sizeChart);
        const { data } = await axios.post(
          `${API_BASE_URL}/api/upload`,
          chartFormData,
          uploadConfig
        );
        sizeChartUrl = data[0];
      }

      const finalColors = colors.map((c) => ({
        name: c.name,
        hex: c.hex,
        image: finalImageUrls[c.imageIndex] || finalImageUrls[0] || "",
      }));

      const productData = {
        name,
        price,
        description,
        category, // 🟢 Ab yahan sahi ID jayegi
        countInStock,
        images: finalImageUrls,
        sizeChart: sizeChartUrl,
        sizes,
        colors: finalColors,
      };

      const createConfig = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.post(
        `${API_BASE_URL}/api/products`,
        productData,
        createConfig
      );

      toast({
        title: "Success",
        description: "Product created successfully!",
        status: "success",
      });
      onClose();
      onProductCreated();

      // Reset
      setImages([]);
      setImagePreviews([]);
      setSizeChart(null);
      setSizeChartPreview("");
      setSizes([]);
      setColors([]);
      setName("");
      setDescription("");
      setPrice(0);
      setCountInStock(0);
      setCategory("");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create product",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const bg = useColorModeValue("gray.50", "gray.800");

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl" overflow="hidden">
        <ModalHeader bg="blue.600" color="white">
          Add New Product
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody p={0} bg={bg}>
          <Tabs isFitted variant="enclosed" colorScheme="blue">
            <TabList mb="1em" bg="white">
              <Tab
                _selected={{
                  color: "blue.500",
                  bg: "blue.50",
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
                  color: "blue.500",
                  bg: "blue.50",
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
                  color: "blue.500",
                  bg: "blue.50",
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
              {/* TAB 1: BASIC INFO */}
              <TabPanel>
                <VStack spacing={5}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="bold">Product Name</FormLabel>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      bg="white"
                    />
                  </FormControl>
                  <SimpleGrid columns={2} spacing={5} w="full">
                    {/* 🟢 FIXED CATEGORY SELECT */}
                    <FormControl isRequired>
                      <FormLabel fontWeight="bold">Category</FormLabel>
                      <Select
                        placeholder="Select Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        bg="white"
                      >
                        {categoriesList.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {" "}
                            {/* ⚠️ Value must be ID */}
                            {cat.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="bold">Stock Quantity</FormLabel>
                      <NumberInput
                        min={0}
                        onChange={(v) => setCountInStock(Number(v))}
                        bg="white"
                      >
                        <NumberInputField />
                      </NumberInput>
                    </FormControl>
                  </SimpleGrid>
                  <FormControl isRequired>
                    <FormLabel fontWeight="bold">Price (₹)</FormLabel>
                    <NumberInput
                      min={0}
                      onChange={(v) => setPrice(Number(v))}
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
                    <FormLabel fontWeight="bold">
                      Product Images (Max 5)
                    </FormLabel>
                    <Box
                      w="full"
                      border="2px dashed"
                      borderColor="gray.300"
                      borderRadius="md"
                      p={6}
                      textAlign="center"
                      bg="white"
                      position="relative"
                      _hover={{ borderColor: "blue.400", bg: "blue.50" }}
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
                      <VStack spacing={2}>
                        <FaUpload size="30px" color="gray" />
                        <Text fontWeight="bold" color="gray.600">
                          Click to Upload Product Images
                        </Text>
                      </VStack>
                    </Box>
                    <HStack mt={3} spacing={4} wrap="wrap">
                      {imagePreviews.map((src, i) => (
                        <Box
                          key={i}
                          borderRadius="md"
                          overflow="hidden"
                          border="1px solid #eee"
                        >
                          <Image src={src} boxSize="80px" objectFit="cover" />
                        </Box>
                      ))}
                    </HStack>
                  </Box>

                  <Divider />

                  <Box w="full">
                    <FormLabel fontWeight="bold">
                      <HStack>
                        <FaRulerCombined />
                        <Text>Size Chart Image</Text>
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
                      position="relative"
                      _hover={{ borderColor: "green.400", bg: "green.50" }}
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
                        <FaUpload size="20px" color="green" />
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">
                          {sizeChart
                            ? "Change Size Chart"
                            : "Upload Size Guide"}
                        </Text>
                      </VStack>
                    </Box>
                    {sizeChartPreview && (
                      <Box
                        mt={3}
                        borderRadius="md"
                        overflow="hidden"
                        border="1px solid green"
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
                    <FormLabel fontWeight="bold">Add Sizes</FormLabel>
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
                        colorScheme="blue"
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
                          colorScheme="blue"
                        >
                          <TagLabel>{s}</TagLabel>
                          <TagCloseButton onClick={() => removeSize(s)} />
                        </Tag>
                      ))}
                    </HStack>
                  </Box>

                  <Box p={4} bg="white" borderRadius="md" boxShadow="sm">
                    <FormLabel fontWeight="bold">
                      Add Colors & Link Image
                    </FormLabel>
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
                            Image {i + 1}
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
            colorScheme="blue"
            onClick={submitHandler}
            isLoading={loading}
          >
            Create Product
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProductFormModal;
