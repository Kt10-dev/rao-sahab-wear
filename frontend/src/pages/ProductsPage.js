import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Container,
  SimpleGrid,
  Grid,
  GridItem,
  VStack,
  Text,
  Heading,
  Divider,
  Button,
  HStack,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Select,
  useToast,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  DrawerCloseButton,
  Stack,
  Spacer,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";

import { FaSearch, FaFilter } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

// Custom Components
import ProductCard from "../components/ProductCard/ProductCard";
import Loader from "../components/Utility/Loader";
import EmptyState from "../components/Utility/EmptyState";
import SidebarFilters from "../components/ProductsPage/SidebarFilters"; // 🟢 Ensure path is correct

// ---------------- CONFIG ----------------
const API_BASE_URL = "https://raosahab-api.onrender.com";
const MIN_PRICE = 0;
const MAX_PRICE = 25000;
const PAGE_SIZE = 9;

// ---------------- DEBOUNCE HOOK ----------------
function useDebounce(value, delay = 450) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ---------------- MOTION COMPONENTS ----------------
const MotionBox = motion(Box);
const MotionButton = motion(Button);

// ---------------- MAIN COMPONENT ----------------
export default function ProductsPage() {
  // Data States
  const [allProducts, setAllProducts] = useState([]);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [MIN_PRICE, MAX_PRICE],
    sortBy: "relevance",
  });

  // Search & Pagination
  const location = useLocation();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 450);
  const [page, setPage] = useState(1);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // 1. Sync URL Keyword to State
  useEffect(() => {
    const currentKeyword =
      new URLSearchParams(location.search).get("keyword") || "";
    setKeyword(currentKeyword);
  }, [location.search]);

  // 2. FETCH DATA (Products + Categories)
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);

        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/products`),
          axios.get(`${API_BASE_URL}/api/categories`),
        ]);

        if (!mounted) return;

        // A. Set Products
        const productList =
          productsRes.data.products ||
          (Array.isArray(productsRes.data) ? productsRes.data : []);
        setAllProducts(productList);

        // B. Set Categories
        const cats = categoriesRes.data.map((c) => c.name);
        setDynamicCategories(cats);

        // Default: Select ALL categories if empty
        if (filters.categories.length === 0) {
          setFilters((prev) => ({ ...prev, categories: cats }));
        }

        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please check your connection.");
        setLoading(false);
      }
    };
    fetchData();
    return () => (mounted = false);
  }, []);

  // 3. 🟢 FILTERING LOGIC (UPDATED FIX)
  const filtered = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];

    const kw = debouncedKeyword.trim().toLowerCase();

    let list = allProducts.filter((p) => {
      // 🟢 FIX: Extract Category Name safely from Object
      const categoryName = p.category?.name || p.category || "Uncategorized";

      // A. Category Match
      const catMatch =
        filters.categories.length > 0
          ? filters.categories.includes(categoryName)
          : true;

      // B. Price Match
      const price =
        typeof p.price === "number" ? p.price : Number(p.price || 0);
      const priceMatch =
        price >= filters.priceRange[0] && price <= filters.priceRange[1];

      // C. Search Match
      const text = `${p.name} ${
        p.description || ""
      } ${categoryName}`.toLowerCase();
      const kwMatch = kw ? text.includes(kw) : true;

      return catMatch && priceMatch && kwMatch;
    });

    // D. Sorting
    if (filters.sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (filters.sortBy === "price-desc")
      list.sort((a, b) => b.price - a.price);
    else if (filters.sortBy === "newest")
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return list;
  }, [allProducts, filters, debouncedKeyword]);

  // 4. Pagination Logic
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // 5. Handlers
  const clearFilters = useCallback(() => {
    setFilters({
      categories: dynamicCategories,
      priceRange: [MIN_PRICE, MAX_PRICE],
      sortBy: "relevance",
    });
    setKeyword("");
    setPage(1);
    navigate("/products", { replace: true });
    toast({ title: "Filters Reset", status: "info", duration: 1000 });
  }, [navigate, dynamicCategories, toast]);

  const submitSearch = (e) => {
    e?.preventDefault();
    const qs = new URLSearchParams(location.search);
    if (keyword.trim()) qs.set("keyword", keyword.trim());
    else qs.delete("keyword");
    navigate({ pathname: "/products", search: qs.toString() });
    setPage(1);

    if (keyword.trim()) {
      toast({
        title: "Searching",
        description: `Showing results for "${keyword}"`,
        status: "info",
        duration: 1000,
      });
    }
  };

  const bg = useColorModeValue("white", "gray.800");

  // --- RENDER ---

  if (loading) return <Loader message="Loading Collection..." />;

  if (error)
    return (
      <EmptyState
        title="Connection Error"
        description={error}
        iconName="warning"
        ctaText="Retry"
        onClick={() => window.location.reload()}
      />
    );

  return (
    <Box
      bgGradient="linear(to-b, #0f0c29, #302b63, #24243e)"
      minH="100vh"
      pb={20}
    >
      <Container maxW="1300px" py={8} px={{ base: 4, md: 6 }}>
        {/* Header Section */}
        <Stack
          direction={{ base: "column", md: "row" }}
          spacing={4}
          align="center"
          mb={6}
        >
          <VStack align="start" spacing={0}>
            <Heading
              size="lg"
              bgGradient="linear(to-r, cyan.400, pink.400)"
              bgClip="text"
              textShadow="0 0 8px cyan, 0 0 12px pink"
            >
              Rao Sahab Premium Collection
            </Heading>
            <Text color="cyan.200">Handpicked styles — curated for you</Text>
          </VStack>

          <Spacer />

          {/* Search & Sort Controls */}
          <HStack spacing={3} w={{ base: "100%", md: "auto" }}>
            <Box
              as="form"
              onSubmit={submitSearch}
              w={{ base: "100%", md: "420px" }}
            >
              <InputGroup>
                <Input
                  placeholder="Search products..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  bg="rgba(255,255,255,0.05)"
                  color="white"
                  border="1px solid cyan"
                  _placeholder={{ color: "cyan.200" }}
                />
                <InputRightElement width="4.5rem">
                  <IconButton
                    aria-label="Search"
                    icon={<FaSearch />}
                    size="sm"
                    colorScheme="cyan"
                    onClick={submitSearch}
                  />
                </InputRightElement>
              </InputGroup>
            </Box>

            <Select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((p) => ({ ...p, sortBy: e.target.value }))
              }
              w="220px"
              bg="rgba(255,255,255,0.05)"
              color="white"
              border="1px solid cyan"
            >
              <option value="relevance" style={{ color: "black" }}>
                Sort: Relevance
              </option>
              <option value="price-asc" style={{ color: "black" }}>
                Price: Low to High
              </option>
              <option value="price-desc" style={{ color: "black" }}>
                Price: High to Low
              </option>
              <option value="newest" style={{ color: "black" }}>
                Newest Arrivals
              </option>
            </Select>

            <IconButton
              aria-label="Filters"
              icon={<FaFilter />}
              display={{ base: "inline-flex", md: "none" }}
              onClick={onOpen}
              colorScheme="cyan"
            />
          </HStack>
        </Stack>

        <Divider borderColor="cyan.400" mb={6} />

        <Grid templateColumns={{ base: "1fr", md: "280px 1fr" }} gap={8}>
          {/* SIDEBAR (Desktop) */}
          <GridItem display={{ base: "none", md: "block" }}>
            <MotionBox
              p={6}
              borderRadius="2xl"
              bg={bg}
              backdropFilter="blur(16px)"
              border="1px solid rgba(0,255,255,0.2)"
              boxShadow="0 0 20px cyan"
              position="sticky"
              top="100px"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SidebarFilters
                filters={filters}
                setFilters={setFilters}
                clearFilters={clearFilters}
                categories={dynamicCategories}
              />
            </MotionBox>
          </GridItem>

          {/* Product Grid */}
          <GridItem>
            {pageItems.length === 0 ? (
              <EmptyState
                title="No products found"
                description="Try changing filters or clearing the search."
                iconName="search"
                ctaText="Clear filters"
                onClick={clearFilters}
              />
            ) : (
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
                {pageItems.map((p) => (
                  <MotionBox
                    key={p._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 0 16px cyan, 0 0 24px pink",
                    }}
                    transition={{ type: "spring", stiffness: 120 }}
                  >
                    {/* Make sure ProductCard handles category object correctly too */}
                    <ProductCard product={p} glassmorphic />
                  </MotionBox>
                ))}
              </SimpleGrid>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Flex mt={8} justify="center" align="center" gap={3}>
                <MotionButton
                  size="sm"
                  onClick={() => setPage((s) => Math.max(1, s - 1))}
                  isDisabled={page === 1}
                  whileHover={{ scale: 1.1 }}
                >
                  Prev
                </MotionButton>
                <HStack spacing={2}>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const idx = i + 1;
                    if (
                      idx === 1 ||
                      idx === totalPages ||
                      Math.abs(idx - page) <= 1
                    ) {
                      return (
                        <MotionButton
                          key={idx}
                          size="sm"
                          variant={idx === page ? "solid" : "outline"}
                          colorScheme={idx === page ? "cyan" : "gray"}
                          onClick={() => setPage(idx)}
                          whileHover={{
                            scale: 1.1,
                            boxShadow: "0 0 12px cyan",
                          }}
                        >
                          {idx}
                        </MotionButton>
                      );
                    }
                    if (
                      (idx === 2 && page > 3) ||
                      (idx === totalPages - 1 && page < totalPages - 2)
                    ) {
                      return (
                        <Text key={`dot-${idx}`} color="cyan.200">
                          …
                        </Text>
                      );
                    }
                    return null;
                  })}
                </HStack>
                <MotionButton
                  size="sm"
                  onClick={() => setPage((s) => Math.min(totalPages, s + 1))}
                  isDisabled={page === totalPages}
                  whileHover={{ scale: 1.1 }}
                >
                  Next
                </MotionButton>
              </Flex>
            )}
          </GridItem>
        </Grid>
      </Container>

      {/* Mobile Filter Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton color="cyan.300" />
          <DrawerBody p={6} bg="gray.800">
            <SidebarFilters
              filters={filters}
              setFilters={setFilters}
              clearFilters={() => {
                clearFilters();
                onClose();
              }}
              categories={dynamicCategories}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
