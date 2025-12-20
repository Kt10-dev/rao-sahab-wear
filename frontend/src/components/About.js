// src/pages/About.js

import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Image,
  useColorModeValue,
  Stack,
  Icon,
  Button,
} from "@chakra-ui/react";
import { Flex } from "@chakra-ui/react";
import {
  FaCheckCircle,
  FaShippingFast,
  FaHeadset,
  FaUndo,
} from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";

const Feature = ({ title, text, icon }) => {
  return (
    <Stack align={"center"} textAlign={"center"}>
      <Box p={3} color={"cyan.400"} mb={2}>
        <Icon as={icon} w={10} h={10} />
      </Box>
      <Text fontWeight={600} color="white" fontSize="lg">
        {title}
      </Text>
      <Text color={"gray.400"}>{text}</Text>
    </Stack>
  );
};

const About = () => {
  const bg = useColorModeValue("gray.900", "gray.900");

  return (
    <Box bg={bg} minH="100vh" py={12}>
      <Container maxW={"7xl"}>
        {/* 1. Hero Section */}
        <Stack
          align={"center"}
          spacing={{ base: 8, md: 10 }}
          py={{ base: 10, md: 20 }}
          direction={{ base: "column", md: "row" }}
        >
          <Stack flex={1} spacing={{ base: 5, md: 10 }}>
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: "3xl", sm: "4xl", lg: "6xl" }}
            >
              <Text
                as={"span"}
                position={"relative"}
                _after={{
                  content: "''",
                  width: "full",
                  height: "30%",
                  position: "absolute",
                  bottom: 1,
                  left: 0,
                  bg: "cyan.400",
                  zIndex: -1,
                }}
                color="white"
              >
                About Rao Sahab Wear
              </Text>
              <br />
              <Text
                as={"span"}
                color={"cyan.400"}
                fontSize={{ base: "2xl", sm: "3xl", lg: "4xl" }}
              >
                Tradition Meets Modernity
              </Text>
            </Heading>
            <Text color={"gray.400"} fontSize={"lg"}>
              Welcome to <strong>Rao Sahab Wear</strong>, your number one source
              for premium ethnic and casual wear. We're dedicated to giving you
              the very best of Indian fashion, with a focus on dependability,
              customer service, and uniqueness.
            </Text>
            <Text color={"gray.400"} fontSize={"lg"}>
              Founded in 2024, Rao Sahab Wear has come a long way from its
              beginnings. When we first started out, our passion for "Classy &
              Royal Fashion" drove us to do tons of research so that Rao Sahab
              Wear can offer you the world's most advanced and stylish ethnic
              wear. We now serve customers all over India and are thrilled that
              we're able to turn our passion into our own website.
            </Text>
          </Stack>
          <Flex
            flex={1}
            justify={"center"}
            align={"center"}
            position={"relative"}
            w={"full"}
          >
            {/* Placeholder Image - Replace with your Brand Image/Logo */}
            <Image
              alt={"Hero Image"}
              fit={"cover"}
              align={"center"}
              w={"100%"}
              h={"100%"}
              src={
                "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=1936&auto=format&fit=crop"
              }
              borderRadius="xl"
              boxShadow="0 0 20px cyan"
            />
          </Flex>
        </Stack>

        {/* 2. Our Values (Razorpay Trust Factors) */}
        <Box
          p={8}
          borderRadius="xl"
          bg="whiteAlpha.100"
          border="1px dashed"
          borderColor="cyan.700"
          mb={16}
        >
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={10}>
            <Feature
              icon={FaCheckCircle}
              title={"Authentic Quality"}
              text={"We guarantee 100% original and premium quality fabrics."}
            />
            <Feature
              icon={FaShippingFast}
              title={"Fast Delivery"}
              text={
                "We ship across India with trusted courier partners (Shiprocket)."
              }
            />
            <Feature
              icon={FaUndo}
              title={"Easy Returns"}
              text={"10-day hassle-free return policy for your peace of mind."}
            />
            <Feature
              icon={FaHeadset}
              title={"24/7 Support"}
              text={"We are here to help you with any queries or issues."}
            />
          </SimpleGrid>
        </Box>

        {/* 3. Business Details (Crucial for Razorpay) */}
        <VStack spacing={4} textAlign="center" maxW="3xl" mx="auto" mb={10}>
          <Heading size="lg" color="white">
            Our Registered Business
          </Heading>
          <Text color="gray.400">
            Rao Sahab Wear is a registered entity committed to providing
            transparent services.
          </Text>

          <Box p={6} bg="gray.800" borderRadius="lg" w="full" textAlign="left">
            <Text color="white">
              <strong>Business Name:</strong> Rao Sahab Wear Pvt. Ltd. (Example)
            </Text>
            <Text color="white">
              <strong>Headquarters:</strong> 123, Fashion Street, New Delhi,
              India - 110001
            </Text>
            <Text color="white">
              <strong>Contact Email:</strong> support@raosahabwear.com
            </Text>
            <Text color="white">
              <strong>Contact Phone:</strong> +91 98765 43210
            </Text>
            <Text color="white">
              <strong>Operating Hours:</strong> Mon - Sat, 10:00 AM - 7:00 PM
            </Text>
          </Box>
        </VStack>

        {/* 4. CTA */}
        <Stack direction={"row"} justify={"center"}>
          <Button
            as={RouterLink}
            to="/products"
            bg={"cyan.500"}
            color={"white"}
            _hover={{ bg: "cyan.600", boxShadow: "0 0 15px cyan" }}
            size="lg"
            px={10}
          >
            Shop Now
          </Button>
          <Button
            as={RouterLink}
            to="/contact"
            variant={"outline"}
            colorScheme="cyan"
            size="lg"
          >
            Contact Us
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

// Ensure Flex is imported

export default About;
