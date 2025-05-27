
import React from "react";
import {
  TextField,
  FormControl,
  FormLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  InputAdornment,
  Grid,
  Typography,
  Box,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Button,
  FormHelperText,
} from "@mui/material";

const FranchiseDetails = ({ data = {}, errors = {}, onChange = () => {} }) => {
  const [ficoModel, setFicoModel] = React.useState({
    investmentRange: "",
    areaRequired: "",
    franchiseModel: "",
    franchiseType: "",
    franchiseFee: "",
    royaltyFee: "",
    royaltyFeeUnit: "%",
    interiorCost: "",
    exteriorCost: "",
    otherCost: "",
    roi: "",
    breakEven: "",
    requireInvestmentCapital: "",
    propertyType: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "companyOwnedOutlets" || name === "franchiseOutlets") {
      const companyOwned =
        name === "companyOwnedOutlets"
          ? parseInt(value || 0)
          : parseInt(data.companyOwnedOutlets || 0);
      const franchise =
        name === "franchiseOutlets"
          ? parseInt(value || 0)
          : parseInt(data.franchiseOutlets || 0);
      const total = companyOwned + franchise;

      onChange({
        [name]: value,
        totalOutlets: total.toString(),
      });
    } else {
      onChange({ [name]: value });
    }
  };

  const handleFicoChange = (e) => {
    const { name, value } = e.target;
    setFicoModel((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoyaltyFeeUnitChange = (e) => {
    const { value } = e.target;
    setFicoModel((prev) => ({
      ...prev,
      royaltyFeeUnit: value,
    }));
  };

  const handleAddFicoModel = () => {
    if (
      !ficoModel.investmentRange ||
      !ficoModel.areaRequired ||
      !ficoModel.franchiseModel ||
      !ficoModel.franchiseType ||
      !ficoModel.franchiseFee ||
      !ficoModel.royaltyFee ||
      !ficoModel.interiorCost ||
      !ficoModel.exteriorCost ||
      !ficoModel.otherCost ||
      !ficoModel.roi ||
      !ficoModel.breakEven ||
      !ficoModel.requireInvestmentCapital ||
      !ficoModel.propertyType
    ) {
      alert("Please fill in all required fields for the FICO model");
      return;
    }

    const formattedFicoModel = {
      ...ficoModel,
      royaltyFee: `${ficoModel.royaltyFee}${ficoModel.royaltyFeeUnit}`,
    };

    const updatedFico = [...(data.fico || []), formattedFicoModel];
    onChange({ fico: updatedFico });

    setFicoModel({
      investmentRange: "",
      areaRequired: "",
      franchiseModel: "",
      franchiseType: "",
      franchiseFee: "",
      royaltyFee: "",
      royaltyFeeUnit: "%",
      interiorCost: "",
      exteriorCost: "",
      otherCost: "",
      roi: "",
      breakEven: "",
      requireInvestmentCapital: "",
      propertyType: "",
    });
  };

  const royaltyFeeUnits = [
    { value: "%", label: "%" },
    { value: "K", label: "Thousand" },
    { value: "L", label: "Lakhs" },
    { value: "Cr", label: "Crore" },
  ];

  const franchiseTypes = [
    "Unit Franchise",
    "Master Franchise",
    "City Franchise",
    "Area Franchise",
    "District Franchise",
    "State Franchise",
  ];

  const franchiseModels = [
    "FOFO (Franchise Owned Franchise Operated)",
    "FOCO (Franchise Owned Company Operated)",
    "FICO (Franchise Invested Company Operated)",
    "COCO (Company Owned Company Operated)",
  ];

  const investmentRanges = [
    { label: "Under ₹5 Lakhs", value: "under_5_lakhs" },
    { label: "₹5-10 Lakhs", value: "5_10_lakhs" },
    { label: "₹10-25 Lakhs", value: "10_25_lakhs" },
    { label: "₹25-50 Lakhs", value: "25_50_lakhs" },
    { label: "₹50 Lakhs - ₹1 Crore", value: "50_lakhs_1_crore" },
    { label: "₹1-2 Crores", value: "1_2_crores" },
    { label: "₹2-5 Crores", value: "2_5_crores" },
    { label: "Above ₹5 Crores", value: "above_5_crores" },
  ];

  const propertyTypes = ["Owned Property", "Rented Property"];

  const agreementPeriods = [
    "1 Year",
    "3 Years",
    "5 Years",
    "7 Years",
    "10 Years",
  ];

  return (
    <Box sx={{}}>
      <Grid container spacing={3}>
        {/* Franchise Details Section */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}
          >
            <Typography variant="h6" sx={{ mb: 3, color: "primary.main" }}>
              Franchise Details
            </Typography>

            {/* Show general FICO error if exists */}
            {errors.fico && typeof errors.fico === 'string' && (
              <Typography color="error" sx={{ mb: 2 }}>
                {errors.fico}
              </Typography>
            )}

            {/* 5-column grid layout */}
            <Grid
              container
              spacing={2}
              sx={{
                display: "grid",
                gridTemplateColumns: { md: "repeat(5, 1fr)", xs: "1fr" },
                gap: 2,
              }}
            >
              {/* Column 1 - Investment Range */}
              <Grid item>
                <FormControl fullWidth error={!!errors["fico[0].investmentRange"]} required>
                  <InputLabel>Investment Range*</InputLabel>
                  <Select
                    value={ficoModel.investmentRange}
                    onChange={handleFicoChange}
                    name="investmentRange"
                    label="Investment Range*"
                  >
                    {investmentRanges.map((range) => (
                      <MenuItem key={range.value} value={range.value}>
                        {range.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors["fico[0].investmentRange"] && (
                    <FormHelperText error>{errors["fico[0].investmentRange"]}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Column 2 - Area Required */}
              <Grid item>
                <TextField
                  fullWidth
                  label="Area Required*"
                  name="areaRequired"
                  value={ficoModel.areaRequired}
                  onChange={handleFicoChange}
                  error={!!errors["fico[0].areaRequired"]}
                  helperText={errors["fico[0].areaRequired"]}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">sq.ft</InputAdornment>,
                  }}
                  required
                />
              </Grid>

              {/* Column 3 - Franchise Model */}
              <Grid item>
                <FormControl fullWidth error={!!errors["fico[0].franchiseModel"]} required>
                  <InputLabel>Franchise Model*</InputLabel>
                  <Select
                    value={ficoModel.franchiseModel}
                    onChange={handleFicoChange}
                    name="franchiseModel"
                    label="Franchise Model*"
                  >
                    {franchiseModels.map((model) => (
                      <MenuItem key={model} value={model}>
                        {model}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors["fico[0].franchiseModel"] && (
                    <FormHelperText error>{errors["fico[0].franchiseModel"]}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Column 4 - Franchise Type */}
              <Grid item>
                <FormControl fullWidth error={!!errors["fico[0].franchiseType"]} required>
                  <InputLabel>Franchise Type*</InputLabel>
                  <Select
                    value={ficoModel.franchiseType}
                    onChange={handleFicoChange}
                    name="franchiseType"
                    label="Franchise Type*"
                  >
                    {franchiseTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors["fico[0].franchiseType"] && (
                    <FormHelperText error>{errors["fico[0].franchiseType"]}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Column 5 - Franchise Fee */}
              <Grid item>
                <TextField
                  fullWidth
                  label="Franchise Fee (₹)*"
                  name="franchiseFee"
                  value={ficoModel.franchiseFee}
                  onChange={handleFicoChange}
                  error={!!errors["fico[0].franchiseFee"]}
                  helperText={errors["fico[0].franchiseFee"]}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  required
                />
              </Grid>

              {/* Second Row - Column 1 - Royalty Fee */}
              <Grid item>
                <TextField
                  fullWidth
                  label="Royalty Fee*"
                  name="royaltyFee"
                  value={ficoModel.royaltyFee}
                  onChange={handleFicoChange}
                  error={!!errors["fico[0].royaltyFee"]}
                  helperText={errors["fico[0].royaltyFee"]}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Select
                          value={ficoModel.royaltyFeeUnit}
                          onChange={handleRoyaltyFeeUnitChange}
                          sx={{
                            "& .MuiSelect-select": {
                              padding: "8px 8px",
                              fontSize: "0.875rem",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              border: "none",
                            },
                          }}
                        >
                          {royaltyFeeUnits.map((unit) => (
                            <MenuItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              </Grid>

              {/* Second Row - Column 2 - Interior Cost */}
              <Grid item>
                <TextField
                  fullWidth
                  label="Interior Cost (₹)*"
                  name="interiorCost"
                  value={ficoModel.interiorCost}
                  onChange={handleFicoChange}
                  error={!!errors["fico[0].interiorCost"]}
                  helperText={errors["fico[0].interiorCost"]}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  required
                />
              </Grid>

              {/* Second Row - Column 3 - Exterior Cost */}
              <Grid item>
                <TextField
                  fullWidth
                  label="Exterior Cost (₹)*"
                  name="exteriorCost"
                  value={ficoModel.exteriorCost}
                  onChange={handleFicoChange}
                  error={!!errors["fico[0].exteriorCost"]}
                  helperText={errors["fico[0].exteriorCost"]}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  required
                />
              </Grid>

              {/* Second Row - Column 4 - Other Cost */}
              <Grid item>
                <TextField
                  fullWidth
                  label="Other Cost (₹)*"
                  name="otherCost"
                  value={ficoModel.otherCost}
                  onChange={handleFicoChange}
                  error={!!errors["fico[0].otherCost"]}
                  helperText={errors["fico[0].otherCost"]}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  required
                />
              </Grid>

              {/* Second Row - Column 5 - ROI */}
              <Grid item>
                <TextField
                  fullWidth
                  label="ROI (months)*"
                  name="roi"
                  value={ficoModel.roi}
                  onChange={handleFicoChange}
                  error={!!errors["fico[0].roi"]}
                  helperText={errors["fico[0].roi"]}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">months</InputAdornment>,
                  }}
                  required
                />
              </Grid>

              {/* Third Row - Column 1 - Break Even */}
              <Grid item>
                <TextField
                  fullWidth
                  label="Break Even (months)*"
                  name="breakEven"
                  value={ficoModel.breakEven}
                  onChange={handleFicoChange}
                  error={!!errors["fico[0].breakEven"]}
                  helperText={errors["fico[0].breakEven"]}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">months</InputAdornment>,
                  }}
                  required
                />
              </Grid>

              {/* Third Row - Column 2 - Required Investment Capital */}
              <Grid item>
                <TextField
                  fullWidth
                  label="Required Investment Capital*"
                  name="requireInvestmentCapital"
                  value={ficoModel.requireInvestmentCapital}
                  onChange={handleFicoChange}
                  error={!!errors["fico[0].requireInvestmentCapital"]}
                  helperText={errors["fico[0].requireInvestmentCapital"]}
                  required
                />
              </Grid>

              {/* Third Row - Column 3 - Property Type */}
              <Grid item>
                <FormControl component="fieldset" fullWidth error={!!errors["fico[0].propertyType"]} required>
                  <FormLabel component="legend">Property Type*</FormLabel>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    {propertyTypes.map((type) => (
                      <FormControlLabel
                        key={type}
                        value={type}
                        control={<Radio />}
                        label={type}
                        checked={ficoModel.propertyType === type}
                        onChange={() =>
                          handleFicoChange({
                            target: { name: "propertyType", value: type },
                          })
                        }
                      />
                    ))}
                  </Box>
                  {errors["fico[0].propertyType"] && (
                    <FormHelperText error>{errors["fico[0].propertyType"]}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Add FICO Model Button - spans remaining columns */}
              <Grid item sx={{ gridColumn: { md: "4 / span 2", xs: "1" } }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddFicoModel}
                  fullWidth
                  sx={{ height: "50%", mt: 2 }}
                >
                  Add FICO Model
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Grid
        container
        spacing={2}
        sx={{
          display: "grid",
          gridTemplateColumns: { md: "repeat(2, 1fr)", xs: "1fr" },
          gap: 2,
          mt: 3,
        }}
      >
        {/* Franchise Network Section */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
              Franchise Network
            </Typography>

            <Grid
              container
              spacing={2}
              sx={{
                display: "grid",
                gridTemplateColumns: { md: "repeat(3, 1fr)", xs: "1fr" },
                gap: 2,
              }}
            >
              <Grid item>
                <TextField
                  fullWidth
                  label="Company Owned Outlets*"
                  name="companyOwnedOutlets"
                  value={data.companyOwnedOutlets || ""}
                  onChange={handleChange}
                  type="number"
                  error={!!errors.companyOwnedOutlets}
                  helperText={errors.companyOwnedOutlets}
                  required
                />
              </Grid>

              <Grid item>
                <TextField
                  fullWidth
                  label="Franchise Outlets*"
                  name="franchiseOutlets"
                  value={data.franchiseOutlets || ""}
                  onChange={handleChange}
                  type="number"
                  error={!!errors.franchiseOutlets}
                  helperText={errors.franchiseOutlets}
                  required
                />
              </Grid>

              <Grid item>
                <TextField
                  fullWidth
                  label="Total Outlets*"
                  name="totalOutlets"
                  value={data.totalOutlets || ""}
                  type="number"
                  InputProps={{ readOnly: true }}
                  variant="filled"
                  error={!!errors.totalOutlets}
                  helperText={errors.totalOutlets}
                  required
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Support and Training Section */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
              Support and Training
            </Typography>

            <Grid
              container
              spacing={2}
              sx={{
                display: "grid",
                gridTemplateColumns: { md: "repeat(3, 1fr)", xs: "1fr" },
                gap: 2,
              }}
            >
              <Grid item>
                <TextField
                  fullWidth
                  label="Requirement Support*"
                  name="requirementSupport"
                  value={data.requirementSupport || ""}
                  onChange={handleChange}
                  error={!!errors.requirementSupport}
                  helperText={errors.requirementSupport}
                  required
                />
              </Grid>

              <Grid item>
                <TextField
                  fullWidth
                  label="Training Provided By*"
                  name="trainingProvidedBy"
                  value={data.trainingProvidedBy || ""}
                  onChange={handleChange}
                  error={!!errors.trainingProvidedBy}
                  helperText={errors.trainingProvidedBy}
                  required
                />
              </Grid>

              <Grid item>
                <FormControl fullWidth error={!!errors.agreementPeriod} required>
                  <InputLabel>Agreement Period*</InputLabel>
                  <Select
                    value={data.agreementPeriod || ""}
                    onChange={handleChange}
                    name="agreementPeriod"
                    label="Agreement Period*"
                  >
                    {agreementPeriods.map((period) => (
                      <MenuItem key={period} value={period}>
                        {period}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.agreementPeriod && (
                    <FormHelperText error>{errors.agreementPeriod}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FranchiseDetails;


