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
  Skeleton, // 🟢 लोडिंग के लिए
} from "@chakra-ui/react";
import { BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi";
import Slider from "react-slick";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";

// Slider CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// 🟢 ये पक्का करेगा कि रिक्वेस्ट हमेशा लाइव सर्वर पर जाए
const API_BASE_URL = "https://raosahab-api.onrender.com";

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
  const [loading, setLoading] = useState(true); // 🟢 लोडिंग स्टेट

  const height = useBreakpointValue({ base: "400px", md: "600px" });
  const side = useBreakpointValue({ base: "10px", md: "40px" });
  const top = "50%";

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        // 🔍 Debugging के लिए कंसोल में चेक करो कि URL क्या जा रहा है
        console.log("Fetching banners from:", `${API_BASE_URL}/api/banners`);

        const { data } = await axios.get(`${API_BASE_URL}/api/banners`);

        if (data && data.length > 0) {
          setBanners(data);
        }
      } catch (error) {
        console.warn(
          "API Banners failed, using defaults. Error:",
          error.message
        );
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const defaultBanners = [
    {
      image:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070",
      title: "RAO SAHAB WEAR",
      link: "/shop",
    },
    {
      image:
        "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1887",
      title: "PREMIUM COLLECTION",
      link: "/shop",
    },
  ];

  const cards = banners.length > 0 ? banners : defaultBanners;

  // 🟢 अगर डेटा लोड हो रहा है तो स्केलेटन दिखाओ
  if (loading) {
    return <Skeleton height={height} width="full" />;
  }

  return (
    <Box
      position={"relative"}
      height={height}
      width={"full"}
      overflow={"hidden"}
    >
      <style>
        {`
          .slick-dots { bottom: 25px; }
          .slick-dots li button:before { color: white !important; font-size: 12px; }
          .slick-dots li.slick-active button:before { color: #00FFFF !important; }
        `}
      </style>

      {/* Navigation Buttons */}
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
      <Slider {...settings} ref={(s) => setSlider(s)}>
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
            <Box
              position="absolute"
              top="0"
              left="0"
              w="full"
              h="full"
              bgGradient="linear(to-r, blackAlpha.800, transparent)"
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
                  lineHeight={1.2}
                >
                  {card.title}
                </Heading>
                <Button
                  as={RouterLink}
                  to={card.link || "/shop"}
                  bg={"cyan.400"}
                  rounded={"full"}
                  color={"white"}
                  _hover={{ bg: "cyan.500", transform: "scale(1.05)" }}
                  w="fit-content"
                  px={10}
                  size="lg"
                  textTransform="uppercase"
                  fontWeight="bold"
                >
                  Shop Now
                </Button>
              </Stack>
            </Container>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default HeroSlider;
