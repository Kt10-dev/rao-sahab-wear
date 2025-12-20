// src/components/Products/SidebarFilters.js

import React, { useState } from "react";
import {
  Box,
  VStack,
  Text,
  Heading,
  Divider,
  Checkbox,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Button,
  Flex,
  Collapse,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";
import { FaSyncAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";

const MotionButton = motion(Button);
const MIN_PRICE = 0;
const MAX_PRICE = 25000;

const SidebarFilters = ({
  filters,
  setFilters,
  clearFilters,
  categories = [], // 🟢 Default empty array to prevent crash
}) => {
  // 🟢 State for Hiding/Showing Filters
  const [isVisible, setIsVisible] = useState(true);

  const onCategoryToggle = (cat) =>
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));

  const onPriceChange = (val) =>
    setFilters((prev) => ({ ...prev, priceRange: val }));

  return (
    <Box w="full">
      {/* 🟢 HEADER: Heading + Eye Icon Side-by-Side */}
      <Flex
        width="100%"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Heading
          size="md"
          bgGradient="linear(to-r, cyan.400, pink.400)"
          bgClip="text"
          textShadow="0 0 8px cyan, 0 0 16px pink"
        >
          Filters
        </Heading>

        <Tooltip label={isVisible ? "Hide Filters" : "Show Filters"}>
          <IconButton
            icon={isVisible ? <FaEyeSlash /> : <FaEye />}
            size="sm"
            variant="solid"
            colorScheme="cyan"
            color="white"
            onClick={() => setIsVisible(!isVisible)}
            aria-label="Toggle Filters"
            isRound
            boxShadow="0 0 15px cyan"
          />
        </Tooltip>
      </Flex>

      <Divider borderColor="cyan.200" mb={4} />

      {/* 🟢 COLLAPSIBLE CONTENT */}
      <Collapse in={isVisible} animateOpacity>
        <VStack align="start" spacing={6}>
          {/* Categories */}
          <Box w="full">
            <Text fontWeight="semibold" mb={3} color="cyan.300">
              Categories
            </Text>
            <VStack align="start">
              {categories.length > 0 ? (
                categories.map((c) => (
                  <Checkbox
                    key={c}
                    isChecked={filters.categories.includes(c)}
                    onChange={() => onCategoryToggle(c)}
                    colorScheme="cyan"
                    size="md"
                    borderColor="cyan.500"
                  >
                    <Text fontSize="sm" color="gray.600">
                      {c}
                    </Text>
                  </Checkbox>
                ))
              ) : (
                <Text fontSize="xs" color="gray.400">
                  No categories found
                </Text>
              )}
            </VStack>
          </Box>

          <Divider borderColor="cyan.200" />

          {/* Price Range */}
          <Box w="full">
            <Text fontWeight="semibold" mb={3} color="cyan.300">
              Price
            </Text>
            <RangeSlider
              aria-label={["min", "max"]}
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={100}
              defaultValue={filters.priceRange}
              value={filters.priceRange}
              onChangeEnd={onPriceChange}
              colorScheme="cyan"
            >
              <RangeSliderTrack bg="gray.200">
                <RangeSliderFilledTrack bg="cyan.400" />
              </RangeSliderTrack>
              <RangeSliderThumb index={0} boxSize={4} borderColor="cyan.500" />
              <RangeSliderThumb index={1} boxSize={4} borderColor="cyan.500" />
            </RangeSlider>
            <Text mt={3} fontSize="sm" color="gray.500" textAlign="center">
              ₹{filters.priceRange[0]} — ₹{filters.priceRange[1]}
            </Text>
          </Box>

          <Divider borderColor="cyan.200" />

          {/* Reset Button */}
          <MotionButton
            w="full"
            colorScheme="cyan"
            variant="outline"
            onClick={clearFilters}
            leftIcon={<FaSyncAlt />}
            whileHover={{ scale: 1.05, boxShadow: "0 0 12px cyan" }}
            whileTap={{ scale: 0.95 }}
            size="sm"
          >
            Reset Filters
          </MotionButton>
        </VStack>
      </Collapse>
    </Box>
  );
};

export default SidebarFilters;
