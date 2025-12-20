// src/pages/RegisterPage.js

import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Link,
  InputGroup,
  InputRightElement,
  IconButton,
  Divider,
  HStack,
  useToast,
  Container,
} from "@chakra-ui/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
// Import Rive Component
import RiveYeti from "../components/RiveYeti";

const API_BASE_URL = "https://raosahab-api.onrender.com";

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionButton = motion(Button);

// --- River/Water Animation Components ---
const FloatingWaterShape = ({ color, top, left, delay, duration }) => {
  return (
    <MotionBox
      position="absolute"
      top={top}
      left={left}
      bg={color}
      filter="blur(60px)"
      w={{ base: "200px", md: "500px" }} // Mobile pe chota kiya
      h={{ base: "200px", md: "500px" }}
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

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // --- Rive State Logic ---
  const [focusedField, setFocusedField] = useState("");
  const [riveSuccess, setRiveSuccess] = useState(false);
  const [riveFail, setRiveFail] = useState(false);

  const getLookLength = () => {
    if (focusedField === "name") return name.length;
    if (focusedField === "email") return email.length;
    return 0;
  };

  const toast = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  // Glassmorphism Style
  const glassBg = "rgba(15, 32, 39, 0.75)";
  const borderStyle = "1px solid rgba(255, 255, 255, 0.1)";

  // -------------------------
  // Step 1: Send OTP
  // -------------------------
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        status: "error",
      });
      setRiveFail(true);
      setTimeout(() => setRiveFail(false), 1000);
      return;
    }

    setLoading(true);
    try {
      const config = { headers: { "Content-Type": "application/json" } };
      await axios.post(
        `${API_BASE_URL}/api/users/send-otp`,
        { name, email, password },
        config
      );

      setRiveSuccess(true);
      toast({
        title: "OTP Sent",
        description: `A 6-digit code has been sent to ${email}.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setTimeout(() => {
        setStep(2);
        setRiveSuccess(false);
      }, 1500);
    } catch (error) {
      setRiveFail(true);
      setTimeout(() => setRiveFail(false), 1000);

      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "OTP sending failed. Check server logs.",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Step 2: Verify OTP
  // -------------------------
  const handleVerifyOtpAndRegister = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Enter 6-digit OTP.",
        status: "error",
      });
      return;
    }
    setLoading(true);
    try {
      const config = { headers: { "Content-Type": "application/json" } };
      const { data } = await axios.post(
        `${API_BASE_URL}/api/users/verify-otp`,
        { email, otp },
        config
      );
      login(data);
      toast({
        title: "Registration Complete!",
        description: `Welcome, ${data.name}!`,
        status: "success",
        status: "success",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Verification Failed",
        description:
          error.response?.data?.message || "OTP verification failed.",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" w="100%" bg="gray.900" position="relative">
      {/* 🟢 FIX: Background Container Fixed Position 
         Isse background fix rahega aur blobs screen se bahar jane par scroll trigger nahi karenge.
      */}
      <Box
        position="fixed"
        top="0"
        left="0"
        w="100%"
        h="100%"
        overflow="hidden"
        zIndex={0}
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient="linear(to-br, #091c28, #051016)"
        />
        <FloatingWaterShape
          color="#00d2ff"
          top="-10%"
          left="-10%"
          delay={0}
          duration={15}
        />
        <FloatingWaterShape
          color="#3a7bd5"
          top="40%"
          left="80%"
          delay={2}
          duration={18}
        />
        <FloatingWaterShape
          color="#00d2ff"
          top="70%"
          left="-10%"
          delay={4}
          duration={20}
        />
      </Box>

      {/* --- Main Content (Scrollable) --- */}
      <Container
        maxW="lg"
        minH="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        pt={{ base: "140px", md: "120px" }}
        pb={{ base: "40px", md: "40px" }}
        position="relative"
        zIndex={1}
        px={4}
      >
        <MotionBox
          p={{ base: 6, md: 8 }}
          borderRadius="3xl"
          w="full"
          bg={glassBg}
          backdropFilter="blur(20px)"
          boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.5)"
          border={borderStyle}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Add Rive Yeti Here - Only show on Step 1 */}
          {step === 1 && (
            <Box display="flex" justifyContent="center">
              <RiveYeti
                isPasswordFocused={
                  focusedField === "password" ||
                  focusedField === "confirmPassword"
                }
                isChecking={focusedField === "name" || focusedField === "email"}
                inputLength={getLookLength()}
                triggerSuccess={riveSuccess}
                triggerFail={riveFail}
              />
            </Box>
          )}

          <VStack spacing={4} align="stretch" mt={step === 1 ? 0 : 6}>
            <VStack spacing={1} textAlign="center">
              <MotionHeading
                as="h1"
                size={{ base: "lg", md: "xl" }}
                bgGradient="linear(to-r, cyan.200, blue.300)"
                bgClip="text"
              >
                {step === 1 ? "Join the Flow" : "Verify Email"}
              </MotionHeading>
              <Text color="blue.100" fontSize="sm">
                {step === 1
                  ? "Create an account to dive in."
                  : `Code sent to ${email}`}
              </Text>
            </VStack>

            {step === 1 && (
              <form onSubmit={handleSendOtp} style={{ width: "100%" }}>
                <VStack spacing={3}>
                  <FormControl id="name" isRequired>
                    <FormLabel color="blue.200" fontSize="xs" mb={1}>
                      Full Name
                    </FormLabel>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField("")}
                      variant="filled"
                      bg="rgba(0,0,0,0.3)"
                      _hover={{ bg: "rgba(0,0,0,0.4)" }}
                      _focus={{
                        bg: "rgba(0,0,0,0.5)",
                        borderColor: "cyan.400",
                      }}
                      color="white"
                      placeholder="John Doe"
                    />
                  </FormControl>

                  <FormControl id="email" isRequired>
                    <FormLabel color="blue.200" fontSize="xs" mb={1}>
                      Email Address
                    </FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField("")}
                      variant="filled"
                      bg="rgba(0,0,0,0.3)"
                      _hover={{ bg: "rgba(0,0,0,0.4)" }}
                      _focus={{
                        bg: "rgba(0,0,0,0.5)",
                        borderColor: "cyan.400",
                      }}
                      color="white"
                      placeholder="john@example.com"
                    />
                  </FormControl>

                  <FormControl id="password" isRequired>
                    <FormLabel color="blue.200" fontSize="xs" mb={1}>
                      Password
                    </FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField("")}
                        variant="filled"
                        bg="rgba(0,0,0,0.3)"
                        _hover={{ bg: "rgba(0,0,0,0.4)" }}
                        _focus={{
                          bg: "rgba(0,0,0,0.5)",
                          borderColor: "cyan.400",
                        }}
                        color="white"
                      />
                      <InputRightElement>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowPassword(!showPassword)}
                          icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                          color="cyan.300"
                          _hover={{ bg: "transparent", color: "white" }}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <FormControl id="confirmPassword" isRequired>
                    <FormLabel color="blue.200" fontSize="xs" mb={1}>
                      Confirm Password
                    </FormLabel>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField("confirmPassword")}
                      onBlur={() => setFocusedField("")}
                      variant="filled"
                      bg="rgba(0,0,0,0.3)"
                      _hover={{ bg: "rgba(0,0,0,0.4)" }}
                      _focus={{
                        bg: "rgba(0,0,0,0.5)",
                        borderColor: "cyan.400",
                      }}
                      color="white"
                    />
                  </FormControl>

                  <MotionButton
                    type="submit"
                    bgGradient="linear(to-r, cyan.500, blue.600)"
                    color="white"
                    size="lg"
                    w="full"
                    mt={2}
                    _hover={{ bgGradient: "linear(to-r, cyan.400, blue.500)" }}
                    isLoading={loading}
                    whileTap={{ scale: 0.95 }}
                  >
                    Send Code
                  </MotionButton>
                </VStack>
              </form>
            )}

            {step === 2 && (
              <form
                onSubmit={handleVerifyOtpAndRegister}
                style={{ width: "100%" }}
              >
                <VStack spacing={4}>
                  <FormControl id="otp" isRequired>
                    <FormLabel color="blue.200" textAlign="center">
                      Verification Code
                    </FormLabel>
                    <Input
                      type="text"
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) =>
                        setOtp(
                          e.target.value.replace(/[^0-9]/g, "").slice(0, 6)
                        )
                      }
                      textAlign="center"
                      fontSize="2xl"
                      letterSpacing="0.5em"
                      variant="filled"
                      bg="rgba(0,0,0,0.3)"
                      _focus={{
                        bg: "rgba(0,0,0,0.5)",
                        borderColor: "cyan.400",
                      }}
                      color="cyan.200"
                      h="60px"
                    />
                  </FormControl>

                  <MotionButton
                    type="submit"
                    colorScheme="green"
                    bgGradient="linear(to-r, green.400, teal.500)"
                    size="lg"
                    w="full"
                    mt={4}
                    isLoading={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Verify & Join
                  </MotionButton>

                  <HStack justify="space-between" w="full">
                    <Button
                      variant="link"
                      onClick={() => setStep(1)}
                      color="gray.400"
                      fontSize="sm"
                      _hover={{ color: "white" }}
                    >
                      ← Back
                    </Button>
                    <Button
                      variant="link"
                      onClick={handleSendOtp}
                      color="cyan.400"
                      fontSize="sm"
                      isLoading={loading}
                      _hover={{ color: "cyan.200" }}
                    >
                      Resend Code
                    </Button>
                  </HStack>
                </VStack>
              </form>
            )}

            <Divider borderColor="rgba(255,255,255,0.1)" />

            <Text align="center" color="gray.400" fontSize="sm">
              Already have an account?{" "}
              <Link
                as={RouterLink}
                to="/login"
                color="cyan.300"
                fontWeight="bold"
                _hover={{ color: "cyan.100" }}
              >
                Sign In
              </Link>
            </Text>
          </VStack>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default RegisterPage;
