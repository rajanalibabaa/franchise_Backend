import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  IconButton,
  Avatar,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Favorite, FavoriteBorder } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

const brandData = [
  {
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    image: "https://mrfranchise.in/wp-content/uploads/2024/11/fresh2day-mrfranchisein.png",
    name: "Fresh2Day",
    // logo: "https://via.placeholder.com/32x32?text=H",
    category: "Saloon & Spa, Health & Beauty",
    investment: "50 L – 75 L",
    area: "3,000 - 5,000 Sq. Ft",
    desc: "Fresh2Day is Chennai's best food and grocery store.   and Vegetables, Rice and Dals, Spices and Seasonings to Packaged products, Bakery Products, Beverages, – we have it all",
  },
  {
    video: "https://www.w3schools.com/html/movie.mp4",
    image: "https://mrfranchise.in/wp-content/uploads/2024/10/skale-logo.png",
    name: "Skale",
    // logo: "https://via.placeholder.com/32x32?text=F",
    category: "Skale Fitness",
    investment: "₹1 Cr. – 2 Cr.",
    area: "2,000 - 3,000 Sq. Ft",
    desc: "Premium fitness brand with modern training equipment for Indian fitness. If we look around, we will find that weight loss advertisements are rampant everywhere.",
  },
];

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
  exit: (direction) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    scale: 0.95,
  }),
};

function TopBrandVdoSec() {
  const [[index, direction], setIndex] = useState([0, 0]);
  const [liked, setLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const timeoutRef = useRef(null);
  const videoRef = useRef(null);

  // const handleNext = () => {
  //   if (!isHovered && !isVideoPlaying) {
  //     setIndex(([i]) => [(i + 1) % brandData.length, 1]);
  //     setLiked(false);
  //   }
  // };

    const handleNext = useCallback(() => {
  if (!isHovered && !isVideoPlaying) {
    setIndex(([i]) => [(i + 1) % brandData.length, 1]);
    setLiked(false);
  }
}, [isHovered, isVideoPlaying]);

  const handlePrev = () => {
    setIndex(([i]) => [(i - 1 + brandData.length) % brandData.length, -1]);
    setLiked(false);
  };

  // const startAutoSlide = () => {
  //   clearTimeout(timeoutRef.current);
  //   if (!isHovered && !isVideoPlaying) {
  //     timeoutRef.current = setTimeout(() => handleNext(), 5000);
  //   }
  // };

  // useEffect(() => {
  //   startAutoSlide();
  //   return () => clearTimeout(timeoutRef.current);
  // }, [index, isHovered, isVideoPlaying]);



const startAutoSlide = useCallback(() => {
  clearTimeout(timeoutRef.current);
  if (!isHovered && !isVideoPlaying) {
    timeoutRef.current = setTimeout(() => handleNext(), 5000);
  }
}, [isHovered, isVideoPlaying, handleNext]);

useEffect(() => {
  startAutoSlide();
  return () => clearTimeout(timeoutRef.current);
}, [index, startAutoSlide]);

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
    clearTimeout(timeoutRef.current);
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
    startAutoSlide();
  };

  const brand = brandData[index];

  return (
    <Box 
      sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
        mb={2}
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Top Brand
      </Typography>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {/* Left Video Section */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            position: "relative",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 3,
            height: 330,
          }}
        >
          <motion.video
            ref={videoRef}
            key={brand.video}
            src={brand.video}
            controls
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            initial={{ opacity: 0.5, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 8,
            }}
          />

          {/* Arrows */}
          <IconButton
            sx={{
              position: "absolute",
              top: "50%",
              left: 8,
              transform: "translateY(-50%)",
              bgcolor: "white",
              zIndex: 10,
              boxShadow: 1,
            }}
            onClick={handlePrev}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            sx={{
              position: "absolute",
              top: "50%",
              right: 8,
              transform: "translateY(-50%)",
              bgcolor: "white",
              zIndex: 10,
              boxShadow: 1,
            }}
            onClick={handleNext}
          >
            <ChevronRight />
          </IconButton>
        </Box>

        {/* Right Card Section */}
        <AnimatePresence mode="wait" custom={direction}>
          <Card
            key={brand.name}
            component={motion.div}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            variants={variants}
            sx={{
              flex: 1,
              minWidth: 360,
              height: 330,
              display: "flex",
              borderRadius: 3,
              boxShadow: 4,
              overflow: "hidden",

              ":hover": {
                boxShadow: 9,               
            }}}
          >
            <Box
              component="img"
              src={brand.image}
              alt={brand.name}
              sx={{
                width: "45%",
                height: "100%",
                objectFit: "fill",
              }}
            />

            <Box
              sx={{
                p: 2,
                width: "55%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar src={brand.logo} sx={{ width: 28, height: 28 }} />
                    <Typography variant="h6" fontWeight="bold">
                      {brand.name}
                    </Typography>
                  </Box>

                  <IconButton
                    onClick={() => setLiked(!liked)}
                    size="small"
                    sx={{ p: 0.5 }}
                  >
                    {liked ? (
                      <Favorite sx={{ color: "red", fontSize: 25 }} />
                    ) : (
                      <FavoriteBorder sx={{ color: "gray", fontSize: 25 }} />
                    )}
                  </IconButton>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={1}>
                  {brand.category}
                </Typography>

                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  💰 {brand.investment}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  📐 {brand.area}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {brand.desc}
                </Typography>
              </Box>

              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#f29724",
                  textTransform: "none",
                  width: "fit-content",
                  px: 3,
                  borderRadius: 1,
                  // fontWeight: "bold",
                  mt: 1,
                  "&:hover": {
                    backgroundColor: "#e2faa7",
                    color: "#000",
                  },
                }}
              >
                Apply
              </Button>
            </Box>
          </Card>
        </AnimatePresence>
      </Box>
    </Box>
  );
}

export default TopBrandVdoSec;