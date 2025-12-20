// src/components/Footer/Footer.js

import React from "react";
import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  VStack,
  HStack,
  Heading,
  Divider,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import "./Footer.css"; // CSS animations for matrix rain

const quickLinks = [
  { label: "Shop All", path: "/products" },
  { label: "About Us", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "FAQ", path: "/faq" },
];

const policyLinks = [
  { label: "Returns & Exchange", path: "/returns" },
  { label: "Shipping Policy", path: "/shipping" },
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Terms of Service", path: "/terms" },
];

const Footer = () => {
  const bg = useColorModeValue("gray.900", "gray.900");
  const color = "gray.300";
  const hoverColor = "cyan.400";

  const LinkItem = ({ label, path }) => (
    <Link
      as={RouterLink}
      to={path}
      fontSize="sm"
      color={color}
      _hover={{
        color: hoverColor,
        textDecoration: "underline",
        transform: "scale(1.1)",
        transition: "all 0.2s",
        textShadow: "0 0 6px cyan, 0 0 10px cyan",
      }}
    >
      {label}
    </Link>
  );

  return (
    <Box
      className="matrix-rain"
      bg={bg}
      color={color}
      mt={12}
      borderTop="1px solid rgba(0,255,255,0.2)"
      overflow="hidden"
      position="relative"
    >
      <Container maxW="1200px" py={12} position="relative" zIndex={2}>
        <Stack
          direction={{ base: "column", md: "row" }}
          spacing={{ base: 10, md: 16 }}
          justify="space-between"
          align={{ base: "center", md: "flex-start" }}
          textAlign={{ base: "center", md: "left" }}
        >
          {/* Section 1: Logo & Social */}
          <VStack
            spacing={4}
            align={{ base: "center", md: "flex-start" }}
            maxW="250px"
          >
            <Heading
              size="md"
              bgGradient="linear(to-r, cyan.400, blue.500, purple.500)"
              bgClip="text"
              letterSpacing="-1px"
            >
              Rao Sahab{" "}
              <Text as="span" fontWeight="light" color="gray.400">
                Wear
              </Text>
            </Heading>
            <Text fontSize="sm" color="gray.400">
              Crafting premium ethnic wear with a touch of hacker vibes since
              2024.
            </Text>
            <HStack spacing={4} pt={2}>
              <IconButton
                as="a"
                href="#"
                icon={<FaFacebook />}
                aria-label="Facebook"
                size="md"
                variant="ghost"
                color={color}
                _hover={{
                  color: "blue.400",
                  transform: "scale(1.3)",
                  filter: "drop-shadow(0 0 10px blue)",
                }}
              />
              <IconButton
                as="a"
                href="#"
                icon={<FaTwitter />}
                aria-label="Twitter"
                size="md"
                variant="ghost"
                color={color}
                _hover={{
                  color: "cyan.400",
                  transform: "scale(1.3)",
                  filter: "drop-shadow(0 0 10px cyan)",
                }}
              />
              <IconButton
                as="a"
                href="#"
                icon={<FaInstagram />}
                aria-label="Instagram"
                size="md"
                variant="ghost"
                color={color}
                _hover={{
                  color: "pink.400",
                  transform: "scale(1.3)",
                  filter: "drop-shadow(0 0 10px pink)",
                }}
              />
            </HStack>
          </VStack>

          {/* Section 2: Quick Links */}
          <VStack spacing={3} align={{ base: "center", md: "flex-start" }}>
            <Heading size="sm" color="white" mb={2}>
              Quick Links
            </Heading>
            {quickLinks.map((link) => (
              <LinkItem key={link.label} label={link.label} path={link.path} />
            ))}
          </VStack>

          {/* Section 3: Policies */}
          <VStack spacing={3} align={{ base: "center", md: "flex-start" }}>
            <Heading size="sm" color="white" mb={2}>
              Customer Care
            </Heading>
            {policyLinks.map((link) => (
              <LinkItem key={link.label} label={link.label} path={link.path} />
            ))}
          </VStack>

          {/* Section 4: Contact */}
          <VStack spacing={3} align={{ base: "center", md: "flex-start" }}>
            <Heading size="sm" color="white" mb={2}>
              Get In Touch
            </Heading>
            <HStack spacing={2}>
              <FaEnvelope color={hoverColor} />
              <Link fontSize="sm" color={color} _hover={{ color: hoverColor }}>
                support@raosahabwear.in
              </Link>
            </HStack>
            <HStack spacing={2}>
              <FaPhone color={hoverColor} />
              <Text fontSize="sm">+91 98765 43210</Text>
            </HStack>
          </VStack>
        </Stack>

        <Divider borderColor="rgba(0,255,255,0.2)" my={8} />

        <Text fontSize="xs" textAlign="center" color="gray.500">
          &copy; {new Date().getFullYear()} Rao Sahab Wear. All rights reserved.
        </Text>
      </Container>
    </Box>
  );
};

export default Footer;
