import React,{useState} from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Dialog
} from "@mui/material";

import businessLogo from "../../assets/images/Business_logo.png";
import FacebookIcon from "../../Assets/Images/FacebookIcon.png";
// import LinkedInIcon from "../../Assets/Images/LinkedinIcon.png";
// import InstagramIcon from "../../Assets/Images/InstagramIcon.png";
// import TwitterIcon from "../../Assets/Images/TwitterIcon.png";
import GoogleIcon from "../../Assets/Images/GoogleIcon.png";
import LoginPage from "../../Pages/LoginPage/LoginPage"

function RegisterHandleUser() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loginOpen, setLoginOpen] = useState(false);

  const openLoginPopup = () => {
    setLoginOpen(true);
  };

  const closeLoginPopup = () => {
    setLoginOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };
  const handleSocialLogin = (provider) => {
    window.location.href = `https://franchise-backend-wgp6.onrender.com/api/v1/auth/${provider}`;
  };

  return (
    <Box
      sx={{
        height: "100vh",
        overflow: "hidden",
        width: "100%",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        bgcolor: "#ffffff",
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
          height: { xs: "30vh", sm: "40vh", md: "92vh" },
        }}
      >
        <Box
          component="img"
          loading="lazy"
          src={businessLogo}
          alt="Business Logo"
          sx={{
            p: 50,
            maxWidth: "100%",
            height: "auto",
            borderRadius: 2,
            maxHeight: "100%",
          }}
        />
      </Grid>

      <Grid
        item
        xs={12}
        md={6}
        sx={{
          p: { xs: 2, sm: 4 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height:"100%",
          width: "100%",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            mt: { xs: 0, md: "-10%" },
            color: "#333333",
            textAlign: "center",
          }}
        >
          Register User
        </Typography>

        <Button
          variant="contained"
          onClick={() => handleNavigation("/investor-register")}
          sx={{
            mb: 2,
            bgcolor: "#7ad03a",
            "&:hover": {
              bgcolor: "#e99830",
            },
            width: "100%",
            maxWidth: 250,
          }}
        >
          Investor Register
        </Button>

        <Button
          variant="contained"
          onClick={() => handleNavigation("/brand-register")}
          sx={{
            mb: 2,
            bgcolor: "#e99830",
            "&:hover": {
              bgcolor: "#7ad03a",
            },
            width: "100%",
            maxWidth: 250,
          }}
        >
          Brand Register
        </Button>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account?{" "}
          <Box
            component="span"
            onClick={openLoginPopup}
            sx={{
              textDecoration: "none",
              cursor: "pointer",
              color: "#007bff",
              "&:hover": {
                color: "#0056b3",
              },
            }}
          >
            Sign In
          </Box>
        </Typography>

        {/* Social Media Section */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
  <Typography variant="h6" sx={{ mb: 1, fontSize: isMobile ? 14 : 16 }}>
    Follow us on:
  </Typography>
  <Grid container spacing={2} justifyContent="center">
    {/* Google Icon */}
    <Grid item>
      <Box
        component="img"
        loading="lazy"
        src={GoogleIcon}
        alt="Google"
        onClick={() => handleSocialLogin("google")}
        sx={{
          width: 32,
          height: 32,
          cursor: "pointer",
          transition: "transform 0.3s ease",
          "&:hover": {
            transform: "scale(1.1)",
          },
        }}
      />
    </Grid>

    {/* Facebook Icon */}
    <Grid item>
      <Box
        component="img"
        loading="lazy"
        src={FacebookIcon}
        alt="Facebook"
        onClick={() => handleSocialLogin("facebook")}
        sx={{
          width: 32,
          height: 32,
          cursor: "pointer",
          transition: "transform 0.3s ease",
          "&:hover": {
            transform: "scale(1.1)",
          },
        }}
      />
    </Grid>
  </Grid>
  {/* Login Popup Dialog */}
      <Dialog open={loginOpen} onClose={closeLoginPopup} maxWidth="sm" fullWidth>
        <LoginPage open={loginOpen} onClose={closeLoginPopup} />
      </Dialog>
</Box>
      </Grid>
    </Box>
  );
}

export default RegisterHandleUser;