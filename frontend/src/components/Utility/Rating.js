// src/components/Utility/Rating.js
import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

const Rating = ({ rating, numReviews, color = "gold" }) => {
  return (
    <Flex align="center">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Box as="span" key={index} color={color} mr="1px">
            {rating >= starValue ? (
              <FaStar />
            ) : rating >= starValue - 0.5 ? (
              <FaStarHalfAlt />
            ) : (
              <FaRegStar />
            )}
          </Box>
        );
      })}
      {numReviews && (
        <Text ml={2} color="gray.500" fontSize="sm">
          ({numReviews} reviews)
        </Text>
      )}
    </Flex>
  );
};
export default Rating;
