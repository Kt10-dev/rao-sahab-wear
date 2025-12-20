// src/pages/FAQ.js

import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";

const FAQ = () => {
  const bg = useColorModeValue("gray.900", "gray.800");
  const textColor = "gray.300";
  const headingColor = "cyan.300";

  const faqs = [
    {
      question: "What is the estimated delivery time?",
      answer:
        "We usually dispatch orders within 24 hours. Delivery takes 4-7 working days depending on your location. You can track your order in real-time from your profile.",
    },
    {
      question: "Do you offer Cash on Delivery (COD)?",
      answer:
        "Yes, we offer Cash on Delivery (COD) on most of our products. However, a small convenience fee might be applicable for certain locations.",
    },
    {
      question: "What is your Return & Refund Policy?",
      answer:
        "We have a hassle-free 10-day return policy. If you don't like the fit or quality, you can request a return from the 'My Orders' section. Refunds are processed within 5-7 days after we receive the product.",
    },
    {
      question: "How do I track my order?",
      answer:
        "Once your order is shipped, you will receive an AWB number via email/SMS. You can also go to 'My Profile > Orders' and click on the 'Track Order' button to see live updates.",
    },
    {
      question: "Can I cancel my order?",
      answer:
        "Yes, you can cancel your order before it is shipped. Go to 'My Orders' and select the order you want to cancel. If it's already shipped, you can refuse the delivery.",
    },
    {
      question: "Are the colors shown on the website accurate?",
      answer:
        "We try our best to display accurate colors. However, due to different screen resolutions and lighting conditions during photography, there might be a slight variation.",
    },
  ];

  return (
    <Box minH="100vh" bg={bg} py={10} px={4}>
      <Container maxW="4xl">
        <VStack spacing={8} align="center" mb={10}>
          <Heading
            as="h1"
            size="2xl"
            bgGradient="linear(to-r, cyan.400, purple.400)"
            bgClip="text"
            textAlign="center"
          >
            Frequently Asked Questions
          </Heading>
          <Text fontSize="lg" color={textColor} textAlign="center">
            Have questions? We're here to help.
          </Text>
        </VStack>

        <Accordion allowToggle allowMultiple>
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              border="none"
              mb={4}
              borderRadius="lg"
              bg="whiteAlpha.100"
              overflow="hidden"
            >
              <h2>
                <AccordionButton
                  _expanded={{ bg: "cyan.900", color: "white" }}
                  _hover={{ bg: "whiteAlpha.200" }}
                  p={4}
                >
                  <Box
                    flex="1"
                    textAlign="left"
                    fontWeight="bold"
                    fontSize="lg"
                    color="white"
                  >
                    {faq.question}
                  </Box>
                  <AccordionIcon color="cyan.400" />
                </AccordionButton>
              </h2>
              <AccordionPanel
                pb={4}
                fontSize="md"
                color={textColor}
                bg="blackAlpha.300"
                p={5}
              >
                {faq.answer}
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </Box>
  );
};

export default FAQ;
