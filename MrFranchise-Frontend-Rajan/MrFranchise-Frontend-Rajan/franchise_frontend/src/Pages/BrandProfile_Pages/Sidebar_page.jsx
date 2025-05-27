import React from "react";
import { Link as RouterLink, Outlet } from "react-router-dom";
import { Box, Button } from "@mui/material";
import img from "../../assets/Images/brandLogo.jpg";

const Sidebar = () => {
  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar (Fixed width and non-scrollable) */}
      <Box
        sx={{
          width: 240,
          backgroundColor: "#fff",
          boxShadow: 3,
          p: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100vh",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        {/* Clickable Logo */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <RouterLink to="/" style={{ textDecoration: "none" }}>
            <Box
              sx={{
                maxWidth: 220,
                mx: "auto",
                p: 1,
                textAlign: "center",
                backgroundColor: "#ffffff",
                borderRadius: "5px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "transform 0.4s ease, box-shadow 0.4s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 6px 25px rgba(0,0,0,0.15)",
                },
              }}
            >
              <img
                src={img}
                alt="Brand Logo"
                loading="lazy"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: "12px",
                }}
              />
            </Box>
          </RouterLink>
        </Box>

        {/* Navigation Links */}
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <RouterLink to="/brandDashboard/brandDashboard" style={navLinkStyle}>
            Dashboard
          </RouterLink>
          <RouterLink to="/brandDashboard/brandmanageprofile" style={navLinkStyle}>
            Manage Profile
          </RouterLink>
          <RouterLink to="/brandDashboard/brandaddvedios" style={navLinkStyle}>
            Add Videos
          </RouterLink>
          <RouterLink to="/brandDashboard/brandlistingcontrol" style={navLinkStyle}>
            Brand Listing Controller
          </RouterLink>
          <RouterLink to="/brandDashboard/brandsearchus" style={navLinkStyle}>
            SearchUs
          </RouterLink>
        </Box>

        {/* Optional: Feedback & Complaint buttons */}
        {/* <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button
            component={RouterLink}
            to="/brandDashboard/brandfeedback"
            fullWidth
            variant="contained"
            sx={{
              bgcolor: "#ffab00",
              color: "#fff",
              fontWeight: 600,
              mb: 1,
              borderRadius: 1,
              "&:hover": { bgcolor: "#ffa000" },
            }}
          >
            Feedback
          </Button>
          <Button
            component={RouterLink}
            to="/brandDashboard/brandcomplaint"
            fullWidth
            variant="contained"
            sx={{
              bgcolor: "#ffab00",
              color: "#fff",
              fontWeight: 600,
              borderRadius: 1,
              "&:hover": { bgcolor: "#ffa000" },
            }}
          >
            Complaint
          </Button>
        </Box> */}
      </Box>

      {/* Scrollable Main Content Area */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

const navLinkStyle = {
  display: "block",
  textDecoration: "none",
  color: "#333",
  marginBottom: "10px",
  padding: "10px",
  backgroundColor: "#f9f9f9",
  borderRadius: "4px",
};

export default Sidebar;
