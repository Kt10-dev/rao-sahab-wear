// src/pages/Collections.js

import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Container,
  SimpleGrid,
  Image,
  VStack,
  Button,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Utility/Loader";

const API_BASE_URL = "https://raosahab-api.onrender.com";
const MotionBox = motion(Box);
const MotionImage = motion(Image);
const MotionText = motion(Text);

// Collection Card Component
const CollectionCard = ({ item, index }) => {
  // Odd/Even Logic for Grid Layout (Masonry feel)
  const colSpan = index % 3 === 0 ? 2 : 1;

  return (
    <MotionBox
      gridColumn={{ base: "span 1", md: `span ${colSpan}` }} // 🟢 Dynamic Size
      as={RouterLink}
      to={`/products?keyword=${item.name}`} // 🟢 Filter by Category Name
      position="relative"
      borderRadius="2xl"
      overflow="hidden"
      h={{ base: "300px", md: "450px" }}
      role="group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <MotionImage
        src={item.image}
        alt={item.name}
        w="100%"
        h="100%"
        objectFit="cover"
        transition="transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
        _groupHover={{ transform: "scale(1.1)" }}
      />
      <Box
        position="absolute"
        top={0}
        left={0}
        w="100%"
        h="100%"
        bgGradient="linear(to-t, blackAlpha.900, transparent)"
        opacity={0.9}
      />

      <VStack
        position="absolute"
        bottom={0}
        left={0}
        w="100%"
        p={8}
        align="start"
        spacing={1}
      >
        <Text
          color="cyan.300"
          fontSize="sm"
          fontWeight="bold"
          letterSpacing="widest"
          textTransform="uppercase"
        >
          {item.description || "Exclusive Collection"}
        </Text>
        <Heading
          color="white"
          fontSize={{ base: "2xl", md: "4xl" }}
          fontFamily="'Playfair Display', serif"
        >
          {item.name}
        </Heading>
        <MotionBox
          h="0px"
          overflow="hidden"
          transition="0.4s"
          _groupHover={{ h: "40px", marginTop: "10px" }}
        >
          <Button
            variant="outline"
            colorScheme="cyan"
            size="sm"
            borderRadius="full"
          >
            Explore
          </Button>
        </MotionBox>
      </VStack>
    </MotionBox>
  );
};

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const bg = useColorModeValue("gray.900", "black");

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/categories`);
        setCollections(data);
        setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  if (loading) return <Loader message="Curating collections..." />;

  return (
    <Box bg={bg} minH="100vh" pb={20}>
      <Flex
        h={{ base: "40vh", md: "50vh" }}
        align="center"
        justify="center"
        bgImage="url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070')"
        bgSize="cover"
        bgAttachment="fixed"
        position="relative"
      >
        <Box position="absolute" w="full" h="full" bg="blackAlpha.700" />
        <VStack position="relative" zIndex={1} textAlign="center">
          <MotionText
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            color="cyan.300"
            fontWeight="bold"
            letterSpacing="4px"
          >
            THE EDIT 2026
          </MotionText>
          <Heading color="white" fontSize={{ base: "4xl", md: "6xl" }}>
            CURATED COLLECTIONS
          </Heading>
        </VStack>
      </Flex>

      <Container
        maxW="1400px"
        mt={-16}
        position="relative"
        zIndex={2}
        px={{ base: 4, md: 8 }}
      >
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {collections.map((item, index) => (
            <CollectionCard key={item._id} item={item} index={index} />
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Collections;
