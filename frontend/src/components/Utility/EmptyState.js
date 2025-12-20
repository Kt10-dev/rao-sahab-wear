// src/components/Utility/EmptyState.js
import React from "react";
import { Heading, Text, VStack, Button, Icon, Box } from "@chakra-ui/react";
import { FaBoxOpen } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";

const EmptyState = ({
  title,
  description,
  ctaText = "Continue Shopping",
  ctaLink = "/products",
}) => {
  return (
    <VStack
      p={10}
      spacing={5}
      textAlign="center"
      maxW="600px"
      mx="auto"
      my={10}
    >
      <Icon as={FaBoxOpen} w={12} h={12} color="red.400" />
      <Heading size="lg" color="gray.700">
        {title}
      </Heading>
      <Text color="gray.500" fontSize="md">
        {description}
      </Text>
      <Button as={RouterLink} to={ctaLink} colorScheme="red" size="md" mt={4}>
        {ctaText}
      </Button>
    </VStack>
  );
};
export default EmptyState;
