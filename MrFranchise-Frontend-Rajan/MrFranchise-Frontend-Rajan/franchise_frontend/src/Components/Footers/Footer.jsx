import React from "react";
import { Box, Container, Grid, Typography, Link } from "@mui/material";
import brandlogo from "../../assets/Images/brandLogo.jpg";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#000",
        color: "#fff",
        py: { xs: 4, sm: 5, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent={"space-between"}>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
              <Box
                component="img"
                src={brandlogo}
                alt="MR FRANCHISE Logo"
                sx={{
                  display: "inline-block",
                  width: "auto",
                  height: { xs: 50, sm: 60, md: 70 },
                  px: 2,
                  py: 1,
                  mb: 1,
                  marginLeft: { xs: 0, md: 4 },
                  objectFit: "contain",
                  mx: { xs: "auto", md: 0 },
                }}
              ></Box>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#ffba00",
                  fontWeight: "bold",
                  mt: 1,
                  fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                }}
              >
                BUSINESS INVESTORS: BEST CHOICE
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  maxWidth: 280,
                  mx: { xs: "auto", md: 0 },
                  fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                  lineHeight: 1.4,
                }}
              >
                Empowering franchise growth across India by connecting brands
                with serious investors.
              </Typography>
            </Box>
          </Grid>

          {/* Center Section: Quick Links */}
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            sx={{ textAlign: { xs: "center", sm: "center", md: "left" } }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#ffba00",
                fontWeight: "bold",
                mb: 2,
                fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.3rem" },
              }}
            >
              QUICK LINKS
            </Typography>
            <Box sx={{marginLeft:1}}>
              <Link
                href="/addlisting"
                color="inherit"
                underline="hover"
                display="block"
                sx={{
                  mb: 0.5,
                  fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
                }}
              >
                Add Listing
              </Link>
              <Link
                href="/expandyourbrand"
                color="inherit"
                underline="hover"
                display="block"
                sx={{
                  mb: 0.5,
                  fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
                }}
              >
                Expand Your Brand
              </Link>
              <Link
                href="/investfranchise"
                color="inherit"
                underline="hover"
                display="block"
                sx={{
                  mb: 0.5,
                  fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
                }}
              >
                Invest in a Franchise
              </Link>
              <Link
                href="/advertisewithus"
                color="inherit"
                underline="hover"
                display="block"
                sx={{
                  mb: 0.5,
                  fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
                }}
              >
                Advertise With Us
              </Link>
              <Link
                href="/allbusinesscategory"
                color="inherit"
                underline="hover"
                display="block"
                sx={{
                  mb: 0.5,
                  fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
                }}
              >
                All Business Categories
              </Link>
              <Link
                href="/franchiseconsulting"
                color="inherit"
                underline="hover"
                display="block"
                sx={{
                  mb: 0.5,
                  fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
                }}
              >
                Franchise Consulting
              </Link>
            </Box>
          </Grid>

          {/* Right Section: Help & Support */}
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            sx={{ textAlign: { xs: "center", sm: "center", md: "left" } }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#ffba00",
                fontWeight: "bold",
                mb: 2,
                fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.3rem" },
              }}
            >
              HELP & SUPPORT
            </Typography>
            <Box sx={{marginLeft:2}}>
              <Link
                href="/aboutus"
                color="inherit"
                underline="hover"
                display="block"
                sx={{
                  mb: 0.5,
                  fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
                }}
              >
                About Us
              </Link>
              <Link
                href="/contactus"
                color="inherit"
                underline="hover"
                display="block"
                sx={{
                  mb: 0.5,
                  fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
                }}
              >
                Contact
              </Link>
              <Link
                href="/faq"
                color="inherit"
                underline="hover"
                display="block"
                sx={{
                  mb: 0.5,
                  fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
                }}
              >
                FAQs
              </Link>
              <Link
                href="/help"
                color="inherit"
                underline="hover"
                display="block"
                sx={{
                  mb: 0.5,
                  fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
                }}
              >
                Help
              </Link>
              <Link
                href="/termsandconditions"
                color="inherit"
                underline="hover"
                display="block"
                sx={{
                  mb: 0.5,
                  fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
                }}
              >
                Terms & Conditions
              </Link>
              <Link
                href="/privacypolicy"
                color="inherit"
                underline="hover"
                display="block"
                sx={{
                  mb: 0.5,
                  fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
                }}
              >
                Privacy Policy
              </Link>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Text */}
        <Box textAlign="center" mt={6}>
          <Typography
            variant="body2"
            sx={{ color: "#aaa", fontSize: { xs: "0.75rem", sm: "0.85rem", md: "0.9rem" } }}
          >
            © 2025 MrFranchise.in. All Rights Reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
