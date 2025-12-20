// src/pages/Admin/AdminLayout.js

import React from "react";
import {
  Box,
  Flex,
  VStack,
  Heading,
  Divider,
  Button,
  Spacer,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { Outlet, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  FaBox,
  FaUsers,
  FaSignOutAlt,
  FaChartBar,
  FaTruck,
  FaBars, // 🟢 Menu Icon
  FaTicketAlt,
  FaImages,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

// -------------------------------------------------------------------
// 1. Admin Sidebar Content (Reusable)
// -------------------------------------------------------------------
const SidebarContent = ({ user, logoutHandler, onClose }) => (
  <VStack
    w="full"
    h="full"
    p={5}
    bg="gray.800"
    spacing={4}
    align="stretch"
    color="whiteAlpha.800"
  >
    <Heading size="md" color="red.400" mb={4}>
      Admin Panel
    </Heading>
    <Divider borderColor="gray.700" />

    {[
      { name: "Dashboard", path: "/admin", icon: FaChartBar },
      { name: "Manage Products", path: "products", icon: FaBox },
      { name: "Manage Categories", path: "categories", icon: FaBox },
      { name: "Orders", path: "orders", icon: FaTruck },
      { name: "Coupons", path: "coupons", icon: FaTicketAlt },
      { name: "Manage Users", path: "users", icon: FaUsers },
      { name: "Banners", path: "banners", icon: FaImages },
    ].map((item) => (
      <Button
        key={item.name}
        as={RouterLink}
        to={item.path}
        leftIcon={<item.icon />}
        justifyContent="flex-start"
        variant="ghost"
        colorScheme="red"
        _hover={{ bg: "red.600" }}
        isActive={window.location.pathname.includes(item.path)}
        onClick={onClose} // 🟢 Mobile par click karne ke baad drawer band ho jaye
      >
        {item.name}
      </Button>
    ))}

    <Spacer />
    <Button
      leftIcon={<FaSignOutAlt />}
      onClick={logoutHandler}
      colorScheme="red"
      variant="outline"
    >
      Logout ({user?.name?.split(" ")[0]})
    </Button>
  </VStack>
);

// -------------------------------------------------------------------
// 2. Admin Layout Component (Responsive)
// -------------------------------------------------------------------
const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure(); // 🟢 Drawer State

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <Flex h="100vh" overflow="hidden" bg="gray.100">
      {/* 🟢 DESKTOP SIDEBAR (Hidden on Mobile) */}
      <Box display={{ base: "none", md: "block" }} w="250px" h="100vh">
        <SidebarContent user={user} logoutHandler={handleLogout} />
      </Box>

      {/* 🟢 MOBILE DRAWER (Visible on Click) */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent bg="gray.800">
          <DrawerCloseButton color="white" />
          <DrawerBody p={0}>
            <SidebarContent
              user={user}
              logoutHandler={handleLogout}
              onClose={onClose}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* 🟢 MAIN CONTENT AREA */}
      <Flex flexDir="column" flex={1} h="100vh" overflow="hidden">
        {/* Mobile Header (Visible only on Mobile) */}
        <HStack
          display={{ base: "flex", md: "none" }}
          p={4}
          bg="white"
          shadow="sm"
          justify="space-between"
          align="center"
        >
          <IconButton
            icon={<FaBars />}
            onClick={onOpen}
            variant="ghost"
            aria-label="Open Menu"
          />
          <Heading size="sm" color="gray.700">
            Admin Panel
          </Heading>
          <Box w={8} /> {/* Spacer for centering */}
        </HStack>

        {/* Page Content (Scrollable) */}
        <Box
          flex={1}
          p={{ base: 4, md: 8 }} // Mobile par thoda kam padding
          overflowY="auto"
          overflowX="hidden"
        >
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
};

export default AdminLayout;
