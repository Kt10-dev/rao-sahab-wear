// src/components/Header/SearchBox.js

import React, { useState } from "react";
import {
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Box,
} from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SearchBox = () => {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    navigate(keyword.trim() ? `/products?keyword=${keyword}` : "/products");
  };

  return (
    <Box
      as="form"
      onSubmit={submitHandler}
      w="100%"
      maxW="420px"
      position="relative"
    >
      {/* Glow Effect */}
      <Box
        position="absolute"
        inset="0"
        rounded="full"
        bg="blue.400"
        filter="blur(18px)"
        opacity="0"
        transition="0.25s"
        pointerEvents="none"
        _groupFocusWithin={{ opacity: 0.4 }}
      />

      <InputGroup
        bg="whiteAlpha.200"
        backdropFilter="blur(12px)"
        border="1px solid"
        borderColor="whiteAlpha.300"
        transition="0.3s"
        _focusWithin={{
          borderColor: "blue.400",
          shadow: "0 0 12px rgba(0,140,255,0.4)",
        }}
        borderRadius="full"
        p="1"
      >
        <Input
          type="text"
          placeholder="Search products, brands…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          color="white"
          _placeholder={{ color: "whiteAlpha.600" }}
          border="none"
          focusBorderColor="transparent"
          pl="5"
          pr="14"
          fontSize="sm"
        />

        <InputRightElement width="3.3rem">
          <IconButton
            type="submit"
            size="sm"
            aria-label="Search"
            icon={<FaSearch />}
            color="white"
            bg="blue.500"
            _hover={{ bg: "blue.600", transform: "scale(1.07)" }}
            _active={{ transform: "scale(0.92)" }}
            transition="0.2s"
            rounded="full"
          />
        </InputRightElement>
      </InputGroup>
    </Box>
  );
};

export default SearchBox;
