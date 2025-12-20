// src/components/Home/HeroSlider.js

import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  useBreakpointValue,
  Heading,
  Text,
  Button,
  Container,
  Stack,
} from "@chakra-ui/react";
import { BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi";
import Slider from "react-slick";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";

// Slider CSS (Import zaroori hai)
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const API_BASE_URL = "http://localhost:5000";

// Settings for the slider
const settings = {
  dots: true,
  arrows: false,
  fade: true,
  infinite: true,
  autoplay: true,
  speed: 500,
  autoplaySpeed: 5000,
  slidesToShow: 1,
  slidesToScroll: 1,
};

const HeroSlider = () => {
  const [slider, setSlider] = useState(null);
  const [banners, setBanners] = useState([]);

  // Responsive Height
  const height = useBreakpointValue({ base: "400px", md: "600px" });

  // 1. Fetch Banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/banners`);
        setBanners(data);
      } catch (error) {
        console.log("No banners found, using default.");
      }
    };
    fetchBanners();
  }, []);

  // 2. Fallback (Agar Admin ne koi banner nahi dala)
  const defaultBanner = [
    {
      image:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070",
      title: "RAO SAHAB WEAR",
      link: "/products",
    },
  ];

  const cards = banners.length > 0 ? banners : defaultBanner;

  return (
    <Box
      position={"relative"}
      height={height}
      width={"full"}
      overflow={"hidden"}
    >
      {/* CSS Fix for Dots */}
      <style>
        {`.slick-dots li button:before { color: white; font-size: 12px; } .slick-dots li.slick-active button:before { color: cyan; }`}
      </style>

      {/* Left Icon */}
      <IconButton
        aria-label="left-arrow"
        variant="ghost"
        position="absolute"
        left={side}
        top={top}
        transform={"translate(0%, -50%)"}
        zIndex={2}
        onClick={() => slider?.slickPrev()}
        color="white"
        _hover={{ bg: "whiteAlpha.300" }}
      >
        <BiLeftArrowAlt size="40px" />
      </IconButton>

      {/* Right Icon */}
      <IconButton
        aria-label="right-arrow"
        variant="ghost"
        position="absolute"
        right={side}
        top={top}
        transform={"translate(0%, -50%)"}
        zIndex={2}
        onClick={() => slider?.slickNext()}
        color="white"
        _hover={{ bg: "whiteAlpha.300" }}
      >
        <BiRightArrowAlt size="40px" />
      </IconButton>

      {/* Slider */}
      <Slider {...settings} ref={(slider) => setSlider(slider)}>
        {cards.map((card, index) => (
          <Box
            key={index}
            height={height}
            position="relative"
            backgroundPosition="center"
            backgroundRepeat="no-repeat"
            backgroundSize="cover"
            backgroundImage={`url(${card.image})`}
          >
            {/* Overlay Gradient (Text readable banane ke liye) */}
            <Box
              position="absolute"
              top="0"
              left="0"
              w="full"
              h="full"
              bgGradient="linear(to-r, blackAlpha.700, transparent)"
            />

            <Container
              size="container.lg"
              height={height}
              position="relative"
              zIndex={1}
            >
              <Stack
                spacing={6}
                w={"full"}
                maxW={"lg"}
                position="absolute"
                top="50%"
                transform="translate(0, -50%)"
              >
                <Heading
                  fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }}
                  color="white"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  {card.title || "New Collection"}
                </Heading>

                {card.link && (
                  <Button
                    as={RouterLink}
                    to={card.link}
                    bg={"cyan.400"}
                    rounded={"full"}
                    color={"white"}
                    _hover={{ bg: "cyan.500", transform: "scale(1.05)" }}
                    w="fit-content"
                    px={8}
                    size="lg"
                  >
                    Shop Now
                  </Button>
                )}
              </Stack>
            </Container>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

// Positioning Constants
const top = "50%";
const side = "10px";

export default HeroSlider;
