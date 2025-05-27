import React from "react";
import { Link as RouterLink, Outlet } from "react-router-dom";
import { Box, Button } from "@mui/material";
import img from "../../assets/Images/brandLogo.jpg";
import { useNavigate } from "react-router-dom";
import { useEffect,useState } from "react";

const ProfilePage = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

    useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      {isMobile ? (
        
        <Box
          sx={{
            display: 'flex',
            position: 'absolute',
            top:100
          }}
        >
         <button> menu</button>
        </Box>
      ):(
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
          <Box sx={{ textAlign: "center", mb: 2, borderRadius: 2 }}>
            <RouterLink to="/" style={{ textDecoration: "none" }}>
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 250,
                  mx: "1px",
                  my: 3,
                  ml: -1,
                  mt: 1,
                  p: 1,
                  textAlign: "center",
                  backgroundColor: "#ffffff",
                  borderRadius: "5px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  border: "2px solid transparent",
                  // backgroundImage:
                  //   "linear-gradient(white, white), linear-gradient(90deg, #f29724, #e2faa7)",
                  backgroundOrigin: "border-box",
                  backgroundClip: "content-box, border-box",
                  transition: "transform 0.4s ease, box-shadow 0.4s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 6px 25px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <img
                  src={img}
                  alt="Profile"
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

          <RouterLink to="/investordashboard" style={navLinkStyle}>Dashboard</RouterLink>
          <RouterLink to="/investordashboard/manageProfile" style={navLinkStyle}>Manage Profile</RouterLink>
          <RouterLink to="/investordashboard/respondemanager" style={navLinkStyle}>Searches</RouterLink>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          sx={{ width: "100%", mb: 2, backgroundColor: "#f29724" }}
          onClick={() => navigate('/investordashboard/upgradeaccount')}
        >
          Upgrade Account
        </Button>
      </Box>
      )}
      

     
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

export default ProfilePage;
