// src/pages/Shipping.js

import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  UnorderedList,
  ListItem,
  useColorModeValue,
  Divider,
  Button,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const Shipping = () => {
  const bg = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = "cyan.500";

  return (
    <Box minH="100vh" bg={bg} py={12} px={4}>
      <Container
        maxW="4xl"
        bg={useColorModeValue("white", "gray.800")}
        p={8}
        borderRadius="xl"
        boxShadow="lg"
      >
        <VStack spacing={6} align="start">
          <Heading
            as="h1"
            size="2xl"
            bgGradient="linear(to-r, cyan.400, blue.500)"
            bgClip="text"
          >
            Shipping Policy
          </Heading>
          <Text fontSize="lg" color={textColor}>
            At <strong>Rao Sahab Wear</strong>, we are committed to delivering
            your order accurately, in good condition, and always on time. We
            partner with top courier companies like Shiprocket to ensure a
            smooth delivery experience.
          </Text>

          <Divider />

          {/* 1. Processing Time */}
          <Box>
            <Heading size="md" color={headingColor} mb={3}>
              1. Processing Time
            </Heading>
            <Text color={textColor}>
              All orders are processed within **1-2 business days**. Orders are
              not shipped or delivered on weekends or holidays. If we are
              experiencing a high volume of orders, shipments may be delayed by
              a few days.
            </Text>
          </Box>

          {/* 2. Shipping Rates & Delivery Estimates */}
          <Box>
            <Heading size="md" color={headingColor} mb={3}>
              2. Shipping Rates & Delivery Estimates
            </Heading>
            <Text color={textColor} mb={2}>
              Shipping charges for your order will be calculated and displayed
              at checkout.
            </Text>
            <UnorderedList spacing={2} color={textColor} pl={4}>
              <ListItem>
                <strong>Standard Shipping:</strong> 4-7 business days (Free for
                orders above ₹5000).
              </ListItem>
              <ListItem>
                <strong>Express Shipping:</strong> 2-3 business days (Extra
                charges apply).
              </ListItem>
              <ListItem>
                <strong>Cash on Delivery (COD):</strong> Available for select
                pin codes.
              </ListItem>
            </UnorderedList>
          </Box>

          {/* 3. Shipment Confirmation & Order Tracking */}
          <Box>
            <Heading size="md" color={headingColor} mb={3}>
              3. Shipment Confirmation & Tracking
            </Heading>
            <Text color={textColor}>
              You will receive a Shipment Confirmation email and SMS once your
              order has shipped containing your tracking number(s). The tracking
              number will be active within 24 hours. You can also track your
              order directly from your **Profile Orders** section.
            </Text>
          </Box>

          {/* 4. Damages */}
          <Box>
            <Heading size="md" color={headingColor} mb={3}>
              4. Damages
            </Heading>
            <Text color={textColor}>
              Rao Sahab Wear is not liable for any products damaged or lost
              during shipping. If you received your order damaged, please
              contact the shipment carrier to file a claim. Please save all
              packaging materials and damaged goods before filing a claim.
            </Text>
          </Box>

          {/* 5. International Shipping */}
          <Box>
            <Heading size="md" color={headingColor} mb={3}>
              5. International Shipping
            </Heading>
            <Text color={textColor}>
              Currently, we do not ship outside India. We are working on it and
              will update this policy once international shipping is available.
            </Text>
          </Box>

          <Divider />

          {/* Contact CTA */}
          <Box w="full" textAlign="center" pt={4}>
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Need help with your order?
            </Text>
            <Button as={RouterLink} to="/contact" colorScheme="cyan" size="lg">
              Contact Support
            </Button>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default Shipping;
