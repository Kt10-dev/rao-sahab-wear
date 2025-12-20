// src/components/Splash/SplashScreen.js

import React, { useEffect } from "react";
import { Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";

// 🟢 FIX: Prop name 'onAnimationComplete' use karenge taaki Homepage.js ke saath match kare
const SplashScreen = ({ onAnimationComplete }) => {
  // Option 1: Timer Based (Safety backup)
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 5000); // 5 second baad auto close (agar video lambi hui to)

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  // Option 2: Video End Based (Better UX)
  const handleVideoEnd = () => {
    onAnimationComplete();
  };

  return (
    <Flex
      as={motion.div}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }} // Smooth Fade Out
      justify="center"
      align="center"
      bg="black"
      h="100vh"
      w="100vw"
      position="fixed"
      top="0"
      left="0"
      zIndex={9999}
    >
      <video
        // ⚠️ MAKET SURE: Aapki video 'public/videos/intro.mp4' mein honi chahiye
        src="/videos/intro.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd} // Video khatam hone par hat jayega
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover", // Puri screen cover karega
        }}
      />
    </Flex>
  );
};

export default SplashScreen;
