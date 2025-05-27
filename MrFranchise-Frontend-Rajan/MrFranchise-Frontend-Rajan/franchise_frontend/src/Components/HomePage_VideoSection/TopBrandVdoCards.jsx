import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Slide,
} from "@mui/material";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const brandData = [
  {
    name: "Skale",
    category: "Fitness Franchise",
    location: "Mumbai",
    investment: "20–40 Lakhs",
    desc: "A brief description of brand.",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    image: "https://via.placeholder.com/220x200?text=Brand+A",
  },
  {
    name: "Difa",
    category: "Women Accessories Retail Shop",
    location: "Chennai",
    investment: "10–20 Lakhs",
    desc: "A brief description of brand",
    video: "https://www.w3schools.com/html/movie.mp4",
    image: "https://via.placeholder.com/220x200?text=Brand+B",
  },
  {
    name: "Go Buttons",
    category: "Get Stylish, Stay Strong",
    location: "Delhi",
    investment: "10–29 Lakhs",
    desc: "A brief description of brand",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    image: "https://via.placeholder.com/220x200?text=Brand+C",
  },
  {
    name: "Nalan",
    category: "Cofee Shop",
    location: "Bangalore",
    investment: "15–30 Lakhs",
    desc: "A brief description of brand",
    video: "https://www.w3schools.com/html/movie.mp4",
    image: "https://via.placeholder.com/220x200?text=Brand+D",
  },
  {
    name: "Fresh2Day",
    category: "Fresh for You",
    location: "Hyderabad",
    investment: "18–28 Lakhs",
    desc: "A brief description of brand",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    image: "https://via.placeholder.com/220x200?text=Brand+E",
  },
];

function TopBrandVdoCards() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const timeoutRef = useRef(null);
  const mainVideoRef = useRef(null);
  const sideVideoRefs = useRef([]);

  const handleNext = useCallback(() => {
    if (!isHovered && !isVideoPlaying) {
      setCurrentIndex((prev) => (prev + 1) % brandData.length);
    }
  }, [isHovered, isVideoPlaying]);

  const startAutoSlide = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (!isHovered && !isVideoPlaying) {
      timeoutRef.current = setTimeout(() => handleNext(), 5000);
    }
  }, [isHovered, isVideoPlaying, handleNext]);

  useEffect(() => {
    startAutoSlide();
    return () => clearTimeout(timeoutRef.current);
  }, [currentIndex, startAutoSlide]);

  const handleVideoPlay = (videoRef) => {
    setIsVideoPlaying(true);
    clearTimeout(timeoutRef.current);
    // Pause other videos when one plays
    if (videoRef !== mainVideoRef.current) {
      mainVideoRef.current?.pause();
    }
    sideVideoRefs.current.forEach(ref => {
      if (ref && ref !== videoRef) ref.pause();
    });
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
    startAutoSlide();
  };

  const mainBrand = brandData[currentIndex];
  const next1 = brandData[(currentIndex + 1) % brandData.length];
  const next2 = brandData[(currentIndex + 2) % brandData.length];

  return (
    <Box 
      sx={{ px: 4, py: 6, maxWidth: 1200, mx: "auto" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Top Brand
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 3,
        }}
      >
        {/* Main Video */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mainBrand.name}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
          >
            <Card
              sx={{
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: 6,
              }}
            >
              <Box sx={{ height: 270, overflow: "hidden" }}>
                <video
                  ref={mainVideoRef}
                  src={mainBrand.video}
                  controls
                  onPlay={() => handleVideoPlay(mainVideoRef.current)}
                  onPause={handleVideoPause}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "all 5.5s ease",
                  }}
                />
              </Box>
              <CardContent
                sx={{
                  bgcolor: "#ffff",
                  display: "flex",
                  alignItems: "center",
                  px: 2,
                  py: 2,
                }}
              >
                <Box sx={{ flex: 7 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {mainBrand.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {mainBrand.category}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {mainBrand.desc || "A brief description of brand."}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    💰 {mainBrand.investment}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: "1px",
                    height: "100%",
                    backgroundColor: "#ccc",
                    mx: 2,
                  }}
                />
                <Box sx={{ flex: 3 }}>
                  <Button
                    variant="contained"
                    sx={{
                      mt: 8,
                      ml: 6,
                      background: "#f29724",
                      textTransform: "none",
                      "&:hover": { background: "#e2faa7", color: "#000" },
                    }}
                  >
                    Apply
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Right Cards */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[next1, next2].map((brand, i) => (
            <Slide
              direction="up"
              in
              timeout={600 + i * 200}
              key={brand.name}
            >
              <Card
                sx={{
                  display: "flex",
                  height: 200,
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: 4,
                  transform: "scale(1)",
                  transition: "transform 0.3s ease-in-out",
                  '&:hover': { transform: "scale(1.03)" },
                }}
              >
                <Box sx={{ width: 220, height: 200 }}>
                  <video
                    ref={el => sideVideoRefs.current[i] = el}
                    controls
                    src={brand.video}
                    onPlay={() => handleVideoPlay(sideVideoRefs.current[i])}
                    onPause={handleVideoPause}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
                <CardContent
                  sx={{
                    bgcolor: "#ffff",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {brand.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {brand.category}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    💰 {brand.investment}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      mt: 8,
                      ml: 18,
                      background: "#f29724",
                      textTransform: "none",
                      fontSize: "0.8rem",
                      px: 2,
                      "&:hover": { background: "#e2faa7", color: "#000" },
                    }}
                  >
                    Apply
                  </Button>
                </CardContent>
              </Card>
            </Slide>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default TopBrandVdoCards;