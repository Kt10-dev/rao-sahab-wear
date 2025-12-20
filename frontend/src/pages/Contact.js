// src/pages/Contact.js

import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Icon,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane,
} from "react-icons/fa";

const Contact = () => {
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    // यहाँ आप बैकएंड API कॉल लगा सकते हैं (e.g., Formspree या खुद का API)
    toast({
      title: "Message Sent!",
      description:
        "We've received your message and will get back to you shortly.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Box minH="100vh" bg={bg} py={12} px={4}>
      <Container maxW="6xl">
        {/* Header */}
        <VStack spacing={4} textAlign="center" mb={12}>
          <Heading
            as="h1"
            size="2xl"
            bgGradient="linear(to-r, cyan.400, blue.500)"
            bgClip="text"
          >
            Get In Touch
          </Heading>
          <Text fontSize="lg" color={textColor} maxW="2xl">
            Have a question about your order, a product style, or just want to
            say hello? We'd love to hear from you!
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          {/* 1. Contact Information Section */}
          <VStack
            align="start"
            spacing={8}
            bg={cardBg}
            p={8}
            borderRadius="xl"
            boxShadow="lg"
            h="full"
          >
            <Heading size="md" color="cyan.400">
              Contact Information
            </Heading>

            <HStack align="start" spacing={5}>
              <Box p={3} bg="cyan.900" borderRadius="lg" color="cyan.400">
                <Icon as={FaMapMarkerAlt} w={6} h={6} />
              </Box>
              <Box>
                <Text fontWeight="bold" fontSize="lg">
                  Our Headquarters
                </Text>
                <Text color={textColor}>
                  Rao Sahab Wear, Fashion Street, <br />
                  Sada Colony, Guna - 473226, MP, India
                </Text>
              </Box>
            </HStack>

            <HStack align="start" spacing={5}>
              <Box p={3} bg="cyan.900" borderRadius="lg" color="cyan.400">
                <Icon as={FaPhoneAlt} w={6} h={6} />
              </Box>
              <Box>
                <Text fontWeight="bold" fontSize="lg">
                  Phone Number
                </Text>
                <Text color={textColor}>+91 9694200417</Text>
                <Text fontSize="sm" color="gray.500">
                  Mon-Sat, 10am - 4pm
                </Text>
              </Box>
            </HStack>

            <HStack align="start" spacing={5}>
              <Box p={3} bg="cyan.900" borderRadius="lg" color="cyan.400">
                <Icon as={FaEnvelope} w={6} h={6} />
              </Box>
              <Box>
                <Text fontWeight="bold" fontSize="lg">
                  Email Address
                </Text>
                <Text color={textColor}>contact@raosahabwear@gmail.com</Text>
              </Box>
            </HStack>
          </VStack>

          {/* 2. Contact Form Section */}
          <Box bg={cardBg} p={8} borderRadius="xl" boxShadow="lg">
            <form onSubmit={handleSubmit}>
              <VStack spacing={5}>
                <FormControl isRequired>
                  <FormLabel>Your Name</FormLabel>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    bg={useColorModeValue("gray.50", "whiteAlpha.100")}
                    border="none"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email Address</FormLabel>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    bg={useColorModeValue("gray.50", "whiteAlpha.100")}
                    border="none"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Message</FormLabel>
                  <Textarea
                    placeholder="How can we help you?"
                    rows={6}
                    bg={useColorModeValue("gray.50", "whiteAlpha.100")}
                    border="none"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="cyan"
                  size="lg"
                  w="full"
                  rightIcon={<FaPaperPlane />}
                  _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                >
                  Send Message
                </Button>
              </VStack>
            </form>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Contact;
