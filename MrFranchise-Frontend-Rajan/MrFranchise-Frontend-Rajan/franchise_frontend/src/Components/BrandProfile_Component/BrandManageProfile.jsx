import React, { useState } from 'react';
import {
  Box,
  Select,
  MenuItem,
  Typography,
  Paper,
  FormControl,
  InputLabel,
} from '@mui/material';

const ProfileSection = () => {
  const [selectedSection, setSelectedSection] = useState('');

  const handleChange = (event) => {
    setSelectedSection(event.target.value);
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'personalDetails':
        return (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>Personal Details</Typography>
            <Typography>FullName: </Typography>
            <Typography>email: </Typography>
            <Typography>mobileNumber: </Typography>
            <Typography>whatsappNumber: </Typography>
            <Typography>brandName: </Typography>
            <Typography>companyName: </Typography>
            <Typography>country: </Typography>
            <Typography>pincode: </Typography>
            <Typography>Headofficeaddress: </Typography>
            <Typography>state: </Typography>
            <Typography>city: </Typography>
            <Typography>establishedyear: </Typography>
            <Typography>expansionLocation: </Typography>
            <Typography>website: </Typography>
            <Typography>facebook: </Typography>
            <Typography>instagram: </Typography>
            <Typography>linkedin: </Typography>
          </Paper>
        );
      case 'franchiseDetails':
        return (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>Franchise Details</Typography>
             <Typography>investmentRange:</Typography>
            <Typography>areaRequired:</Typography>
            <Typography>franchiseModel:</Typography>
            <Typography>franchiseType:</Typography>
            <Typography>franchiseFee:</Typography>
            <Typography>royaltyFee:</Typography>
            <Typography>interiorcost:</Typography>
            <Typography>exteriorCost:</Typography>
            <Typography>otherCost:</Typography>
            <Typography>Roi:</Typography>
            <Typography>breakEven:</Typography>
            <Typography>requireInvestmentCapital:</Typography>
            <Typography>companyOwnedOutlets:</Typography>
            <Typography>franchiseOutlets:</Typography>
            <Typography>totalOutlets:</Typography>
            <Typography>requirementSuport:</Typography>
            <Typography>traningProvidedBy:</Typography>
            <Typography>aggrementPeriods:</Typography>
            <Typography>propertyType:</Typography>
            
          </Paper>
        );
      case 'brandDetails':
        return (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>Brand Details</Typography>
            <Typography>pancard:</Typography>
            <Typography>areaRequired:</Typography>
            <Typography>gstCertificate:</Typography>
            <Typography>brandLogo:</Typography>
            <Typography>companyImage:</Typography>
            <Typography>exterioroutlet:</Typography>
            <Typography>interiorOutlet:</Typography>
            <Typography>franchisePromotionVideo:</Typography>
            <Typography>brandPromotionVideo:</Typography>
           
          </Paper>
        );
      default:
        return (
          <Typography color="textSecondary">
            Please select a section from the dropdown
          </Typography>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Left Dropdown Menu */}
      <Box sx={{ width: 250, p: 3, borderRight: '1px solid #ccc' }}>
        <Typography variant="h6" gutterBottom>Choose Section</Typography>
        <FormControl fullWidth>
          <InputLabel id="section-label">Section</InputLabel>
          <Select
            labelId="section-label"
            value={selectedSection}
            onChange={handleChange}
            label="Section"
          >
            <MenuItem value="personalDetails">Personal Details</MenuItem>
            <MenuItem value="franchiseDetails">Franchise Details</MenuItem>
            <MenuItem value="brandDetails">Brand Details</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Right Dynamic Content */}
      <Box sx={{ flexGrow: 1, p: 4 }}>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default ProfileSection;
