import React from "react";
import { NavLink as RouterLink } from "react-router-dom";
import {
  Box,
  Flex,
  Link,
  Text,
  HStack,
  IconButton,
  Spacer,
  useDisclosure,
  VStack,
  Collapse,
} from "@chakra-ui/react";
import { FaShoppingCart, FaUser, FaBars, FaTimes } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { cartTotal } = useCart();
  const { user, isAdmin } = useAuth();
  const { isOpen, onToggle } = useDisclosure();

  const navItems = [
    { label: "Homepage", path: "/" },
    { label: "Shop", path: "/products" },
    { label: "Collections", path: "/collections" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  if (isAdmin) {
    navItems.push({ label: "Admin Dashboard", path: "/admin" });
  }

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="999"
      bgGradient="linear(to-r, #FF8E3C, #FF0080)"
      boxShadow="0 4px 12px rgba(0,0,0,0.1)"
    >
      <Flex
        h={20}
        align="center"
        maxW="1200px"
        mx="auto"
        px={{ base: 4, md: 8 }}
      >
        {/* LOGO */}
        <Link as={RouterLink} to="/" _hover={{ textDecoration: "none" }}>
          <Text
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="bold"
            color="white"
            cursor="pointer"
            letterSpacing="tight"
          >
            Rao Sahab
            <Text as="span" fontWeight="light" ml={1}>
              Wear
            </Text>
          </Text>
        </Link>

        {/* DESKTOP NAV */}
        <HStack spacing={8} display={{ base: "none", md: "flex" }} ml={10}>
          {navItems.map((item) => (
            <Link
              key={item.label}
              as={RouterLink}
              to={item.path}
              fontSize="md"
              fontWeight="500"
              color="whiteAlpha.900"
              transition="0.2s"
              _hover={{
                color: "white",
                transform: "translateY(-2px)",
                textDecoration: "none",
              }}
              _activeLink={{
                color: "white",
                fontWeight: "bold",
                borderBottom: "2px solid white",
              }}
            >
              {item.label}
            </Link>
          ))}
        </HStack>

        <Spacer />

        {/* ICONS */}
        <HStack spacing={4}>
          <IconButton
            as={RouterLink}
            to="/login"
            icon={<FaUser size="1.2em" />}
            aria-label="Login"
            variant="ghost"
            color="white"
            _hover={{ bg: "whiteAlpha.300", transform: "scale(1.1)" }}
            _active={{ bg: "whiteAlpha.400" }}
          />

          <Box position="relative">
            <IconButton
              as={RouterLink}
              to="/cart"
              icon={<FaShoppingCart size="1.2em" />}
              aria-label="Cart"
              variant="ghost"
              color="white"
              _hover={{ bg: "whiteAlpha.300", transform: "scale(1.1)" }}
              _active={{ bg: "whiteAlpha.400" }}
            />

            {cartTotal > 0 && (
              <Text
                position="absolute"
                top="-2px"
                right="-2px"
                bg="white"
                color="#FF0080"
                fontSize="xs"
                px="1.5"
                py="0.5"
                borderRadius="full"
                fontWeight="bold"
                boxShadow="0 2px 5px rgba(0,0,0,0.2)"
              >
                {cartTotal}
              </Text>
            )}
          </Box>

          {/* Mobile Menu Toggle */}
          <IconButton
            icon={isOpen ? <FaTimes /> : <FaBars />}
            aria-label="Menu"
            variant="ghost"
            color="white"
            onClick={onToggle}
            display={{ base: "flex", md: "none" }}
            _hover={{ bg: "whiteAlpha.300" }}
          />
        </HStack>
      </Flex>

      {/* MOBILE NAV MENU (Collapsible) */}
      <Collapse in={isOpen} animateOpacity>
        <Box
          pb={4}
          display={{ md: "none" }}
          bg="rgba(255, 255, 255, 0.1)"
          backdropFilter="blur(10px)"
        >
          <VStack as="nav" spacing={4} align="stretch" px={4} py={2}>
            {navItems.map((item) => (
              <Link
                key={item.label}
                as={RouterLink}
                to={item.path}
                onClick={onToggle} // Close menu on click
                py={2}
                fontSize="lg"
                fontWeight="500"
                color="white"
                textAlign="center"
                borderRadius="md"
                _hover={{
                  bg: "whiteAlpha.200",
                  textDecoration: "none",
                }}
                _activeLink={{
                  bg: "whiteAlpha.300",
                  fontWeight: "bold",
                }}
              >
                {item.label}
              </Link>
            ))}
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default Header;
