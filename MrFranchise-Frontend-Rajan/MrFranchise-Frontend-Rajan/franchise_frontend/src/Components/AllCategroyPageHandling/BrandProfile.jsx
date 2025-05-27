import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Tab, 
  Tabs, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  useTheme
} from '@mui/material';
import { Description as DescriptionIcon, Business, AccountTree, AttachMoney, Assessment, Support } from '@mui/icons-material';

const BrandProfile = ({ brand }) => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Helper functions
  const formatCurrency = (value) => 
    value || value === 0 ? new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value) : "Not specified";

  const formatPercentage = (value) => 
    value || value === 0 ? `${value}%` : "Not specified";

  const formatList = (items) => 
    items?.join(", ") || "Not specified";

  const formatOutlets = () => {
    const { companyOwnedOutlets, franchiseOutlets, totalOutlets } = brand.personalDetails || {};
    if (!companyOwnedOutlets && !franchiseOutlets) return "Not specified";
    return `${companyOwnedOutlets || 0} company-owned, ${franchiseOutlets || 0} franchised (${totalOutlets || 0} total)`;
  };

  // Data for tables
  const companyDetails = [
    { label: "Company Name", value: brand.personalDetails?.companyName },
    { label: "Established Year", value: brand.personalDetails?.establishedYear },
    { label: "Categories", value: formatList(brand.personalDetails?.brandCategories) },
    { label: "Outlets", value: formatOutlets() },
    { label: "Expansion Locations", value: formatList(brand.franchiseDetails?.expansionLocation) }
  ];

  const franchiseDetails = [
    { label: "Franchise Model", value: brand.franchiseDetails?.franchiseModel },
    { label: "Franchise Type", value: brand.franchiseDetails?.franchiseType },
    { label: "Franchise Since", value: brand.franchiseDetails?.franchiseSinceYear },
    { label: "Area Required", value: brand.franchiseDetails?.areaRequired ? `${brand.franchiseDetails.areaRequired} sq.ft` : null },
    { label: "Property Type", value: brand.franchiseDetails?.propertyType },
    { label: "Agreement Period", value: brand.franchiseDetails?.aggrementPeriods ? `${brand.franchiseDetails.aggrementPeriods} years` : null }
  ];

  const investmentDetails = [
    { label: "Franchise Fee", value: formatCurrency(brand.franchiseDetails?.franchiseFee) },
    { label: "Royalty Fee", value: formatPercentage(brand.franchiseDetails?.royaltyFee) },
    { label: "Interior Cost", value: formatCurrency(brand.franchiseDetails?.interiorCost) },
    { label: "Exterior Cost", value: formatCurrency(brand.franchiseDetails?.exteriorCost) },
    { label: "Other Costs", value: formatCurrency(brand.franchiseDetails?.otherCost) },
    { label: "Total Investment", value: formatCurrency(brand.franchiseDetails?.totalInvestment) },
    { label: "ROI Period", value: brand.franchiseDetails?.Roi ? `${brand.franchiseDetails.Roi} years` : null },
    { label: "Break-even Period", value: brand.franchiseDetails?.breakEven ? `${brand.franchiseDetails.breakEven} months` : null }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Logo and Videos Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img 
              src={brand.logo} 
              alt={`${brand.name} logo`} 
              style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }} 
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Brand Video
                </Typography>
                {/* Replace with your video component */}
                <div style={{ 
                  backgroundColor: theme.palette.grey[200], 
                  height: 200, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Typography>Brand Video Placeholder</Typography>
                </div>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Promotion Video
                </Typography>
                {/* Replace with your video component */}
                <div style={{ 
                  backgroundColor: theme.palette.grey[200], 
                  height: 200, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Typography>Promotion Video Placeholder</Typography>
                </div>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Gallery Images - Horizontal Scroll */}
      <Box sx={{ mb: 4, overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <Box sx={{ display: 'inline-flex', gap: 2 }}>
          {[1, 2, 3, 4, 5].map((item) => (
            <Paper key={item} sx={{ 
              display: 'inline-block', 
              width: 250, 
              height: 200,
              p: 1 
            }}>
              <div style={{ 
                backgroundColor: theme.palette.grey[200], 
                width: '100%', 
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Typography>Image {item}</Typography>
              </div>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Tabs Section */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Contact" />
          <Tab label="Gallery" />
        </Tabs>
      </Box>

      {/* Overview Tab Content */}
      {tabValue === 0 && (
        <Box>
          {/* Brand Description */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2
            }}>
              <DescriptionIcon sx={{ color: "#ff9800" }} />
              Brand Description
            </Typography>
            <Typography paragraph sx={{ 
              color: "text.primary",
              lineHeight: 1.6,
              whiteSpace: 'pre-line'
            }}>
              {brand.personalDetails?.brandDescription || "No description available"}
            </Typography>
          </Box>

          {/* Company Details Table */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2
            }}>
              <Business sx={{ color: "#ff9800" }} />
              Company Details
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
              <Table>
                <TableBody>
                  {companyDetails.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ 
                        width: '30%', 
                        fontWeight: 500,
                        backgroundColor: theme.palette.grey[50]
                      }}>
                        {row.label}
                      </TableCell>
                      <TableCell sx={{ color: "#ff9800" }}>
                        {row.value || "Not specified"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Franchise Details Table */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2
            }}>
              <AccountTree sx={{ color: "#ff9800" }} />
              Franchise Details
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
              <Table>
                <TableBody>
                  {franchiseDetails.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ 
                        width: '30%', 
                        fontWeight: 500,
                        backgroundColor: theme.palette.grey[50]
                      }}>
                        {row.label}
                      </TableCell>
                      <TableCell sx={{ color: "#ff9800" }}>
                        {row.value || "Not specified"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Investment Details Table */}
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2
            }}>
              <AttachMoney sx={{ color: "#ff9800" }} />
              Investment Details
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
              <Table>
                <TableBody>
                  {investmentDetails.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ 
                        width: '30%', 
                        fontWeight: 500,
                        backgroundColor: theme.palette.grey[50]
                      }}>
                        {row.label}
                      </TableCell>
                      <TableCell sx={{ color: "#ff9800" }}>
                        {row.value || "Not specified"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BrandProfile;