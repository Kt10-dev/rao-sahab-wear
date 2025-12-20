// src/pages/Terms.js

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

const Terms = () => {
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
            Terms & Conditions
          </Heading>
          <Text fontSize="lg" color={textColor}>
            Welcome to <strong>Rao Sahab Wear</strong>! These terms and
            conditions outline the rules and regulations for the use of our
            Website, located at raosahabwear.in.
          </Text>
          <Text color={textColor} fontSize="sm">
            By accessing this website we assume you accept these terms and
            conditions. Do not continue to use Rao Sahab Wear if you do not
            agree to take all of the terms and conditions stated on this page.
          </Text>

          <Divider />

          {/* 1. Accounts */}
          <Box>
            <Heading size="md" color={headingColor} mb={3}>
              1. Your Account
            </Heading>
            <Text color={textColor}>
              If you create an account on our website, you are responsible for
              maintaining the security of your account and you are fully
              responsible for all activities that occur under the account. You
              must immediately notify us of any unauthorized uses of your
              account or any other breaches of security.
            </Text>
          </Box>

          {/* 2. Products & Pricing */}
          <Box>
            <Heading size="md" color={headingColor} mb={3}>
              2. Products & Pricing
            </Heading>
            <Text color={textColor} mb={2}>
              We make every effort to display as accurately as possible the
              colors, features, specifications, and details of the products
              available on the Site. However, we do not guarantee that the
              colors, features, specifications, and details of the products will
              be accurate, complete, reliable, current, or free of other errors.
            </Text>
            <UnorderedList spacing={2} color={textColor} pl={4}>
              <ListItem>All products are subject to availability.</ListItem>
              <ListItem>
                Prices for our products are subject to change without notice.
              </ListItem>
              <ListItem>
                We reserve the right to discontinue any product at any time.
              </ListItem>
            </UnorderedList>
          </Box>

          {/* 3. Orders & Payments */}
          <Box>
            <Heading size="md" color={headingColor} mb={3}>
              3. Orders & Payments
            </Heading>
            <Text color={textColor}>
              We reserve the right to refuse any order you place with us. We
              may, in our sole discretion, limit or cancel quantities purchased
              per person, per household, or per order. In the event that we make
              a change to or cancel an order, we may attempt to notify you by
              contacting the e-mail and/or billing address/phone number provided
              at the time the order was made.
            </Text>
          </Box>

          {/* 4. Intellectual Property */}
          <Box>
            <Heading size="md" color={headingColor} mb={3}>
              4. Intellectual Property
            </Heading>
            <Text color={textColor}>
              Unless otherwise stated, Rao Sahab Wear and/or its licensors own
              the intellectual property rights for all material on Rao Sahab
              Wear. All intellectual property rights are reserved. You may
              access this from Rao Sahab Wear for your own personal use
              subjected to restrictions set in these terms and conditions.
            </Text>
          </Box>

          {/* 5. User Comments/Reviews */}
          <Box>
            <Heading size="md" color={headingColor} mb={3}>
              5. User Reviews
            </Heading>
            <Text color={textColor}>
              Parts of this website offer an opportunity for users to post and
              exchange opinions and information (Reviews). Rao Sahab Wear does
              not filter, edit, publish or review Comments prior to their
              presence on the website. Comments do not reflect the views and
              opinions of Rao Sahab Wear, its agents, and/or affiliates.
            </Text>
          </Box>

          {/* 6. Governing Law */}
          <Box>
            <Heading size="md" color={headingColor} mb={3}>
              6. Governing Law
            </Heading>
            <Text color={textColor}>
              These terms and conditions are governed by and construed in
              accordance with the laws of India and you irrevocably submit to
              the exclusive jurisdiction of the courts in that State or
              location.
            </Text>
          </Box>

          <Divider />

          {/* Contact CTA */}
          <Box w="full" textAlign="center" pt={4}>
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Questions about the Terms of Service?
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

export default Terms;
