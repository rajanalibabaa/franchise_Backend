import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Button,
  Backdrop,
} from "@mui/material";

const BrandListingController = ({ brandData = {} }) => {
  const navigate = useNavigate();
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [isOtpVerifyOpen, setIsOtpVerifyOpen] = useState(false);
  const [correctOtp] = useState('123456'); // Simulated OTP

  const isValidPhone = (value) => /^[0-9]{10,}$/.test(value);
  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSendOtp = () => {
    if (!isValidPhone(contact) && !isValidEmail(contact)) {
      setError('Please enter a valid phone number or email address.');
      return;
    }
    setError('');
    setOtpSent(true);
    console.log(`OTP sent to ${contact}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp === correctOtp) {
      setError('');
      setIsOtpVerifyOpen(false);
      navigate('/brandlistingform');
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleOtpModal = () => {
    setIsOtpVerifyOpen(true);
    setOtp('');
    setOtpSent(false);
    setError('');
    setContact('');
  };

  return (
    <Box sx={{  }}>
       <Typography variant="h6" fontWeight={600} mb={2} sx={{
                      textAlign: "center", color: "#fafafa",
                      backgroundColor: "#689f38", padding: "10px", borderRadius: "5px"
                  }}>
        Brand Listing
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#f29724",
            ":hover": { backgroundColor: "#fb8c00" },
            fontWeight: 600,
            color: "#fff"
          }}
          onClick={handleOtpModal}
        >
          Edit Profile
        </Button>
      </Box>

      {/* OTP Modal */}
      <Backdrop open={isOtpVerifyOpen} sx={{ zIndex: 10, color: '#000' }}>
        <Box
          sx={{
            width: 350,
            backgroundColor: "#fff",
            borderRadius: 2,
            boxShadow: 4,
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            position: "relative"
          }}
        >
          <TextField
            label="Phone or Email"
            variant="outlined"
            fullWidth
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
          {otpSent && (
            <TextField
              label="Enter OTP"
              variant="outlined"
              fullWidth
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          )}
          {error && (
            <Typography sx={{ color: 'red', fontSize: '14px' }}>
              {error}
            </Typography>
          )}
          <Button
            variant="contained"
            sx={{ backgroundColor: "#007bff", fontWeight: 600 }}
            onClick={otpSent ? handleSubmit : handleSendOtp}
          >
            {otpSent ? 'Verify OTP' : 'Request OTP'}
          </Button>
        </Box>
      </Backdrop>

      {/* Brand Details Section */}
      <Box mt={4}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Brand Details
        </Typography>
        <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          {[
            "companyname", "brandname", "gstin", "categories", "ownername",
            "description", "address", "country", "pincode", "location",
            "mobilenumber", "whatsappnumber", "website", "facebook",
            "instagram", "linkedin", "establishedyear", "franchisesinceyear"
          ].map(key => (
            <Typography key={key}><strong>{key}:</strong> {brandData[key] || "N/A"}</Typography>
          ))}
        </Paper>

        {/* Expansion Plan */}
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Expansion Plan
        </Typography>
        <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          {[
            "expansiontype", "selectedcounteries", "selectedstates", "selectedcities",
            "selectedindianstates", "selsectedindiandistricts"
          ].map(key => (
            <Typography key={key}><strong>{key}:</strong> {brandData[key] || "N/A"}</Typography>
          ))}
        </Paper>

        {/* Franchise Model */}
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Franchise Model
        </Typography>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" align="center" gutterBottom>Investment Details</Typography>
          {[
            "totalinvestment", "franchisefee", "royaltyfee", "equipmentcost",
            "expectedrevenue", "expectedprofit", "spacerequired",
            "paybackperiod", "minimumcashrequired"
          ].map(key => (
            <Typography key={key}><strong>{key}:</strong> {brandData[key] || "N/A"}</Typography>
          ))}

          <Typography variant="h6" align="center" gutterBottom mt={3}>Outlet Distribution</Typography>
          {[
            "companyownedoutlets", "franchiseoutlets", "totaloutlets"
          ].map(key => (
            <Typography key={key}><strong>{key}:</strong> {brandData[key] || "N/A"}</Typography>
          ))}

          <Typography variant="h6" align="center" gutterBottom mt={3}>Expansion Plans</Typography>
          {[
            "targetcities", "targetstates", "expansionfranchisefee",
            "expansionroyalty", "paymentterms"
          ].map(key => (
            <Typography key={key}><strong>{key}:</strong> {brandData[key] || "N/A"}</Typography>
          ))}
        </Paper>
      </Box>
    </Box>
  );
};

export default BrandListingController;
