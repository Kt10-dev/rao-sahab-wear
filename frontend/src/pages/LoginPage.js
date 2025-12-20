import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Text,
  VStack,
  useToast,
  Link,
  Container,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

// Rive Animation
import {
  useRive,
  useStateMachineInput,
  Layout,
  Fit,
  Alignment,
} from "@rive-app/react-canvas";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionButton = motion(Button);

const API_BASE_URL = "https://raosahab-api.onrender.com";

// --- River/Water Animation Components (Updated for Responsiveness) ---
const FloatingWaterShape = ({
  color,
  top,
  left,
  right,
  bottom,
  delay,
  duration,
}) => {
  return (
    <MotionBox
      position="absolute"
      top={top}
      left={left}
      right={right}
      bottom={bottom}
      bg={color}
      filter="blur(60px)"
      // Responsiveness: Mobile pe chota size, Desktop pe bada
      w={{ base: "200px", md: "400px", lg: "500px" }}
      h={{ base: "200px", md: "400px", lg: "500px" }}
      borderRadius="full"
      opacity={0.6}
      zIndex={0}
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 90, 0],
        x: [0, 30, -30, 0],
        y: [0, -40, 40, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
    />
  );
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useAuth();

  const glassBg = "rgba(15, 32, 39, 0.65)";
  const borderStyle = "1px solid rgba(255, 255, 255, 0.1)";

  // --------------------------------------------------
  // 🟢 Rive Animation Logic
  // --------------------------------------------------
  const { rive, RiveComponent } = useRive({
    src: "/login-animation.riv",
    stateMachines: "State Machine 1",
    autoplay: true,
    layout: new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
  });

  const isCheckingInput = useStateMachineInput(
    rive,
    "State Machine 1",
    "Check"
  );
  const lookInput = useStateMachineInput(rive, "State Machine 1", "Look");
  const successTrigger = useStateMachineInput(
    rive,
    "State Machine 1",
    "success"
  );
  const failTrigger = useStateMachineInput(rive, "State Machine 1", "fail");

  useEffect(() => {
    if (isAuthenticated)
      navigate(isAdmin ? "/admin" : "/profile", { replace: true });
  }, [isAuthenticated, isAdmin, navigate]);

  const onEmailFocus = () => {
    if (isCheckingInput) isCheckingInput.value = false;
  };
  const onEmailChange = (e) => {
    setEmail(e.target.value);
    if (lookInput) lookInput.value = e.target.value.length * 2;
  };
  const onPasswordFocus = () => {
    if (isCheckingInput) isCheckingInput.value = true;
  };
  const onPasswordBlur = () => {
    if (isCheckingInput) isCheckingInput.value = false;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/users/login`, {
        email,
        password,
      });

      if (successTrigger) successTrigger.fire();
      if (isCheckingInput) isCheckingInput.value = false;
      login(data);

      toast({
        title: "Welcome Back",
        description: "Login successful.",
        status: "success",
        position: "top",
        duration: 2000,
      });
    } catch (err) {
      if (failTrigger) failTrigger.fire();
      if (isCheckingInput) isCheckingInput.value = false;

      toast({
        title: "Access Denied",
        description: err.response?.data?.message || "Invalid credentials",
        status: "error",
        position: "top",
      });
      setLoading(false);
    }
  };

  if (isAuthenticated) return null;

  return (
    <Box
      minH="100vh"
      w="100vw"
      position="relative"
      overflow="hidden"
      bg="gray.900"
      display="flex"
      alignItems="center"
      justifyContent="center"
      // Mobile par thoda padding taaki keyboard open hone par content na kate
      py={{ base: 4, md: 0 }}
    >
      {/* --- River/Liquid Background Animation --- */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient="linear(to-br, #091c28, #051016)"
        zIndex={0}
      />

      {/* Flowing Water Blobs - Responsive Positions */}
      <FloatingWaterShape
        color="#00d2ff"
        top={{ base: "-5%", md: "-10%" }}
        left={{ base: "-20%", md: "-10%" }}
        delay={0}
        duration={15}
      />
      <FloatingWaterShape
        color="#3a7bd5"
        top={{ base: "auto", md: "60%" }}
        bottom={{ base: "-10%", md: "auto" }}
        left={{ base: "auto", md: "80%" }}
        right={{ base: "-20%", md: "auto" }}
        delay={2}
        duration={18}
      />

      {/* Container Responsive Width */}
      <Container
        maxW="md"
        p={0}
        position="relative"
        zIndex={1}
        w={{ base: "90%", md: "100%" }} // Mobile par 90% width
      >
        <MotionBox
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          bg={glassBg}
          backdropFilter="blur(20px)"
          // Padding responsive: Mobile par 6, Desktop par 8
          p={{ base: 6, md: 8 }}
          borderRadius="3xl"
          boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.5)"
          border={borderStyle}
        >
          {/* 🐻 Animation Area */}
          <Box
            // Animation box height responsive
            h={{ base: "150px", md: "200px" }}
            mb={6}
            mt={-12}
            borderRadius="2xl"
            overflow="hidden"
            boxShadow="0 0 20px rgba(0, 210, 255, 0.3)"
            bg="radial-gradient(circle, rgba(16, 52, 76, 1) 0%, rgba(9, 28, 40, 1) 100%)"
          >
            <RiveComponent />
          </Box>

          <VStack spacing={2} mb={6} textAlign="center">
            <Heading
              fontSize={{ base: "xl", md: "2xl" }} // Text thoda chota mobile par
              fontWeight="700"
              letterSpacing="-0.5px"
              bgGradient="linear(to-r, cyan.200, blue.300)"
              bgClip="text"
            >
              Welcome Back
            </Heading>
            <Text fontSize={{ base: "xs", md: "sm" }} color="blue.100">
              Enter your details to access your account
            </Text>
          </VStack>

          <form onSubmit={submitHandler}>
            <MotionVStack spacing={{ base: 4, md: 5 }}>
              <FormControl>
                <FormLabel
                  fontSize="xs"
                  fontWeight="600"
                  textTransform="uppercase"
                  letterSpacing="1px"
                  color="blue.200"
                  mb={1}
                >
                  Email Address
                </FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={onEmailChange}
                  onFocus={onEmailFocus}
                  required
                  height={{ base: "45px", md: "50px" }} // Height adjustment
                  fontSize="md"
                  variant="filled"
                  bg="rgba(0,0,0,0.3)"
                  color="white"
                  border="1px solid rgba(255,255,255,0.1)"
                  borderRadius="xl"
                  _placeholder={{ color: "gray.400" }}
                  _hover={{ bg: "rgba(0,0,0,0.4)" }}
                  _focus={{
                    bg: "rgba(0,0,0,0.5)",
                    borderColor: "cyan.400",
                    boxShadow: "0 0 10px rgba(0, 210, 255, 0.3)",
                  }}
                  transition="all 0.2s"
                />
              </FormControl>

              {/* 🔒 Password Input */}
              <FormControl>
                <FormLabel
                  fontSize="xs"
                  fontWeight="600"
                  textTransform="uppercase"
                  letterSpacing="1px"
                  color="blue.200"
                  mb={1}
                >
                  Password
                </FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={onPasswordFocus}
                  onBlur={onPasswordBlur}
                  required
                  height={{ base: "45px", md: "50px" }}
                  fontSize="md"
                  variant="filled"
                  bg="rgba(0,0,0,0.3)"
                  color="white"
                  border="1px solid rgba(255,255,255,0.1)"
                  borderRadius="xl"
                  _placeholder={{ color: "gray.400" }}
                  _hover={{ bg: "rgba(0,0,0,0.4)" }}
                  _focus={{
                    bg: "rgba(0,0,0,0.5)",
                    borderColor: "cyan.400",
                    boxShadow: "0 0 10px rgba(0, 210, 255, 0.3)",
                  }}
                  transition="all 0.2s"
                />
              </FormControl>

              {/* Forgot Password */}
              <Box w="full" textAlign="right">
                <Link
                  as={RouterLink}
                  to="/forgot-password"
                  fontSize="xs"
                  fontWeight="600"
                  color="cyan.300"
                  _hover={{ color: "cyan.100", textDecoration: "none" }}
                >
                  Forgot Password?
                </Link>
              </Box>

              {/* Gradient Button */}
              <MotionButton
                type="submit"
                w="100%"
                h={{ base: "48px", md: "54px" }}
                bgGradient="linear(to-r, cyan.500, blue.600)"
                color="white"
                fontSize="md"
                fontWeight="600"
                borderRadius="xl"
                isLoading={loading}
                whileHover={{
                  scale: 1.02,
                  bgGradient: "linear(to-r, cyan.400, blue.500)",
                  boxShadow: "0 0 20px rgba(0, 210, 255, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                _active={{ bg: "blue.700" }}
              >
                Sign In
              </MotionButton>
            </MotionVStack>
          </form>

          {/* Footer */}
          <Text
            textAlign="center"
            mt={{ base: 6, md: 8 }}
            fontSize="sm"
            color="gray.400"
          >
            Don't have an account?{" "}
            <Link
              as={RouterLink}
              to="/register"
              fontWeight="700"
              color="cyan.300"
              _hover={{ color: "cyan.100", textDecoration: "none" }}
            >
              Join Us
            </Link>
          </Text>
        </MotionBox>
      </Container>
    </Box>
  );
}
