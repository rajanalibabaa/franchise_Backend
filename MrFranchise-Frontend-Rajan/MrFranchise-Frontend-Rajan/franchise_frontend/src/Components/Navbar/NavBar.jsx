import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Avatar,
  Box,
  Typography,
  Button,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { User } from "lucide-react";
import SideViewContent from "../SideViewContentMenu/SideHoverMenu";
import LoginPage from "../../Pages/LoginPage/LoginPage";
import { useSelector, useDispatch } from "react-redux";
import {
  loginSuccess,
  toggleSidebar,
  toggleMenu,
} from "../../Redux/Slices/navbarSlice";
import { logout } from "../../Redux/Slices/AuthSlice/authSlice";
import axios from "axios";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { sidebarView, menuOpen } = useSelector((state) => state.navbar);
  const { isLogin } = useSelector((state) => state.auth);

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [popupLogout, setPopupLogout] = useState(false);
  const menuRef = useRef(null);
  const avatarRef = useRef(null);

  const [logoutLoading, setlogoutLoading] = useState(false);

  // Fallback for ID if Redux state is empty (e.g., after refresh)
  const ID =
    localStorage.getItem("brandUUID") ||
    localStorage.getItem("investorUUID");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !avatarRef.current.contains(event.target)
      ) {
        dispatch(toggleMenu(false));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, dispatch]);

  const handleNavigate = (path) => {
    navigate(path);
    dispatch(toggleMenu(false));
  };

  const handleLoginSuccess = (userData) => {
    dispatch(loginSuccess(userData));
    setLoginModalOpen(false);
  };

  const handleSignOut = () => {
    dispatch(toggleMenu(false));
    setPopupLogout(true);
  };

  const handleVerifySignOut = async () => {
    setlogoutLoading(true)
    console.log("ID :", ID)
    try {
      const response = await axios.post(
        `https://franchise-backend-wgp6.onrender.com/api/v1/logout/${ID}`,
        // `http://localhost:5000/api/v1/logout/${ID}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setTimeout(() => {
          dispatch(logout());

          setPopupLogout(false);
          navigate("/");
          setlogoutLoading(false)
        }, 2000);
      } else {
        console.error("Logout failed:", response.data);
      }
    } catch (error) {
      console.error("Logout error:", error.message || error);
    }
  };

  const handleMyProfileNavigate = () => {
    if(localStorage.getItem("investorUUID")){
      navigate("/investordashboard")
    }else if(localStorage.getItem("brandUUID")){
      navigate("/brandDashboard")
    }else{
      navigate("/")
    }
  }

  return (
    <>
      {/* Top Bar */}
      <Box
        sx={{
          background: "#eee",
          p: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          {["Expand Your Franchise", "Investor", "Advertise", "Sell Your Business"].map(
            (text) => (
              <Button key={text} size="small" sx={{ textTransform: "none" }}>
                {text}
              </Button>
            )
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ mr: 1 }}>💬</Typography>
          <FormControl variant="standard" size="small">
            <Select value="en" disableUnderline>
              <MenuItem value="en">EN - English</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Main Navigation Bar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            px: { xs: 1, sm: 2 },
            minHeight: "64px !important",
          }}
        >
          <IconButton edge="start" onClick={() => dispatch(toggleSidebar(true))}>
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              cursor: "pointer",
              "&:hover": { color: "primary.main" },
            }}
            onClick={() => navigate("/")}
          >
            MR FRANCHISE
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Link
              to="/brandsearchview"
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              Find your Franchise
            </Link>

            <Button
              variant="outlined"
              sx={{ textTransform: "none" }}
              onClick={() => handleNavigate("/brandlistingform")}
            >
              ADD LISTING
            </Button>

            <Box ref={avatarRef} sx={{ position: "relative" }}>
              <IconButton onClick={() => dispatch(toggleMenu())} sx={{ p: 0 }}>
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    width: 32,
                    height: 32,
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  <User size={18} />
                </Avatar>
              </IconButton>

              {menuOpen && (
                <Box
                  ref={menuRef}
                  sx={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    bgcolor: "background.paper",
                    boxShadow: 3,
                    borderRadius: 1,
                    minWidth: 160,
                    py: 1,
                    zIndex: 9999,
                  }}
                >
                  {!isLogin ? (
                    <>
                      <Button
                        fullWidth
                        sx={{
                          justifyContent: "flex-start",
                          px: 3,
                          py: 1,
                          color: "text.primary",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                        onClick={() => {
                          setLoginModalOpen(true);
                          dispatch(toggleMenu(false));
                        }}
                      >
                        Sign In
                      </Button>
                      <Button
                        fullWidth
                        sx={{
                          justifyContent: "flex-start",
                          px: 3,
                          py: 1,
                          color: "text.primary",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                        onClick={() => handleNavigate("/registerhandleuser")}
                      >
                        Register
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        fullWidth
                        sx={{
                          justifyContent: "flex-start",
                          px: 3,
                          py: 1,
                          color: "text.primary",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                        onClick={() => handleMyProfileNavigate()}
                      >
                        My Profile
                      </Button>
                      <Button
                        fullWidth
                        sx={{
                          justifyContent: "flex-start",
                          px: 3,
                          py: 1,
                          color: "text.primary",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                        onClick={handleSignOut}
                      >
                        Sign Out
                      </Button>
                    </>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        anchor="left"
        open={sidebarView}
        onClose={() => dispatch(toggleSidebar(false))}
      >
        <SideViewContent
          hoverCategory="open"
          onHoverLeave={() => dispatch(toggleSidebar(false))}
        />
      </Drawer>

      {/* Login Modal */}
      <LoginPage
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Logout Confirmation Modal */}
      {popupLogout && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            bgcolor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              bgcolor: "background.paper",
              boxShadow: 3,
              p: 3,
              borderRadius: 1,
              width: 300,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Are you sure you want to logout?
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
              <Button variant="outlined" onClick={() => setPopupLogout(false)}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" onClick={handleVerifySignOut}>
                {
                  logoutLoading ? (
                    <span>loading.....</span>
                  ): (
                     <span>Logout</span>
                  )
                }
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}

export default Navbar;