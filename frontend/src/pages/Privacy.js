// src/pages/Privacy.js

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

const Privacy = () => {
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
            Privacy Policy
          </Heading>
          <Text fontSize="lg" color={textColor}>
            At <strong>Rao Sahab Wear</strong>, accessible from raosahabwear.in,
            one of our main priorities is the privacy of our visitors. This
            Privacy Policy document contains types of information that is
            collected and recorded by us and how we use it.
          </Text>

          <Divider />

          {/* 1. Information We Collect */}
          <Box>
            <Heading size="md" color={headingColor} mb={3}>
              1. Information We Collect
            </Heading>
            <Text color={textColor} mb={2}>
              When you register for an Account or place an order, we may ask for
              your contact information, including items such as:
            </Text>
            <UnorderedList spacing={2} color={textColor} pl={4}>
              <ListItem>Name</ListItem>
              <ListItem>Company Name (if applicable)</ListItem>
              <ListItem>Address (Billing & Shipping)</ListItem>
              <ListItem>Email Address</ListItem>
              <ListItem>Telephone Number</ListItem>
            </UnorderedList>
          </Box>

          {/* 2. How We Use Your Information */}
          <Box>
            <Heading size="md" color={headingColor} mb={3}>
              2. How We Use Your Information
            </Heading>
            <Text color={textColor} mb={2}>
              We use the information we collect in various ways, including to:
            </Text>
            <UnorderedList spacing={2} color={textColor} pl={4}>
              <ListItem>Provide, operate, and maintain our website.</ListItem>
              <ListItem>Improve, personalize, and expand our website.</ListItem>
              <ListItem>
                Understand and analyze how you use our website.
              </ListItem>
              <ListItem>
                Process your transactions and manage your orders.
              </ListItem>
              <ListItem>
                Send you emails regarding order updates and marketing offers
                (you can opt-out anytime).
              </ListItem>
            </UnorderedList>
          </Box>

          {/* 3. Cookies and Web Beacons */}
          <Box>
            <Heading size="md" color={headingColor} mb={3}>
              3. Cookies
            </Heading>
            <Text color={textColor}>
              Like any other website, Rao Sahab Wear uses 'cookies'. These
              cookies are used to store information including visitors'
              preferences, and the pages on the website that the visitor
              accessed or visited. The information is used to optimize the
              users' experience by customizing our web page content based on
              visitors' browser type and/or other information.
            </Text>
          </Box>

          {/* 4. Third Party Privacy Policies */}
          <Box>
            <Heading size="md" color={headingColor} mb={3}>
              4. Third Party Partners
            </Heading>
            <Text color={textColor}>
              We may share your data with trusted third-party services for the
              purpose of fulfilling your order, such as:
            </Text>
            <UnorderedList spacing={2} color={textColor} pl={4} mt={2}>
              <ListItem>
                <strong>Payment Gateways:</strong> (e.g., Razorpay, Stripe) for
                secure payment processing.
              </ListItem>
              <ListItem>
                <strong>Logistics Partners:</strong> (e.g., Shiprocket) for
                delivering your orders.
              </ListItem>
            </UnorderedList>
            <Text color={textColor} mt={2}>
              Note that Rao Sahab Wear has no access to or control over the
              cookies that are used by third-party advertisers.
            </Text>
          </Box>

          {/* 5. Security */}
          <Box>
            <Heading size="md" color={headingColor} mb={3}>
              5. Data Security
            </Heading>
            <Text color={textColor}>
              We value your trust in providing us your Personal Information,
              thus we are striving to use commercially acceptable means of
              protecting it. However, remember that no method of transmission
              over the internet, or method of electronic storage is 100% secure
              and reliable, and we cannot guarantee its absolute security.
            </Text>
          </Box>

          <Divider />

          {/* Contact CTA */}
          <Box w="full" textAlign="center" pt={4}>
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Have privacy concerns?
            </Text>
            <Button as={RouterLink} to="/contact" colorScheme="cyan" size="lg">
              Contact Us
            </Button>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default Privacy;
