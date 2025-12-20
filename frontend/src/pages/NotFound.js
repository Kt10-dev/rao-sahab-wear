// src/pages/NotFound.js

import React from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FaHome } from "react-icons/fa";

const NotFound = () => {
  const bg = useColorModeValue("gray.50", "gray.900");

  return (
    <Box
      minH="80vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg={bg}
      px={6}
    >
      <VStack spacing={6} textAlign="center">
        <Heading
          display="inline-block"
          as="h1"
          size="4xl"
          bgGradient="linear(to-r, red.400, red.600)"
          backgroundClip="text"
        >
          404
        </Heading>
        <Heading as="h2" size="xl" mt={6} mb={2}>
          Page Not Found
        </Heading>
        <Text color={"gray.500"} fontSize="lg">
          The page you are looking for does not exist or has been moved. <br />
          Don't worry, Rao Sahab Wear is still here!
        </Text>

        <Button
          as={RouterLink}
          to="/"
          colorScheme="red"
          bgGradient="linear(to-r, red.400, red.500, red.600)"
          color="white"
          variant="solid"
          size="lg"
          leftIcon={<FaHome />}
          _hover={{
            bgGradient: "linear(to-r, red.500, red.600, red.700)",
            boxShadow: "xl",
          }}
        >
          Go to Homepage
        </Button>
      </VStack>
    </Box>
  );
};

export default NotFound;
