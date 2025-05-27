import React from "react";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import { Box, Button, Breadcrumbs, Typography, Link } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import WhatshotIcon from "@mui/icons-material/Whatshot";

const IconBreadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);


  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        pb: 1,
        mb: 2,
        borderBottom: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        backgroundColor: "#558b2f",
        padding: 2,
      }}
    >
      <Breadcrumbs aria-label="breadcrumb" sx={{ px: 1, color: "#fff" }}>
        {/* Home breadcrumb */}
        <Link
          component={RouterLink}
          underline="hover"
          to="/"
          sx={{ display: "flex", alignItems: "center", color: "inherit" }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          HOME
        </Link>

        {/* Dynamic breadcrumbs */}
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const label = value
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());

          return isLast ? (
            <Typography
              key={to}
              color="text.primary"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <WhatshotIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {label}
            </Typography>
          ) : (
            <Link
              component={RouterLink}
              underline="hover"
              to={to}
              key={to}
              sx={{ display: "flex", alignItems: "center", color: "inherit" }}
            >
              <WhatshotIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

const Sidebar = () => {
  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar (fixed height, non-scrollable) */}
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
        <Box>
          <RouterLink to="/brandDashboard/brandDashboard" style={navLinkStyle}>Dashboard</RouterLink>
          <RouterLink to="/brandDashboard/brandmanageprofile" style={navLinkStyle}>Manage Profile</RouterLink>
          <RouterLink to="/brandDashboard/brandaddvedios" style={navLinkStyle}>Add Videos</RouterLink>
        </Box>

        <Box sx={{ mt: "auto", textAlign: "center" }}>
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
        </Box>
      </Box>

      {/* Scrollable main content */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 3 }}>
        <IconBreadcrumbs />
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
