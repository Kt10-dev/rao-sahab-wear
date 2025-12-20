import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  IconButton,
  Text,
  Input,
  Button,
  Collapse,
  useDisclosure,
  Avatar,
  ScaleFade,
  Link,
} from "@chakra-ui/react";
import { FaRobot, FaPaperPlane, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

const StylistBot = () => {
  const { isOpen, onToggle } = useDisclosure();
  const [messages, setMessages] = useState([
    {
      text: "Ram Ram Rao Sahab! 🙏 Main aapka AI Stylist hoon. Bataiye aaj kya pehenna hai?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    // 1. User Message add karo
    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    const userQuery = input.toLowerCase();
    setInput("");

    // 2. AI Logic (Simulated)
    setTimeout(() => {
      let botResponse = "";

      if (userQuery.includes("party") || userQuery.includes("shadi")) {
        botResponse =
          "Party ke liye humari 'Velvet Collection' aur 'Slim Fit Shirts' best rahengi! ✨ Check karein?";
      } else if (userQuery.includes("gym") || userQuery.includes("workout")) {
        botResponse =
          "Gym ke liye humare 'Oversized Tees' aur 'Dry-fit' collection check karo bhai, tagdi lagegi! 💪";
      } else if (
        userQuery.includes("college") ||
        userQuery.includes("casual")
      ) {
        botResponse =
          "College ke liye Classic Polo ya Graphics Tees ek number choice hai! 😎";
      } else {
        botResponse =
          "Bhai, main samajh nahi paya. Party, Gym ya Casual look me se kya dekhna chahte ho?";
      }

      setMessages([...newMessages, { text: botResponse, sender: "bot" }]);
    }, 1000);
  };

  return (
    <Box position="fixed" bottom="20px" right="20px" zIndex={1000}>
      {/* 🟢 Chat Window */}
      <ScaleFade initialScale={0.9} in={isOpen}>
        <Collapse in={isOpen}>
          <VStack
            w={{ base: "300px", md: "350px" }}
            h="450px"
            bg="gray.800"
            borderRadius="2xl"
            boxShadow="0 10px 40px rgba(0,255,255,0.2)"
            border="1px solid cyan"
            overflow="hidden"
            spacing={0}
            mb={4}
          >
            {/* Header */}
            <HStack w="full" bg="cyan.600" p={4} justify="space-between">
              <HStack>
                <Avatar
                  size="sm"
                  icon={<FaRobot fontSize="1.2rem" />}
                  bg="white"
                  color="cyan.600"
                />
                <Text fontWeight="bold" color="white">
                  Rao Sahab Stylist
                </Text>
              </HStack>
              <IconButton
                size="sm"
                variant="ghost"
                color="white"
                icon={<FaTimes />}
                onClick={onToggle}
              />
            </HStack>

            {/* Messages Area */}
            <VStack
              flex={1}
              w="full"
              p={4}
              overflowY="auto"
              spacing={4}
              css={{ "&::-webkit-scrollbar": { display: "none" } }}
            >
              {messages.map((m, i) => (
                <Box
                  key={i}
                  alignSelf={m.sender === "user" ? "flex-end" : "flex-start"}
                  bg={m.sender === "user" ? "cyan.500" : "gray.700"}
                  p={3}
                  borderRadius="lg"
                  maxW="80%"
                >
                  <Text fontSize="sm" color="white">
                    {m.text}
                  </Text>
                </Box>
              ))}
            </VStack>

            {/* Input Area */}
            <HStack w="full" p={3} bg="gray.900">
              <Input
                placeholder="Type look name (e.g. Party)..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                bg="whiteAlpha.100"
                border="none"
                color="white"
                size="sm"
              />
              <IconButton
                colorScheme="cyan"
                size="sm"
                icon={<FaPaperPlane />}
                onClick={handleSend}
              />
            </HStack>
          </VStack>
        </Collapse>
      </ScaleFade>

      {/* 🟢 Floating Toggle Button */}
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          onClick={onToggle}
          colorScheme="cyan"
          borderRadius="full"
          w="60px"
          h="60px"
          boxShadow="0 0 20px cyan"
          leftIcon={!isOpen ? <FaRobot fontSize="24px" /> : null}
        >
          {isOpen && "Close"}
        </Button>
      </motion.div>
    </Box>
  );
};

export default StylistBot;
