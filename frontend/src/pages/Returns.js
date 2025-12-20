// src/pages/Returns.js

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

const Returns = () => {
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
            Returns & Refund Policy
          </Heading>
          <Text fontSize="lg" color={textColor}>
            At <strong>Rao Sahab Wear</strong>, we strive to give you the very
            best shopping experience possible. However, considering that opened
            or damaged products cannot be reused, we have a strict check on
            returns.
          </Text>

          <Divider />

          {/* 1. Return Window */}
          <Box>
            <Heading size="md" color={headingColor} mb={3}>
              1. Return Window
            </Heading>
            <Text color={textColor}>
              You can raise a return request within **10 days** of receiving the
              product. After 10 days, the product will not be eligible for
              return or exchange.
            </Text>
          </Box>

          {/* 2. Eligibility */}
          <Box>
            <Heading size="md" color={headingColor} mb={3}>
              2. Eligibility for Returns
            </Heading>
            <Text color={textColor} mb={2}>
              To be eligible for a return, your item must be:
            </Text>
            <UnorderedList spacing={2} color={textColor} pl={4}>
              <ListItem>
                Unused and in the same condition that you received it.
              </ListItem>
              <ListItem>
                In the original packaging with all tags intact.
              </ListItem>
              <ListItem>
                Accompanied by the receipt or proof of purchase.
              </ListItem>
            </UnorderedList>
          </Box>

          {/* 3. Non-Returnable Items */}
          <Box>
            <Heading size="md" color={headingColor} mb={3}>
              3. Non-Returnable Items
            </Heading>
            <UnorderedList spacing={2} color={textColor} pl={4}>
              <ListItem>
                Customized or personalized items (e.g., custom-fit Sherwanis).
              </ListItem>
              <ListItem>
                Accessories like socks, handkerchiefs, or innerwear due to
                hygiene reasons.
              </ListItem>
              <ListItem>Products bought during a clearance sale.</ListItem>
            </UnorderedList>
          </Box>

          {/* 4. Refund Process */}
          <Box>
            <Heading size="md" color={headingColor} mb={3}>
              4. Refund Process
            </Heading>
            <Text color={textColor}>
              Once your return is received and inspected, we will send you an
              email to notify you that we have received your returned item. We
              will also notify you of the approval or rejection of your refund.
              <br />
              <br />
              If approved, your refund will be processed, and a credit will
              automatically be applied to your original method of payment (or
              bank account for COD orders) within **5-7 business days**.
            </Text>
          </Box>

          {/* 5. Exchange Policy */}
          <Box>
            <Heading size="md" color={headingColor} mb={3}>
              5. Exchanges
            </Heading>
            <Text color={textColor}>
              We only replace items if they are defective or damaged. If you
              need to exchange it for the same item (size issue), send us an
              email at support@raosahabwear.com.
            </Text>
          </Box>

          <Divider />

          {/* Contact CTA */}
          <Box w="full" textAlign="center" pt={4}>
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Still have questions?
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

export default Returns;
