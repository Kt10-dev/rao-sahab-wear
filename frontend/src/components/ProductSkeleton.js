import { Box, Skeleton, SkeletonText, Stack } from "@chakra-ui/react";

const ProductSkeleton = () => {
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg="gray.800" // राव साहब वाइब्स (Dark Mode)
      borderColor="whiteAlpha.200"
    >
      {/* इमेज की जगह बड़ा बॉक्स */}
      <Skeleton height="250px" borderRadius="md" />

      <Stack mt={4} spacing={3}>
        {/* टाइटल की जगह पतली लाइन */}
        <Skeleton height="20px" width="80%" />

        {/* प्राइस की जगह छोटी लाइन */}
        <Skeleton height="15px" width="40%" />

        {/* रेटिंग और बटन की जगह */}
        <SkeletonText noOfLines={1} spacing="4" skeletonHeight="2" />
        <Skeleton height="35px" borderRadius="md" mt={2} />
      </Stack>
    </Box>
  );
};

export default ProductSkeleton;
