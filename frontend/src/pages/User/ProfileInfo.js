// src/pages/User/ProfileInfo.js
import React from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Divider,
  Button,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaEdit, FaLock } from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const MotionButton = motion(Button);
const MotionBox = motion(Box);

const ProfileInfo = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      p={8}
      borderRadius="2xl"
      bg="rgba(7, 11, 46, 0.73)" // Semi-transparent white
      backdropFilter="blur(20px)" // Glassy blur effect
      boxShadow="0 10px 40px rgba(0,0,0,0.25), 0 0 15px rgba(0,255,255,0.15)" // Soft neon glow
      border="1px solid rgba(255,255,255,0.2)"
      w="full"
    >
      <VStack align="start" spacing={5}>
        <Heading
          size="lg"
          bgGradient="linear(to-r, cyan.400, pink.400)"
          bgClip="text"
          textShadow="0 0 6px #00fff0, 0 0 12px #ff00ff"
        >
          Personal Information
        </Heading>
        <Divider borderColor="rgba(255,255,255,0.1)" />

        <Box>
          <Text fontSize="sm" color="gray.400">
            Full Name
          </Text>
          <Text fontSize="xl" fontWeight="bold" color="cyan.200">
            {user.name}
          </Text>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.400">
            Email Address
          </Text>
          <Text fontSize="xl" fontWeight="bold" color="cyan.200">
            {user.email}
          </Text>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.400">
            Account Type
          </Text>
          <Text
            fontSize="md"
            fontWeight="bold"
            bgGradient="linear(to-r, green.400, teal.400)"
            bgClip="text"
            textShadow="0 0 6px rgba(0,255,128,0.6)"
          >
            {user.role.toUpperCase()}
          </Text>
        </Box>

        <Divider borderColor="rgba(255,255,255,0.1)" />

        <HStack spacing={4}>
          <MotionButton
            leftIcon={<FaEdit />}
            colorScheme="cyan"
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px #00fff0" }}
            whileTap={{ scale: 0.97 }}
          >
            Edit Profile
          </MotionButton>
          <MotionButton
            leftIcon={<FaLock />}
            variant="outline"
            colorScheme="gray"
            whileHover={{ scale: 1.05, boxShadow: "0 0 12px #ffffff33" }}
            whileTap={{ scale: 0.97 }}
          >
            Change Password
          </MotionButton>
        </HStack>
      </VStack>
    </MotionBox>
  );
};

export default ProfileInfo;
