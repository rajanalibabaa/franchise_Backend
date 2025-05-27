import React,{ useState} from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion } from "framer-motion";
import Navbar from "../../Navbar/NavBar";
import Footer from "../Footer";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};


const FAQs = () => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box>
      <Box sx={{ position: 'fixed', top: 0, width: '100%', zIndex: 10 }}>
        <Navbar />
      </Box>

      <Box
        sx={{
          // minHeight: "100vh",
          // py: 6,
          pt: 20,
          pb:10,
          background: "linear-gradient(to right, #f5f7fa, #e3f2fd)",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h4"
            align="center"
            fontWeight={700}
            color="#ffba00"
            gutterBottom
          >
            Frequently Asked Questions
          </Typography>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={itemVariants}>
              <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')} sx={accordionStyle}>
                <AccordionSummary expandIcon={<ExpandMoreIcon color="#7ad03a" />}>
                  <Typography color="#7ad03a" fontWeight={600}>What is a Franchise?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">
                    An authorization granted by a company to another individual or
                    group allowing them to carry out specified commercial
                    activities, for example acting as an agent for a company's
                    products.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')} sx={accordionStyle}>
                <AccordionSummary expandIcon={<ExpandMoreIcon color="#7ad03a" />}>
                  <Typography color="#7ad03a" fontWeight={600}>Who is an Investor?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">
                    An individual or an organization willing to put money in
                    another company or brand in order to garner profits.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')} sx={accordionStyle}>
                <AccordionSummary expandIcon={<ExpandMoreIcon color="#7ad03a" />}>
                  <Typography color="#7ad03a" fontWeight={600}>Who is a Franchisor?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">
                    The company that allows an individual (known as the
                    franchisee) to run a location of their business. The
                    franchisor owns the overarching company, trademarks, and
                    products, but gives the right to the franchisee to run the
                    franchise location, in return for an agreed-upon fee.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')} sx={accordionStyle}>
                <AccordionSummary expandIcon={<ExpandMoreIcon color="#7ad03a" />}>
                  <Typography color="#7ad03a" fontWeight={600}>
                    Who is a Trade Partner?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">
                    An agreement drawn up by two parties that have agreed to trade
                    certain products, services or information to each other.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Accordion expanded={expanded === 'panel5'} onChange={handleChange('panel5')} sx={accordionStyle}>
                <AccordionSummary expandIcon={<ExpandMoreIcon color="#7ad03a" />}>
                  <Typography color="#7ad03a" fontWeight={600}>
                    How can you be a Franchisor?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">
                    A franchisor should be ready to distribute franchising rights
                    to another individual or company (an investor).
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Accordion expanded={expanded === 'panel6'} onChange={handleChange('panel6')} sx={accordionStyle}>
                <AccordionSummary expandIcon={<ExpandMoreIcon color="#7ad03a" />}>
                  <Typography color="#7ad03a" fontWeight={600}>
                    How can you be an Investor?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">
                    An investor should be willing to invest money into another
                    company thus taking up franchisee rights.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Accordion expanded={expanded === 'panel7'} onChange={handleChange('panel7')} sx={accordionStyle}>
                <AccordionSummary expandIcon={<ExpandMoreIcon color="#7ad03a"/>}>
                  <Typography color="#7ad03a" fontWeight={600}>
                    What is a domestic property?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">
                    A property which is situated in a residential area.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Accordion expanded={expanded === 'panel8'} onChange={handleChange('panel8')} sx={accordionStyle}>
                <AccordionSummary expandIcon={<ExpandMoreIcon color="#7ad03a" />}>
                  <Typography color="#7ad03a" fontWeight={600}>
                    What is a commercial property?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">
                    A property which is situated inside or within the premises of
                    a commercial area.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </motion.div>
          </motion.div>
        </Container>
      </Box>
      <Box> <Footer /></Box>
    </Box>
  );
};


const accordionStyle = {
  backgroundColor: "white",
  borderRadius: 2,
  mb: 2,
  boxShadow: "0px 4px 12px rgba(0,0,0,0.06)",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0px 6px 20px rgba(0,0,0,0.1)",
  },
};

export default FAQs;
