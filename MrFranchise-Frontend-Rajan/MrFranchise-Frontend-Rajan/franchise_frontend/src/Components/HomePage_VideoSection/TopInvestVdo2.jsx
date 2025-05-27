import { Typography, Box, Button, Card, CardContent,CardMedia } from '@mui/material'
import { motion } from 'framer-motion'
import React, {useEffect, useRef, useState} from 'react'


const initialBrands = [
  {
    name: "Skale",
    category: "Fitness Unlimited",
    investment: "10-19 Lakhs",
    image: "https://mrfranchise.in/wp-content/uploads/2024/10/skale-logo.png",
  },
  {
    name: "Fresh2Day",
    category: "Saloon & Spa, Health & Beauty",
    investment: "15-25 Lakhs",
    image:
      "https://mrfranchise.in/wp-content/uploads/2024/11/fresh2day-mrfranchisein.png",
  },
  {
    name: "Skale",
    category: "Fitness Unlimited",
    investment: "10-19 Lakhs",
    image: "https://mrfranchise.in/wp-content/uploads/2024/10/skale-logo.png",
  },
];

const cardVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function TopInvestVdo2() {
     const [brands, setBrands] = useState(initialBrands);
      const isPaused = useRef(false);
    
      useEffect(() => {
        const interval = setInterval(() => {
          if (!isPaused.current) {
            setBrands((prev) => {
              const newArr = [prev[1], prev[2], prev[0]];
              return [...newArr];
            });
          }
        }, 5000);
    
        return () => clearInterval(interval);
      }, []);
    
      const handleMouseEnter = () => {
        isPaused.current = true;
      };
    
      const handleMouseLeave = () => {
        isPaused.current = false;
      };
  return (
    <Box sx={{ p: 4, background: "#fff", maxWidth: 1200, mx: "auto" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h5" fontWeight={600}>
              Invest Your Franchise
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Near You!
            </Typography>
          </Box>
    
          <Box
            component={motion.div}
            initial="initial"
            animate="animate"
            sx={{
              display: "flex",
              gap: 3,
              backgroundColor: "#e8f5e9",
              borderRadius: 3,
              p: 2,
              overflowX: "auto",
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Left Static Section */}
            <Box
              sx={{
                minWidth: 200,
                background: "#e0f2f1",
                p: 2,
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography variant="h6" fontWeight={600} mb={1}>
                Invest Near You
              </Typography>
              <Button variant="contained" sx={{ background: "#4caf50" }}>
                Popular in Franchise
              </Button>
            </Box>
    
            {/* Rotating Cards */}
            {brands.map((brand, index) => (
              <motion.div
                variants={cardVariants}
                key={index}
                whileHover={{ scale: 1.03 }}
                style={{ minWidth: 250 }}
              >
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    overflow: "hidden",
                    position: "relative",
                    height: "100%",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={brand.image}
                    alt={brand.name}
                    sx={{ height: 140 }}
                  />
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {brand.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {brand.category}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                      {brand.investment}
                    </Typography>
                  </CardContent>
                  <Box sx={{ px: 2, pb: 2, mt: "auto" }}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: "#ff6d00",
                        "&:hover": { backgroundColor: "#ff8f00" },
                      }}
                      onClick={() => {
                        isPaused.current = true;
                      }}
                    >
                      Apply
                    </Button>
                  </Box>
                </Card>
              </motion.div>
            ))}
          </Box>
        </Box>
  )
}

export default TopInvestVdo2