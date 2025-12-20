// src/pages/ProductDetails.js

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  SimpleGrid,
  Image,
  Text,
  Heading,
  Button,
  Select,
  HStack,
  VStack,
  Divider,
  Badge,
  useToast,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Flex,
  IconButton,
  Link,
  FormControl,
  FormLabel,
  Stack,
  useBreakpointValue,
  chakra,
  Textarea,
  Input,
  ModalHeader,
} from "@chakra-ui/react";
import {
  FaShoppingCart,
  FaRulerHorizontal,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaCamera,
  FaBolt,
  FaHeart,
  FaTshirt, // Added for Find My Fit
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

// Utility components
import Loader from "../components/Utility/Loader";
import EmptyState from "../components/Utility/EmptyState";
import Rating from "../components/Utility/Rating";
import ProductCard from "../components/ProductCard/ProductCard";

const API_BASE_URL = "https://raosahab-api.onrender.com";

// Motion Components
const MotionBox = motion.create(Box);
const MotionButton = motion.create(Button);
const MotionImage = motion.create(Image);
const MotionIcon = motion.create(FaHeart);

// --------------------------------------------------
// 🟢 SMART LOGIC: Find My Fit (Data Science Touch)
// --------------------------------------------------
const calculateSize = (height, weight, bodyType) => {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  let size = "M"; // Default

  // BMI Based Classification
  if (bmi < 18.5) size = "S";
  else if (bmi >= 18.5 && bmi < 25) size = "M";
  else if (bmi >= 25 && bmi < 30) size = "L";
  else if (bmi >= 30) size = "XL";

  // Adjustment based on Body Type
  if (bodyType === "Slim") {
    if (size === "M") size = "S";
    else if (size === "L") size = "M";
  } else if (bodyType === "Large" || bodyType === "Athletic") {
    if (size === "S") size = "M";
    else if (size === "M") size = "L";
    else if (size === "L") size = "XL";
  }

  return size;
};

// -----------------------------
// 🟢 COMPONENT: Find My Fit Modal
// -----------------------------
const FindMyFitModal = ({ isOpen, onClose, onApplySize }) => {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bodyType, setBodyType] = useState("Regular");
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    if (!height || !weight) return;
    const recommended = calculateSize(Number(height), Number(weight), bodyType);
    setResult(recommended);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(8px)" />
      <ModalContent
        bg="gray.900"
        color="white"
        borderRadius="2xl"
        border="1px solid"
        borderColor="cyan.400"
      >
        <ModalHeader borderBottomWidth="1px" borderColor="whiteAlpha.200">
          <HStack>
            <FaTshirt color="#0BC5EA" /> <Text>Smart Size Recommendation</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={8}>
          {!result ? (
            <VStack spacing={5}>
              <FormControl>
                <FormLabel fontSize="sm" color="gray.400">
                  Height (in cm)
                </FormLabel>
                <Input
                  type="number"
                  placeholder="e.g. 175"
                  variant="filled"
                  bg="whiteAlpha.100"
                  _focus={{ borderColor: "cyan.400" }}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color="gray.400">
                  Weight (in kg)
                </FormLabel>
                <Input
                  type="number"
                  placeholder="e.g. 70"
                  variant="filled"
                  bg="whiteAlpha.100"
                  _focus={{ borderColor: "cyan.400" }}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color="gray.400">
                  Body Type
                </FormLabel>
                <Select
                  variant="filled"
                  bg="whiteAlpha.100"
                  value={bodyType}
                  onChange={(e) => setBodyType(e.target.value)}
                >
                  <option style={{ background: "#1A202C" }} value="Slim">
                    Slim / Lean
                  </option>
                  <option style={{ background: "#1A202C" }} value="Regular">
                    Regular / Average
                  </option>
                  <option style={{ background: "#1A202C" }} value="Athletic">
                    Athletic / Muscular
                  </option>
                  <option style={{ background: "#1A202C" }} value="Large">
                    Large / Heavy
                  </option>
                </Select>
              </FormControl>
              <Button
                colorScheme="cyan"
                w="full"
                size="lg"
                onClick={handleCalculate}
                isDisabled={!height || !weight}
              >
                Calculate My Size
              </Button>
            </VStack>
          ) : (
            <VStack spacing={6} textAlign="center">
              <Text fontSize="md">Based on our algorithm, we recommend:</Text>
              <Box
                p={6}
                borderRadius="full"
                border="4px solid"
                borderColor="cyan.400"
                w="100px"
                h="100px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Heading size="2xl" color="cyan.300">
                  {result}
                </Heading>
              </Box>
              <VStack w="full" spacing={3}>
                <Button
                  colorScheme="green"
                  w="full"
                  size="lg"
                  onClick={() => {
                    onApplySize(result);
                    onClose();
                  }}
                >
                  Apply This Size
                </Button>
                <Button
                  variant="ghost"
                  color="gray.400"
                  onClick={() => setResult(null)}
                >
                  Recalculate
                </Button>
              </VStack>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// --- Size Chart Modal ---
const SizeChartModal = ({ isOpen, onClose, imageSrc }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
    <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(3px)" />
    <ModalContent>
      <ModalHeader>Size Guide</ModalHeader>
      <ModalCloseButton />
      <ModalBody pb={6} display="flex" justifyContent="center">
        {imageSrc ? (
          <Image
            src={imageSrc}
            maxH="70vh"
            objectFit="contain"
            alt="Size Chart"
          />
        ) : (
          <Text>No size chart available for this product.</Text>
        )}
      </ModalBody>
    </ModalContent>
  </Modal>
);

// --- Magnifier Component (Smooth Zoom) ---
const MagnifierImage = ({ src, zoom = 2.5, previewSize = 450 }) => {
  const [showZoom, setShowZoom] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);

  const handleMove = (e) => {
    const rect = imgRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      setShowZoom(false);
      return;
    }

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setPos({ x: xPercent, y: yPercent });
    setShowZoom(true);
  };

  return (
    <Box position="relative" w="full" h="full">
      <MotionImage
        ref={imgRef}
        src={src}
        w="full"
        h={{ base: "380px", md: "550px" }}
        objectFit="cover"
        borderRadius="2xl"
        onMouseMove={handleMove}
        onMouseLeave={() => setShowZoom(false)}
        onTouchMove={handleMove}
        onTouchEnd={() => setShowZoom(false)}
        alt="Product"
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        boxShadow="0 10px 30px rgba(0,0,0,0.3)"
      />

      {showZoom && (
        <Box
          position="absolute"
          left="105%"
          top="0"
          zIndex={100}
          display={{ base: "none", lg: "block" }}
          w={`${previewSize}px`}
          h={`${previewSize}px`}
          borderRadius="xl"
          overflow="hidden"
          border="2px solid rgba(255,255,255,0.2)"
          boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.7)"
          bg="white"
          backgroundImage={`url(${src})`}
          backgroundRepeat="no-repeat"
          backgroundSize={`${zoom * 100}%`}
          backgroundPosition={`${pos.x}% ${pos.y}%`}
          pointerEvents="none"
        />
      )}
    </Box>
  );
};

// --- Zoom Modal ---
const ZoomModal = ({ isOpen, onClose, currentImage, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentImage && images && images.length > 0) {
      const idx = images.indexOf(currentImage);
      setCurrentIndex(idx >= 0 ? idx : 0);
    }
  }, [currentImage, images, isOpen]);

  if (!images || images.length === 0) return null;

  const handleNext = () =>
    setCurrentIndex((p) => (p === images.length - 1 ? 0 : p + 1));
  const handlePrev = () =>
    setCurrentIndex((p) => (p === 0 ? images.length - 1 : p - 1));

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
      <ModalOverlay bg="blackAlpha.900" backdropFilter="blur(10px)" />
      <ModalContent bg="transparent" boxShadow="none" p={0}>
        <ModalCloseButton
          color="white"
          zIndex={90}
          size="lg"
          _hover={{ bg: "whiteAlpha.200" }}
        />
        <Flex align="center" justify="center" h="100vh" w="100%" px={6}>
          <IconButton
            icon={<FaChevronLeft />}
            onClick={handlePrev}
            variant="ghost"
            size="lg"
            color="white"
            mr={6}
            zIndex={80}
            _hover={{ bg: "whiteAlpha.200" }}
          />
          <MotionBox
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            maxW={{ base: "95%", md: "85%" }}
            maxH="90vh"
          >
            <Image
              src={images[currentIndex]}
              alt="Zoomed"
              objectFit="contain"
              maxH="85vh"
              borderRadius="lg"
              boxShadow="2xl"
            />
          </MotionBox>
          <IconButton
            icon={<FaChevronRight />}
            onClick={handleNext}
            variant="ghost"
            size="lg"
            color="white"
            ml={6}
            zIndex={80}
            _hover={{ bg: "whiteAlpha.200" }}
          />
        </Flex>
      </ModalContent>
    </Modal>
  );
};

// --- Review Image Modal ---
const ReviewImageModal = ({ isOpen, onClose, imgSrc }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
    <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(4px)" />
    <ModalContent bg="transparent" boxShadow="none">
      <ModalCloseButton
        color="white"
        size="lg"
        bg="blackAlpha.400"
        borderRadius="full"
      />
      <ModalBody p={0} display="flex" justifyContent="center">
        <Image
          src={imgSrc}
          maxH="85vh"
          maxW="95vw"
          borderRadius="lg"
          boxShadow="xl"
        />
      </ModalBody>
    </ModalContent>
  </Modal>
);

// --------------------------------------------------
// Main ProductDetails Component
// --------------------------------------------------
const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isReviewImgOpen,
    onOpen: onReviewImgOpen,
    onClose: onReviewImgClose,
  } = useDisclosure();
  const [previewReviewImage, setPreviewReviewImage] = useState("");

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    isOpen: isSizeChartOpen,
    onOpen: onSizeChartOpen,
    onClose: onSizeChartClose,
  } = useDisclosure();

  // 🟢 Find My Fit Disclosure
  const {
    isOpen: isFitOpen,
    onOpen: onFitOpen,
    onClose: onFitClose,
  } = useDisclosure();

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewImage, setReviewImage] = useState(null);
  const [reviewImagePreview, setReviewImagePreview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Wishlist & Animation States
  const [isLiked, setIsLiked] = useState(false);
  const [showBigHeart, setShowBigHeart] = useState(false);

  const sliderRef = useRef(null);
  const mobileSticky = useBreakpointValue({ base: true, md: false });

  // Instagram Style Double Tap Animation
  const handleDoubleClick = (e) => {
    e.preventDefault();
    if (!isLiked) setIsLiked(true);

    if (showBigHeart) {
      setShowBigHeart(false);
      setTimeout(() => setShowBigHeart(true), 50);
    } else {
      setShowBigHeart(true);
    }

    setTimeout(() => {
      setShowBigHeart(false);
    }, 800);
  };

  const handleLikeButton = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE_URL}/api/products/${id}`);
        setProduct(data);

        let initialImg = "https://via.placeholder.com/800x800";
        if (data.images && data.images.length > 0) {
          const firstImg = data.images[0];
          initialImg = typeof firstImg === "object" ? firstImg.url : firstImg;
        } else if (data.imageUrl) initialImg = data.imageUrl;

        setSelectedImage(initialImg);

        if (data.colors && data.colors.length > 0)
          setSelectedColor(data.colors[0].name);
        if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);

        try {
          const { data: relatedData } = await axios.get(
            `${API_BASE_URL}/api/products/${id}/related`
          );
          setRelatedProducts(relatedData);
        } catch (err) {
          console.error(err);
        }

        setLoading(false);
      } catch (err) {
        setError("Product not found.");
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  const handleColorClick = (colorObj) => {
    setSelectedColor(colorObj.name);
    if (colorObj.image) setSelectedImage(colorObj.image);
  };

  const slideLeft = () =>
    sliderRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  const slideRight = () =>
    sliderRef.current?.scrollBy({ left: 320, behavior: "smooth" });

  const handleReviewImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReviewImage(file);
      setReviewImagePreview(URL.createObjectURL(file));
    }
  };

  const openReviewImage = (src) => {
    setPreviewReviewImage(src);
    onReviewImgOpen();
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast({ title: "Select a Rating", status: "warning" });
      return;
    }
    setReviewLoading(true);
    try {
      let imageUrl = "";
      if (reviewImage) {
        const formData = new FormData();
        formData.append("images", reviewImage);
        const uploadConfig = {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.post(
          `${API_BASE_URL}/api/upload`,
          formData,
          uploadConfig
        );
        imageUrl = data[0];
      }
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.post(
        `${API_BASE_URL}/api/products/${id}/reviews`,
        { rating, comment, image: imageUrl },
        config
      );
      toast({ title: "Review Submitted", status: "success" });
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message,
        status: "error",
      });
    } finally {
      setReviewLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (
      (product.sizes?.length > 0 && !selectedSize) ||
      (product.colors?.length > 0 && !selectedColor)
    ) {
      toast({
        title: "Please select options",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    addToCart(
      {
        id: product._id + (selectedColor || "") + (selectedSize || ""),
        _id: product._id,
        name: product.name,
        price: product.price,
        imageUrl: selectedImage,
        color: selectedColor || "Default",
        size: selectedSize || "Default",
      },
      quantity
    );
    toast({ title: "Added to Bag", status: "success", duration: 2000 });
  };

  const handleBuyNow = () => {
    if (
      (product.sizes?.length > 0 && !selectedSize) ||
      (product.colors?.length > 0 && !selectedColor)
    ) {
      toast({
        title: "Please select options",
        description: "Select Size/Color to proceed.",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    addToCart(
      {
        id: product._id + (selectedColor || "") + (selectedSize || ""),
        _id: product._id,
        name: product.name,
        price: product.price,
        imageUrl: selectedImage,
        color: selectedColor || "Default",
        size: selectedSize || "Default",
      },
      quantity
    );
    navigate("/checkout");
  };

  if (loading) return <Loader message="Loading..." size="lg" />;
  if (error || !product) return <EmptyState title="Product Not Found" />;

  const isOutOfStock = product.countInStock === 0;
  const formattedPrice = `₹${product.price.toLocaleString()}`;
  const productDetails = (product.description || "")
    .split(". ")
    .map((s) => s.trim())
    .filter((s) => s);

  const productImages =
    product.images?.length > 0
      ? product.images.map((img) => (typeof img === "object" ? img.url : img))
      : [product.imageUrl];

  return (
    <Box
      bgGradient="linear(to-b, #0f0c29, #302b63, #24243e)"
      minH="100vh"
      pb={20}
      color="white"
    >
      <Container maxW="1400px" py={{ base: 6, md: 12 }} px={{ base: 4, md: 8 }}>
        {/* Header */}
        <Stack spacing={3} mb={6}>
          <HStack spacing={3} justify="space-between">
            <Link as={RouterLink} to="/products" color="cyan.200" fontSize="sm">
              ← Back to products
            </Link>
            <Badge
              bgGradient="linear(to-r, purple.500, cyan.400)"
              color="white"
              px={3}
              py={1}
              borderRadius="full"
            >
              Category:{" "}
              {product.category?.name || product.category || "General"}
            </Badge>
          </HStack>
          <Divider borderColor="whiteAlpha.200" />
        </Stack>

        <SimpleGrid
          columns={{ base: 1, lg: 2 }}
          spacing={10}
          alignItems="start"
        >
          {/* LEFT: IMAGE SECTION */}
          <Box position="relative">
            <MotionBox
              borderRadius="2xl"
              bg="whiteAlpha.100"
              p={2}
              boxShadow="lg"
              cursor="pointer"
              onDoubleClick={handleDoubleClick}
              position="relative"
              zIndex={1}
            >
              <MagnifierImage src={selectedImage} zoom={2.5} />

              {/* Floating Heart Button */}
              <IconButton
                icon={<FaHeart />}
                position="absolute"
                top={4}
                right={4}
                zIndex={20}
                borderRadius="full"
                colorScheme={isLiked ? "pink" : "gray"}
                color={isLiked ? "red.500" : "gray.600"}
                bg="whiteAlpha.900"
                onClick={handleLikeButton}
                boxShadow="lg"
                size="lg"
                _hover={{ transform: "scale(1.1)" }}
              />

              {/* BIG HEART ANIMATION OVERLAY */}
              <AnimatePresence>
                {showBigHeart && (
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    zIndex={30}
                    pointerEvents="none"
                  >
                    <svg width="0" height="0">
                      <linearGradient
                        id="instaPopGrad"
                        x1="100%"
                        y1="100%"
                        x2="0%"
                        y2="0%"
                      >
                        <stop
                          offset="0%"
                          style={{ stopColor: "#feda75", stopOpacity: 1 }}
                        />
                        <stop
                          offset="25%"
                          style={{ stopColor: "#fa7e1e", stopOpacity: 1 }}
                        />
                        <stop
                          offset="50%"
                          style={{ stopColor: "#d62976", stopOpacity: 1 }}
                        />
                        <stop
                          offset="75%"
                          style={{ stopColor: "#962fbf", stopOpacity: 1 }}
                        />
                        <stop
                          offset="100%"
                          style={{ stopColor: "#4f5bd5", stopOpacity: 1 }}
                        />
                      </linearGradient>
                    </svg>

                    <MotionIcon
                      initial={{ scale: 0, opacity: 0, rotate: -15, y: 0 }}
                      animate={{
                        scale: [0, 1.4, 1],
                        opacity: [0, 1, 1],
                        rotate: [-15, 0, 0],
                        y: 0,
                      }}
                      exit={{
                        scale: 0.8,
                        opacity: 0,
                        y: -150,
                        rotate: 10,
                      }}
                      transition={{
                        duration: 0.7,
                        times: [0, 0.2, 0.4],
                        ease: "easeOut",
                        exit: { duration: 0.4, ease: "easeIn" },
                      }}
                      style={{
                        filter: "drop-shadow(0px 5px 15px rgba(0,0,0,0.3))",
                        fill: "url(#instaPopGrad)",
                      }}
                      fontSize="180px"
                      color="white"
                    />
                  </Box>
                )}
              </AnimatePresence>

              {/* Thumbnails */}
              <HStack spacing={3} mt={4} overflowX="auto" pb={2}>
                {productImages.map((img, idx) => (
                  <Box
                    key={idx}
                    minW="80px"
                    h="60px"
                    borderRadius="md"
                    overflow="hidden"
                    border={
                      img === selectedImage
                        ? "2px solid cyan"
                        : "1px solid gray"
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(img);
                    }}
                    cursor="pointer"
                  >
                    <Image src={img} objectFit="cover" h="100%" w="100%" />
                  </Box>
                ))}
              </HStack>
            </MotionBox>

            <Text fontSize="xs" color="gray.400" textAlign="center" mt={1}>
              Double tap to like ❤️ • Hover to zoom 🔍
            </Text>
          </Box>

          {/* Right Details */}
          <Box position={{ md: "sticky" }} top={{ md: "80px" }}>
            <VStack align="stretch" spacing={5}>
              <Heading as="h1" size="xl">
                {product.name}
              </Heading>
              <HStack justify="space-between">
                <Text fontSize="3xl" fontWeight="bold" color="cyan.600">
                  {formattedPrice}
                </Text>
                <Rating
                  rating={product.rating}
                  numReviews={product.numReviews}
                  color="cyan.400"
                />
              </HStack>
              <Divider borderColor="whiteAlpha.300" />
              <Text color="gray.300">{product.description}</Text>

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <Box>
                  <Heading size="sm" mb={3} color="cyan.200">
                    Color: {selectedColor}
                  </Heading>
                  <HStack spacing={3}>
                    {product.colors.map((c, i) => (
                      <Tooltip key={i} label={c.name}>
                        <MotionBox
                          w="44px"
                          h="44px"
                          borderRadius="full"
                          bg={c.hex}
                          border={
                            selectedColor === c.name
                              ? "3px solid cyan"
                              : "2px solid gray"
                          }
                          cursor="pointer"
                          onClick={() => handleColorClick(c)}
                          whileHover={{ scale: 1.1 }}
                        />
                      </Tooltip>
                    ))}
                  </HStack>
                </Box>
              )}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <Box>
                  <Heading size="sm" mb={3} color="cyan.200">
                    Size: {selectedSize}
                  </Heading>
                  <HStack spacing={2}>
                    {product.sizes.map((s, i) => (
                      <MotionButton
                        key={i}
                        size="sm"
                        variant={selectedSize === s ? "solid" : "outline"}
                        colorScheme={selectedSize === s ? "cyan" : "gray"}
                        onClick={() => setSelectedSize(s)}
                        whileHover={{ scale: 1.05 }}
                      >
                        {s}
                      </MotionButton>
                    ))}
                  </HStack>

                  {/* 🟢 ACTION LINKS: Size Guide & Find My Fit */}
                  <HStack spacing={6} mt={2}>
                    <Link
                      color="cyan.300"
                      fontSize="sm"
                      display="flex"
                      alignItems="center"
                      onClick={onSizeChartOpen}
                      cursor="pointer"
                    >
                      <FaRulerHorizontal style={{ marginRight: "5px" }} /> Size
                      Guide
                    </Link>

                    {/* 🟢 Smart Feature: Find My Fit */}
                    <Link
                      color="orange.300"
                      fontSize="sm"
                      fontWeight="bold"
                      display="flex"
                      alignItems="center"
                      onClick={onFitOpen}
                      cursor="pointer"
                    >
                      📏 Not sure? Find my size
                    </Link>
                  </HStack>

                  <SizeChartModal
                    isOpen={isSizeChartOpen}
                    onClose={onSizeChartClose}
                    imageSrc={product.sizeChart}
                  />
                  <FindMyFitModal
                    isOpen={isFitOpen}
                    onClose={onFitClose}
                    onApplySize={(size) => setSelectedSize(size)}
                  />
                </Box>
              )}

              {/* Buttons */}
              <Stack direction={{ base: "column", xl: "row" }} spacing={4}>
                <HStack spacing={4} flex={1}>
                  <Select
                    w="100px"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    isDisabled={isOutOfStock}
                    size="lg"
                    bg="whiteAlpha.200"
                    color="white"
                    border="none"
                  >
                    {[
                      ...Array(Math.min(product.countInStock || 1, 5)).keys(),
                    ].map((x) => (
                      <option
                        key={x + 1}
                        value={x + 1}
                        style={{ color: "black" }}
                      >
                        {x + 1}
                      </option>
                    ))}
                  </Select>
                  <MotionButton
                    leftIcon={<FaShoppingCart />}
                    colorScheme="cyan"
                    variant="outline"
                    size="lg"
                    w="full"
                    onClick={handleAddToCart}
                    isDisabled={isOutOfStock}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add to Bag
                  </MotionButton>
                </HStack>

                <MotionButton
                  flex={1}
                  leftIcon={<FaBolt />}
                  colorScheme="orange"
                  size="lg"
                  w="full"
                  onClick={handleBuyNow}
                  isDisabled={isOutOfStock}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  boxShadow="0 0 15px rgba(237, 137, 54, 0.4)"
                >
                  Buy Now
                </MotionButton>
              </Stack>
            </VStack>
          </Box>
        </SimpleGrid>

        <Divider my={12} borderColor="whiteAlpha.200" />

        {/* REVIEWS SECTION */}
        <Box
          mt={12}
          bg="whiteAlpha.100"
          p={8}
          borderRadius="xl"
          boxShadow="xl"
          border="1px solid rgba(255,255,255,0.1)"
        >
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
            <Box>
              <Heading size="md" mb={4} color="cyan.300">
                Highlights
              </Heading>
              <VStack align="start" spacing={3}>
                {productDetails.map((d, i) => (
                  <HStack key={i}>
                    <Box w="8px" h="8px" borderRadius="full" bg="cyan.400" />
                    <Text fontSize="sm" color="gray.300">
                      {d}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>

            <Box>
              <Heading size="md" mb={6} color="cyan.300">
                Reviews
              </Heading>
              {user ? (
                <Box
                  mb={8}
                  p={5}
                  bg="whiteAlpha.100"
                  borderRadius="lg"
                  border="1px dashed"
                  borderColor="whiteAlpha.300"
                >
                  <form onSubmit={submitReviewHandler}>
                    <VStack spacing={4} align="start">
                      <Text fontWeight="bold" fontSize="sm" color="white">
                        Write a Review
                      </Text>
                      <HStack spacing={1}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Box
                            key={star}
                            as="button"
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            color={
                              (hoverRating || rating) >= star
                                ? "orange.400"
                                : "gray.600"
                            }
                            fontSize="2xl"
                          >
                            <FaStar />
                          </Box>
                        ))}
                      </HStack>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience..."
                        size="sm"
                        bg="whiteAlpha.200"
                        border="none"
                        color="white"
                      />
                      <HStack w="full" justify="space-between">
                        <Flex align="center" gap={3}>
                          <Button
                            as="label"
                            leftIcon={<FaCamera />}
                            size="xs"
                            cursor="pointer"
                            colorScheme="whiteAlpha"
                            color="white"
                          >
                            Add Photo
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={handleReviewImageSelect}
                            />
                          </Button>
                          {reviewImagePreview && (
                            <Image
                              src={reviewImagePreview}
                              boxSize="40px"
                              objectFit="cover"
                              borderRadius="md"
                              border="1px solid cyan"
                            />
                          )}
                        </Flex>
                        <Button
                          type="submit"
                          colorScheme="cyan"
                          size="sm"
                          isLoading={reviewLoading}
                          isDisabled={rating === 0}
                        >
                          Submit
                        </Button>
                      </HStack>
                    </VStack>
                  </form>
                </Box>
              ) : (
                <EmptyState
                  title="Login to Review"
                  iconName="user"
                  ctaText="Login"
                  ctaLink="/login"
                />
              )}

              <VStack
                align="stretch"
                maxH="400px"
                overflowY="auto"
                spacing={4}
                pr={2}
                css={{
                  "&::-webkit-scrollbar": { width: "4px" },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#0BC5EA",
                    borderRadius: "24px",
                  },
                }}
              >
                {product.reviews.length === 0 && (
                  <Text fontSize="sm" color="gray.500">
                    No reviews yet.
                  </Text>
                )}
                {product.reviews.map((review) => (
                  <Box
                    key={review._id}
                    p={4}
                    bg="whiteAlpha.100"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                  >
                    <HStack justify="space-between" mb={2}>
                      <HStack>
                        <Box
                          w="32px"
                          h="32px"
                          borderRadius="full"
                          bg="cyan.600"
                          color="white"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontWeight="bold"
                          fontSize="xs"
                        >
                          {review.name.charAt(0)}
                        </Box>
                        <Text fontWeight="bold" fontSize="sm" color="white">
                          {review.name}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Text>
                    </HStack>
                    <Rating rating={review.rating} color="orange.400" />
                    <Text fontSize="sm" mt={2} color="gray.300">
                      {review.comment}
                    </Text>
                    {review.image && (
                      <Box
                        mt={3}
                        cursor="pointer"
                        onClick={() => openReviewImage(review.image)}
                      >
                        <Image
                          src={review.image}
                          borderRadius="md"
                          h="60px"
                          w="60px"
                          objectFit="cover"
                          border="1px solid rgba(255,255,255,0.2)"
                        />
                      </Box>
                    )}
                  </Box>
                ))}
              </VStack>
            </Box>
          </SimpleGrid>
        </Box>

        {/* RELATED PRODUCTS SLIDER */}
        {relatedProducts.length > 0 && (
          <>
            <Divider my={12} borderColor="whiteAlpha.200" />
            <Box position="relative">
              <HStack justify="space-between" mb={8}>
                <Heading size="lg" color="white">
                  You Might Also Like ✨
                </Heading>
                <HStack>
                  <IconButton
                    icon={<FaChevronLeft />}
                    onClick={slideLeft}
                    isRound
                    colorScheme="cyan"
                    variant="outline"
                    size="sm"
                  />
                  <IconButton
                    icon={<FaChevronRight />}
                    onClick={slideRight}
                    isRound
                    colorScheme="cyan"
                    variant="outline"
                    size="sm"
                  />
                </HStack>
              </HStack>
              <Flex
                ref={sliderRef}
                overflowX="auto"
                gap={6}
                pb={4}
                css={{
                  "&::-webkit-scrollbar": { display: "none" },
                  scrollBehavior: "smooth",
                }}
              >
                {relatedProducts.map((related) => (
                  <Box key={related._id} minW={{ base: "250px", md: "280px" }}>
                    <ProductCard product={related} glassmorphic />
                  </Box>
                ))}
              </Flex>
            </Box>
          </>
        )}

        <ZoomModal
          isOpen={isOpen}
          onClose={onClose}
          currentImage={selectedImage}
          images={productImages}
        />
        <ReviewImageModal
          isOpen={isReviewImgOpen}
          onClose={onReviewImgClose}
          imgSrc={previewReviewImage}
        />

        {mobileSticky && (
          <chakra.div
            position="fixed"
            bottom={4}
            left="50%"
            transform="translateX(-50%)"
            w="calc(100% - 32px)"
            maxW="600px"
            bg="rgba(15, 23, 42, 0.9)"
            backdropFilter="blur(10px)"
            borderRadius="full"
            boxShadow="0 0 20px cyan"
            p={2}
            zIndex={90}
            display={{ base: "flex", md: "none" }}
            alignItems="center"
            justifyContent="space-between"
            border="1px solid cyan"
          >
            <Box pl={4}>
              <Text fontWeight="bold" fontSize="sm" color="white" noOfLines={1}>
                {product.name}
              </Text>
            </Box>
            <HStack spacing={2} pr={1}>
              <Button
                size="sm"
                colorScheme="cyan"
                variant="outline"
                borderRadius="full"
                onClick={handleAddToCart}
              >
                Add
              </Button>
              <Button
                size="sm"
                colorScheme="orange"
                borderRadius="full"
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </HStack>
          </chakra.div>
        )}
      </Container>
    </Box>
  );
};

export default ProductDetails;
