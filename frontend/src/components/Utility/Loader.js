// src/components/Utility/Loader.js
import React from "react";
import { Spinner, VStack, Text } from "@chakra-ui/react";

const Loader = ({ size = "xl", message = "Loading data..." }) => {
  return (
    <VStack spacing={4} align="center" justify="center" minH="300px" w="full">
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="red.500"
        size={size}
      />
      <Text color="gray.600" fontSize="lg">
        {message}
      </Text>
    </VStack>
  );
};
export default Loader;
