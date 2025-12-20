import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  useToast,
  Flex,
  Tag,
  Center,
  useDisclosure,
  IconButton,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  Tab,
  Image, // 🟢 Import Image Component
  Text,
} from "@chakra-ui/react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import ProductFormModal from "./ProductFormModal";
import ProductUpdateModal from "./ProductUpdateModal";

const API_BASE_URL = "https://raosahab-api.onrender.com";

const ProductManager = () => {
  const { user } = useAuth();

  // Modals
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const {
    isOpen: isUpdateOpen,
    onOpen: onUpdateOpen,
    onClose: onUpdateClose,
  } = useDisclosure();

  // Data State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Search & Filter
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [currentProduct, setCurrentProduct] = useState(null);
  const toast = useToast();

  // 🟢 Helper: Get Image URL Safely
  const getImgUrl = (img) => {
    if (!img) return "https://via.placeholder.com/50";
    return typeof img === "object" ? img.url : img;
  };

  // FETCH CATEGORIES
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/categories`);
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories");
      }
    };
    fetchCats();
  }, []);

  // FETCH PRODUCTS
  const fetchProducts = async (pageNumber = 1, searchKey = "", cat = "") => {
    try {
      setLoading(true);
      let query = `?pageNumber=${pageNumber}&keyword=${searchKey}`;
      const { data } = await axios.get(`${API_BASE_URL}/api/products${query}`);

      let productList = data.products || (Array.isArray(data) ? data : []);

      // Client Side Category Filter
      // Note: Backend ab category Object bhej raha hai, isliye filter logic update kiya
      if (cat && cat !== "All") {
        productList = productList.filter((p) => {
          const pCatName = p.category?.name || p.category;
          return pCatName === cat;
        });
      }

      setProducts(productList);
      setPage(data.page || 1);
      setPages(data.pages || 1);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch products.");
      setProducts([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(1, keyword, selectedCategory);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [keyword, selectedCategory]);

  const handleTabChange = (index) => {
    if (index === 0) {
      setSelectedCategory("");
    } else {
      setSelectedCategory(categories[index - 1].name);
    }
    setPage(1);
  };

  const deleteProductHandler = async (productId) => {
    if (window.confirm("Are you sure?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`${API_BASE_URL}/api/products/${productId}`, config);
        toast({ title: "Deleted!", status: "info", duration: 2000 });
        fetchProducts(page, keyword, selectedCategory);
      } catch (err) {
        toast({ title: "Error", status: "error" });
      }
    }
  };

  const openUpdateModal = (product) => {
    setCurrentProduct(product);
    onUpdateOpen();
  };

  return (
    <Box>
      <Flex
        justify="space-between"
        align="center"
        mb={6}
        flexWrap="wrap"
        gap={4}
      >
        <Heading size="lg">Products ({products?.length || 0})</Heading>

        <InputGroup w={{ base: "100%", md: "300px" }}>
          <InputLeftElement pointerEvents="none">
            <FaSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search by name..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            bg="white"
          />
        </InputGroup>

        <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={onCreateOpen}>
          Add Product
        </Button>
      </Flex>

      <Tabs
        variant="soft-rounded"
        colorScheme="cyan"
        onChange={handleTabChange}
        mb={6}
        isLazy
      >
        <TabList
          overflowX="auto"
          py={1}
          css={{ "&::-webkit-scrollbar": { display: "none" } }}
        >
          <Tab flexShrink={0}>All</Tab>
          {categories.map((cat) => (
            <Tab key={cat._id} flexShrink={0}>
              {cat.name}
            </Tab>
          ))}
        </TabList>
      </Tabs>

      {loading ? (
        <Center minH="40vh">
          <Spinner size="xl" color="blue.500" />
        </Center>
      ) : (
        <TableContainer borderWidth="1px" borderRadius="lg" bg="white" mb={4}>
          <Table variant="simple" size="sm">
            <Thead bg="gray.100">
              <Tr>
                <Th>Image</Th>
                <Th>NAME</Th>
                <Th>CATEGORY</Th>
                <Th isNumeric>PRICE</Th>
                <Th isNumeric>STOCK</Th>
                <Th>ACTIONS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {products && products.length > 0 ? (
                products.map((product) => (
                  <Tr key={product._id} _hover={{ bg: "gray.50" }}>
                    <Td>
                      <Box
                        w="40px"
                        h="40px"
                        overflow="hidden"
                        borderRadius="md"
                        border="1px solid #eee"
                      >
                        <Image
                          src={
                            product.images && product.images.length > 0
                              ? getImgUrl(product.images[0])
                              : product.imageUrl
                          }
                          alt=""
                          w="100%"
                          h="100%"
                          objectFit="cover"
                          fallbackSrc="https://via.placeholder.com/40"
                        />
                      </Box>
                    </Td>
                    <Td fontWeight="semibold">{product.name}</Td>

                    {/* 🟢 CRITICAL FIX: Handle Category Object */}
                    <Td>
                      <Tag size="sm" colorScheme="blue">
                        {product.category?.name ||
                          product.category ||
                          "Uncategorized"}
                      </Tag>
                    </Td>

                    <Td isNumeric>₹{product.price.toLocaleString()}</Td>
                    <Td isNumeric>
                      <Tag
                        colorScheme={
                          product.countInStock > 5
                            ? "green"
                            : product.countInStock > 0
                            ? "orange"
                            : "red"
                        }
                      >
                        {product.countInStock}
                      </Tag>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          size="sm"
                          icon={<FaEdit />}
                          colorScheme="orange"
                          onClick={() => openUpdateModal(product)}
                          aria-label="Edit"
                        />
                        <IconButton
                          size="sm"
                          icon={<FaTrash />}
                          colorScheme="red"
                          onClick={() => deleteProductHandler(product._id)}
                          aria-label="Delete"
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={10} color="gray.500">
                    No products found.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination Controls */}
      {pages > 1 && (
        <Flex justify="center" align="center" gap={4} mt={4}>
          <Button
            isDisabled={page === 1}
            onClick={() => fetchProducts(page - 1, keyword, selectedCategory)}
            leftIcon={<FaChevronLeft />}
            size="sm"
          >
            Prev
          </Button>
          <Text fontWeight="bold">
            Page {page} of {pages}
          </Text>
          <Button
            isDisabled={page === pages}
            onClick={() => fetchProducts(page + 1, keyword, selectedCategory)}
            rightIcon={<FaChevronRight />}
            size="sm"
          >
            Next
          </Button>
        </Flex>
      )}

      <ProductFormModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        user={user}
        onProductCreated={() => fetchProducts(page, keyword, selectedCategory)}
      />

      {currentProduct && (
        <ProductUpdateModal
          isOpen={isUpdateOpen}
          onClose={onUpdateClose}
          user={user}
          productData={currentProduct}
          onProductUpdated={() =>
            fetchProducts(page, keyword, selectedCategory)
          }
        />
      )}
    </Box>
  );
};

export default ProductManager;
