import React from 'react';
import Navbar from '../../Navbar/NavBar';
import Footer from '../Footer';
import { Box, Container, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: 'easeOut',
    },
  }),
};

const AboutUs = () => {
  return (
    <Box>
      <Box sx={{ position: 'fixed', top: 0, width: '100%', zIndex: 10 }}>
        <Navbar />
      </Box>

      <Box sx={{ pt: 20, pb: 8 }}>
        <Container >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.2 } },
            }}
          >
            <motion.div variants={fadeInUp}>
              <Typography
                variant="h4"
                fontWeight={700}
                textAlign="center"
                gutterBottom
                sx={{ color: '#ffba00' }}
              >
                About Mr Franchise
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Typography variant="body1" color="text.secondary" paragraph>
                Mr Franchise is a seasoned franchise development consultant with over 25 years of expertise in sales,
                marketing, and business development. With 5 years of specialized experience in the franchise industry,
                Mr Franchise has successfully guided businesses in expanding through franchise models, helping them scale while
                maintaining brand integrity.
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Typography variant="body1" color="text.secondary" paragraph>
                His deep understanding of market trends, customer behavior, and strategic growth enables him to tailor franchise
                solutions that maximize profitability and long-term success. From developing franchise strategies to recruiting
                top franchisees, Mr Franchise is dedicated to empowering businesses to thrive in competitive markets.
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Typography
                variant="h6"
                fontWeight={600}
                gutterBottom
                sx={{ mt: 4, color: '#7ad03a' }}
              >
                Services Offered
              </Typography>

              <List>
                {[
                  'Franchise Business Consulting',
                  'Franchise Marketing',
                  'Franchise Recruitment',
                  'Franchise Operational Consulting',
                ].map((service, index) => (
                  <motion.div key={index} custom={index + 1} variants={fadeInUp}>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary={service} />
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            </motion.div>
          </motion.div>
        </Container>
      </Box>

      <Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default AboutUs;
