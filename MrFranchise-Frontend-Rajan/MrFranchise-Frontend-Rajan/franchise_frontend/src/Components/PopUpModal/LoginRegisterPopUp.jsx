import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import illustration from "../../assets/Images/PopUpLogin.jpg";
import franchiselogo from "../../assets/Images/MrFranchise.jpg";

const LoginRegisterPopUp = () => {
  const [open, setOpen] = useState(false);
  const [interactionDetected, setInteractionDetected] = useState(false);
  const [manuallyClosed, setManuallyClosed] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); 
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!interactionDetected && !manuallyClosed) {
        setOpen(true);
      }
    }, 420000);

    return () => clearTimeout(timer);
  }, [interactionDetected, manuallyClosed]);

  const handleClose = () => {
    setOpen(false);
    setManuallyClosed(true);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <Box
        display="flex"
        flexDirection={isSmallScreen ? "column" : "row"} 
        width="100%"
        position="relative"
      >
        <Box
          flex={1}
          sx={{
            backgroundColor: "#f5f5f5",
            p: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={illustration}
            alt="Illustration"
            loading="lazy"
            style={{
              width: "100%",
              height: isSmallScreen ? "200px" : "100%",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        </Box>

        <Box flex={1} p={3}>
          <DialogTitle sx={{ textAlign: "center", position: "relative" }}>
            <img
              src={franchiselogo}
              alt="MRFranchise Logo"
              loading="lazy"
              style={{
                width: isSmallScreen ? "60%" : "80%",
                height: "auto",
                objectFit: "cover",
                borderRadius: "8px",
                margin: "0 auto",
              }}
            />
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: "absolute",
                right: 16,
                top: 16,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent>
            <Typography
              variant={isSmallScreen ? "h5" : "h4"}
              gutterBottom
              sx={{
                fontWeight: "bold",
                textAlign: "center",
                color: "#ffba00",
              }}
            >
              Welcome to Our Franchise Website!
            </Typography>

            <Typography
              variant={isSmallScreen ? "body1" : "h6"}
              gutterBottom
              sx={{
                textAlign: "center",
                color: "#7ad03a",
                marginTop: "10px",
              }}
            >
              World's highest visited franchise website network.
            </Typography>
            <Typography
              variant="body2"
              mt={2}
              sx={{ textAlign: "center", fontSize: isSmallScreen ? "0.9rem" : "1rem" }}
            >
              Would you like to login or register?
            </Typography>
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              justifyContent: "center",
              gap: "15px",
              flexDirection: isSmallScreen ? "column" : "row", 
            }}
          >
            <Button
              href="/loginpage"
              variant="outlined"
              color="primary"
              fullWidth={isSmallScreen} 
            >
              Login
            </Button>
            <Button
              href="/registerhandleuser"
              variant="outlined"
              color="primary"
              fullWidth={isSmallScreen} 
            >
              Register
            </Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default LoginRegisterPopUp;