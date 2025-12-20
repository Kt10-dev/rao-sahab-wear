// src/pages/User/UserLayout.js
import React from "react";
import {
  Box,
  Heading,
  Stack,
  Avatar,
  Text,
  Tabs,
  TabList,
  Tab,
  HStack,
  Button,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FaShoppingBag,
  FaUserCircle,
  FaMapMarkedAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const UserLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getTabIndex = () => {
    const path = location.pathname;
    if (path.includes("/profile/orders")) return 1;
    if (path.includes("/profile/addresses")) return 2;
    return 0;
  };

  const handleTabChange = (index) => {
    switch (index) {
      case 0:
        navigate("/profile");
        break;
      case 1:
        navigate("/profile/orders");
        break;
      case 2:
        navigate("/profile/addresses");
        break;
      default:
        navigate("/profile");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <MotionBox
      maxW="1200px"
      mx="auto"
      py={10}
      px={{ base: 4, md: 8 }}
      minH="80vh"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      bg="rgba(7, 11, 46, 0.73)"
      backdropFilter="blur(18px)"
      borderRadius="2xl"
      border="1px solid rgba(255,255,255,0.2)"
      boxShadow="0 10px 40px rgba(0,0,0,0.25), 0 0 15px rgba(0,255,255,0.1)"
    >
      <Stack
        direction={{ base: "column", md: "row" }}
        spacing={10}
        mb={8}
        align="center"
      >
        <Avatar size="2xl" name={user.name} src="https://bit.ly/dan-abramov" />
        <Box textAlign={{ base: "center", md: "left" }}>
          <Heading
            as="h1"
            size="xl"
            bgGradient="linear(to-r, cyan.400, pink.400)"
            bgClip="text"
            textShadow="0 0 6px #00fff0, 0 0 12px #ff00ff"
          >
            Hello, {user.name}!
          </Heading>
          <Text color="gray.400">Welcome to your personal dashboard.</Text>
        </Box>
        <Box
          flexGrow={1}
          textAlign="right"
          display={{ base: "none", md: "block" }}
        >
          <MotionButton
            leftIcon={<FaSignOutAlt />}
            onClick={handleLogout}
            colorScheme="red"
            variant="outline"
            whileHover={{
              scale: 1.05,
              boxShadow:
                "0 0 15px rgba(255,0,0,0.5), 0 0 25px rgba(255,100,0,0.3)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            Logout
          </MotionButton>
        </Box>
      </Stack>

      <Tabs
        index={getTabIndex()}
        onChange={handleTabChange}
        isLazy
        variant="enclosed"
      >
        <TabList mb="0">
          <Tab>
            <HStack>
              <FaUserCircle /> <Text>Profile Info</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <FaShoppingBag /> <Text>Order History</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <FaMapMarkedAlt /> <Text>Addresses</Text>
            </HStack>
          </Tab>
        </TabList>

        <Box
          p={6}
          borderWidth="1px"
          borderTop="none"
          borderBottomRadius="lg"
          bg="rgba(255,255,255,0.08)"
          backdropFilter="blur(12px)"
          boxShadow="0 5px 30px rgba(0,0,0,0.2), 0 0 10px rgba(0,255,255,0.1)"
        >
          <Outlet />
        </Box>
      </Tabs>
    </MotionBox>
  );
};

export default UserLayout;
