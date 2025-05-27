import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import illustration from "../../assets/Images/Login_illustration.jpg";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUUIDandTOKEN } from "../../Redux/Slices/AuthSlice/authSlice";
import CloseIcon from "@mui/icons-material/Close";

function LoginPage({ open, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({ username: "", otp: "" });
  const [errors, setErrors] = useState({});
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (resendDisabled && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setResendDisabled(false);
      setTimer(30); // Reset timer
    }
  }, [resendDisabled, timer]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.username) &&
      !/^\d{10}$/.test(formData.username)
    ) {
      newErrors.username = "Invalid email or phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOtpRequest = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    const isEmail = formData.username.includes("@");
    const payload = isEmail
      ? { email: formData.username.trim() }
      : { mobileNumber: "+91" + formData.username.trim() };

    try {
      const response = await axios.post(
        // "https://franchise-backend-wgp6.onrender.com/api/v1/login/generateOTPforLogin",
        "http://localhost:5000/api/v1/login/generateOTPforLogin",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "OTP sent successfully!",
          severity: "success",
        });
        setIsOtpSent(true);
        setResendDisabled(true);
      } else {
        throw new Error(response.data.message || "Failed to send OTP");
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp) {
      setErrors((prev) => ({ ...prev, otp: "OTP is required" }));
      return;
    }

    setIsLoading(true);
    const isEmail = formData.username.includes("@");
    const payload = {
      verifyOtp: formData.otp,
      [isEmail ? "email" : "phone"]: isEmail
        ? formData.username.trim()
        : "+91" + formData.username.trim(),
    };

    try {
      const response = await axios.post(
        // "https://franchise-backend-wgp6.onrender.com/api/v1/login/",
        "http://localhost:5000/api/v1/login/",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        dispatch(
          setUUIDandTOKEN({
            investorUUID: response.data.data.investorUUID,
            brandUUID: response.data.data.brandUserUUID,
            token: response.data.data.AccessToken,
          })
        );

        // console.log("======= :", response.data.data)

        // localStorage.setItem("token", response.data.data.AccessToken);
        setSnackbar({
          open: true,
          message: "Login successful! Redirecting...",
          severity: "success",
        });

        // sessionStorage.setItem("authToken", response.data.data.AccessToken);
        
        setTimeout(() => {
          onClose(); // Close the modal
          setFormData({ username: "", otp: "" });
          setIsOtpSent(false);
          setResendDisabled(false);
          setTimer(30);
          setErrors({});
          setIsLoading(false); // optional safety
          navigate("/"); // Navigate home
        }, 1000);
      } else {
        throw new Error(response.data.message || "Invalid OTP");
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    isOtpSent ? handleVerifyOtp() : handleOtpRequest();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        TransitionProps={{ timeout: 500 }}
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            color: "black",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "#ffba00",
            color: "black",
            px: 3,
            py: 2,
          }}
        >
          {/* Corrected Heading Structure */}
          <Typography variant="h5">Login</Typography>
          <IconButton onClick={onClose} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Grid container sx={{ minHeight: "65vh" }}>
            <Grid
              item
              md={6}
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "white",
                p: 0,
              }}
            >
              <Box
                component="img"
                src={illustration}
                alt="Login Illustration"
                sx={{ width: "100%", maxWidth: 400, borderRadius: 2 }}
              />
            </Grid>

            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 4,
              }}
            >
              <Box sx={{ width: "100%", maxWidth: 400 }}>
                <Typography
                  variant="h4"
                  gutterBottom
                  textAlign="center"
                  fontWeight="bold"
                >
                  Welcome Back!
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  textAlign="center"
                  mb={3}
                >
                  Please log in to your account to continue.
                </Typography>

                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Email or Phone Number"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    error={!!errors.username}
                    helperText={errors.username}
                    disabled={isOtpSent || isLoading}
                    sx={{ mb: 2 }}
                  />

                  {isOtpSent && (
                    <TextField
                      fullWidth
                      label="OTP"
                      id="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      error={!!errors.otp}
                      helperText={errors.otp}
                      disabled={isLoading}
                      sx={{ mb: 2 }}
                    />
                  )}

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{
                      height: 48,
                      mb: 2,
                      bgcolor: "#007BFF",
                      "&:hover": { bgcolor: "#0056b3" },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : isOtpSent ? (
                      "Verify OTP"
                    ) : (
                      "Request OTP"
                    )}
                  </Button>
                </form>

                {isOtpSent && (
                  <Typography variant="body2" textAlign="center" mb={2}>
                    Didn’t receive OTP?{" "}
                    <Link
                      component="button"
                      onClick={handleOtpRequest}
                      disabled={resendDisabled}
                    >
                      {resendDisabled ? `Resend in ${timer}s` : "Resend OTP"}
                    </Link>
                  </Typography>
                )}

                <Typography variant="body2" textAlign="center" mt={2}>
                  Don’t have an account?{" "}
                  <Link
                    component="button"
                    onClick={() => {
                      onClose();
                      navigate("/registerhandleuser");
                    }}
                    sx={{ fontWeight: 500 }}
                  >
                    Register here
                  </Link>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default LoginPage;