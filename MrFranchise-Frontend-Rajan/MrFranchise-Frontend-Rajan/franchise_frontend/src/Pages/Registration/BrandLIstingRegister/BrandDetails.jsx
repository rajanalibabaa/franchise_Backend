
import React, { useState, useEffect } from "react";
import {
  TextField,
  Grid,
  Typography,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Paper,
  Box,
  styled,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import categories from "../BrandLIstingRegister/BrandCategories";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const BrandDetails = ({ data = {}, errors = {}, onChange }) => {
  const formData = {
    companyName: "",
    brandName: "",
    brandCategories: [],
    expansionLocation: [],
    ...data,
  };

  const [selectedCategory, setSelectedCategory] = useState({
    main: "",
    sub: "",
    child: "",
  });
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const [openLocationModal, setOpenLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState({
    country: "India",
    state: "",
    district: "",
    city: "",
  });
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [pincodeError, setPincodeError] = useState(null);
  const [loadingPincode, setLoadingPincode] = useState(false);

  // Initialize with basic Indian states
  useEffect(() => {
    const basicStates = [
      { name: "Maharashtra", iso2: "MH" },
      { name: "Delhi", iso2: "DL" },
      { name: "Karnataka", iso2: "KA" },
      { name: "Tamil Nadu", iso2: "TN" },
      { name: "Uttar Pradesh", iso2: "UP" },
      { name: "Gujarat", iso2: "GJ" },
      { name: "West Bengal", iso2: "WB" },
      { name: "Rajasthan", iso2: "RJ" },
      { name: "Andhra Pradesh", iso2: "AP" },
      { name: "Telangana", iso2: "TG" },
    ];
    setStates(basicStates);
  }, []);

  // Handle pincode change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (data.pincode && data.pincode.length === 6) {
        fetchAddressFromPincode(data.pincode);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [data.pincode]);

  const fetchAddressFromPincode = async (pincode) => {
    setLoadingPincode(true);
    setPincodeError(null);

    try {
      const response = await axios.get(
        `https://api.postalpincode.in/pincode/${pincode}`
      );

      if (response.data && response.data[0].Status === "Success") {
        const postOffice = response.data[0].PostOffice[0];
        const updates = {
          state: postOffice.State,
          city: postOffice.District,
          headOfficeAddress: `${postOffice.Name}, ${postOffice.District}, ${postOffice.State}`,
        };
        onChange(updates);
      } else {
        setPincodeError("Could not find address for this pincode");
      }
    } catch (error) {
      console.error("Error fetching pincode details:", error);
      setPincodeError(
        "Failed to fetch address details. Please enter manually."
      );
    } finally {
      setLoadingPincode(false);
    }
  };

  // Fetch districts when state changes in the modal
  useEffect(() => {
    if (!newLocation.state) return;

    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        // Mock districts based on state
        const mockDistricts = {
          Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
          Delhi: ["New Delhi", "Central Delhi", "East Delhi"],
          Karnataka: ["Bangalore", "Mysore", "Hubli", "Mangalore"],
          "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
          "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra"],
        };

        const districts = mockDistricts[newLocation.state] || ["Not available"];
        setDistricts(districts.map((name) => ({ name })));
      } catch (error) {
        console.error("Error generating districts:", error);
        setApiError("Failed to load districts. Please try again later.");
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
    setNewLocation((prev) => ({ ...prev, district: "", city: "" }));
  }, [newLocation.state]);

  // Fetch cities when district changes in the modal
  useEffect(() => {
    if (!newLocation.district) return;

    setLoadingCities(true);
    setApiError(null);

    setTimeout(() => {
      try {
        // Mock city data based on district
        const mockCities = {
          Mumbai: ["Mumbai", "Navi Mumbai", "Thane"],
          Pune: ["Pune", "Pimpri-Chinchwad", "Hinjewadi"],
          Nagpur: ["Nagpur", "Kamptee", "Katol"],
          Bangalore: ["Bangalore", "Electronic City", "Whitefield"],
          Delhi: ["New Delhi", "Noida", "Gurgaon"],
          Chennai: ["Chennai", "Tambaram", "Anna Nagar"],
          // Add more districts as needed
        };

        const cities = mockCities[newLocation.district] || ["Not available"];
        setCities(cities.map((name) => ({ name })));
      } catch (error) {
        console.error("Error generating cities:", error);
        setApiError("Failed to load cities. Please try again later.");
      } finally {
        setLoadingCities(false);
      }
    }, 500);
  }, [newLocation.district]);

  const handleAddLocation = () => {
    if (newLocation.state && newLocation.district && newLocation.city) {
      const updatedLocations = Array.isArray(data.expansionLocation)
        ? [...data.expansionLocation, { ...newLocation }]
        : [{ ...newLocation }];
      onChange({ expansionLocation: updatedLocations });
      setNewLocation({ country: "India", state: "", district: "", city: "" });
      setOpenLocationModal(false);
    }
  };

  const handleRemoveLocation = (index) => {
    const updatedLocations = [...data.expansionLocation];
    updatedLocations.splice(index, 1);
    onChange({ expansionLocation: updatedLocations });
  };

  const handleCategoryHover = (level, value) => {
    setSelectedCategory((prev) => {
      if (level === "main") return { main: value, sub: "", child: "" };
      if (level === "sub") return { ...prev, sub: value, child: "" };
      if (level === "child") return { ...prev, child: value };
      return prev;
    });
  };

  const handleAddCategory = () => {
    if (selectedCategory.child) {
      const isDuplicate = Array.isArray(data.brandCategories) && data.brandCategories.some(
        (cat) =>
          cat.main === selectedCategory.main &&
          cat.sub === selectedCategory.sub &&
          cat.child === selectedCategory.child
      );

      if (!isDuplicate) {
        const updatedCategories = [
 ...(Array.isArray(data.brandCategories) ? data.brandCategories : []),
  { ...selectedCategory },        ];
        onChange({ brandCategories: updatedCategories });
        setSelectedCategory((prev) => ({ ...prev, child: "" }));
      }
    }
  };

  useEffect(() => {
    if (selectedCategory.child) {
      handleAddCategory();
    }
  }, [selectedCategory.child]);

  return (
    <Box sx={{ overflowY: "auto", pr: 1, mt: 0 }}>
      {/* Brand Details Section - Now in 5 columns for desktop */}
      <Paper
        elevation={0}
        sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}
      >
        <Typography variant="h6" sx={{ mb: 1, color: "primary.main" }}>
          Brand Details
        </Typography>

        <Grid
          container
          spacing={2}
          sx={{
            display: "grid",
            gridTemplateColumns: { md: "repeat(5, 1fr)", xs: "1fr" },
            gap: 2,
          }}
        >
          {/* Company Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Company Name"
              name="companyName"
              value={formData.companyName || ""}
              onChange={handleChange}
              variant="outlined"
              size="small"
              error={!!errors.companyName}
              helperText={errors.companyName}
              required
            />
          </Grid>

          {/* Brand Name */}
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Brand Name"
              name="brandName"
              value={formData.brandName || ""}
              onChange={handleChange}
              variant="outlined"
              size="small"
              error={!!errors.brandName}
              helperText={errors.brandName}
              required
            />
          </Grid>

          {/* Established Year */}
          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth error={!!errors.establishedYear}>
              <InputLabel size="small">Established Year</InputLabel>
              <Select
                name="establishedYear"
                value={data.establishedYear || ""}
                label="Established Year"
                onChange={handleChange}
                variant="outlined"
                size="small"
                required
              >
                {Array.from(
                  { length: 30 },
                  (_, i) => new Date().getFullYear() - i
                ).map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
              {errors.establishedYear && (
                <Typography variant="caption" color="error">
                  {errors.establishedYear}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Franchise Since Year */}
          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth error={!!errors.franchiseSinceYear}>
              <InputLabel size="small">Franchise Since Year</InputLabel>
              <Select
                name="franchiseSinceYear"
                value={data.franchiseSinceYear || ""}
                label="Franchise Since Year"
                onChange={handleChange}
                variant="outlined"
                size="small"
                required
              >
                {Array.from(
                  { length: 30 },
                  (_, i) => new Date().getFullYear() - i
                ).map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
              {errors.franchiseSinceYear && (
                <Typography variant="caption" color="error">
                  {errors.franchiseSinceYear}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Expansion Location - Full width */}
          <Grid item xs={12}>
            <Box>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setOpenLocationModal(true)}
                sx={{
                  color: errors.expansionLocation
                    ? "error.main"
                    : "primary.main",
                  borderColor: errors.expansionLocation
                    ? "error.main"
                    : "primary.main",
                  "&:hover": {
                    borderColor: errors.expansionLocation
                      ? "error.main"
                      : "primary.main",
                  },
                }}
              >
                Add Expansion Location
              </Button>
              <Box sx={{ color: "error.main", fontSize: "0.875rem", mt: 1 }}>
                {errors.expansionLocation}
              </Box>
            </Box>

            {/* Expansion Location Modal */}
            <Dialog
              open={openLocationModal}
              onClose={() => setOpenLocationModal(false)}
            >
              <DialogTitle>Add Expansion Location</DialogTitle>
              <DialogContent>
                <Box sx={{ minWidth: 300, pt: 1 }}>
                  {apiError && (
                    <Typography color="error" sx={{ mb: 2 }}>
                      {apiError}
                    </Typography>
                  )}

                  {/* Country is fixed to India */}
                  <TextField
                    fullWidth
                    label="Country"
                    value="India"
                    disabled
                    sx={{ mb: 2 }}
                  />

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>State</InputLabel>
                    <Select
                      value={newLocation.state}
                      onChange={(e) =>
                        setNewLocation({
                          ...newLocation,
                          state: e.target.value,
                          district: "",
                          city: "",
                        })
                      }
                      label="State"
                      disabled={loadingStates}
                    >
                      {states.map((state) => (
                        <MenuItem key={state.iso2} value={state.name}>
                          {state.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>District</InputLabel>
                    <Select
                      value={newLocation.district}
                      onChange={(e) =>
                        setNewLocation({
                          ...newLocation,
                          district: e.target.value,
                          city: "",
                        })
                      }
                      label="District"
                      disabled={!newLocation.state || loadingDistricts}
                    >
                      {loadingDistricts ? (
                        <MenuItem disabled>Loading districts...</MenuItem>
                      ) : districts.length > 0 ? (
                        districts.map((district) => (
                          <MenuItem key={district.name} value={district.name}>
                            {district.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No districts available</MenuItem>
                      )}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>City</InputLabel>
                    <Select
                      value={newLocation.city}
                      onChange={(e) =>
                        setNewLocation({
                          ...newLocation,
                          city: e.target.value,
                        })
                      }
                      label="City"
                      disabled={!newLocation.district || loadingCities}
                    >
                      {loadingCities ? (
                        <MenuItem disabled>Loading cities...</MenuItem>
                      ) : cities.length > 0 ? (
                        cities.map((city) => (
                          <MenuItem key={city.name} value={city.name}>
                            {city.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No cities available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenLocationModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddLocation}
                  disabled={!newLocation.city}
                  variant="contained"
                >
                  Add Location
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>

          {/* Categories Section - Full width */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", mb: 2, gap: 1 }}>
              <Box sx={{ position: "relative", flexGrow: 1 }}>
                <TextField
                  label="Select Category"
                  value={
                    selectedCategory.child
                      ? `${selectedCategory.main} > ${selectedCategory.sub} > ${selectedCategory.child}`
                      : ""
                  }
                  onFocus={() => setDropdownOpen(true)}
                  onChange={() => {}}
                  fullWidth
                  size="small"
                  error={!!errors.brandCategories}
                  helperText={
                    errors.brandCategories || "Select at least one category"
                  }
                />
                {isDropdownOpen && (
                  <Paper
                    sx={{
                      position: "absolute",
                      zIndex: 2,
                      mt: 1,
                      width: "100%",
                      display: "flex",
                      boxShadow: 3,
                      minHeight: 300,
                    }}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    {/* Parent Categories */}
                    <Box sx={{ flex: 1, borderRight: "1px solid #eee" }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ p: 1, fontWeight: "bold", bgcolor: "grey.100" }}
                      >
                        Main Categories
                      </Typography>
                      <List sx={{ maxHeight: 300, overflow: "auto" }}>
                        {categories.map((category) => (
                          <ListItem
                            key={category.name}
                            button
                            selected={selectedCategory.main === category.name}
                            onMouseEnter={() =>
                              handleCategoryHover("main", category.name)
                            }
                            dense
                          >
                            <ListItemText
                              primary={category.name}
                              primaryTypographyProps={{
                                fontWeight:
                                  selectedCategory.main === category.name
                                    ? "bold"
                                    : "normal",
                                color:
                                  selectedCategory.main === category.name
                                    ? "primary.main"
                                    : "text.primary",
                              }}
                            />
                            {category.children &&
                              category.children.length > 0 && (
                                <ChevronRightIcon
                                  fontSize="small"
                                  color="action"
                                />
                              )}
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    {/* Subcategories */}
                    {selectedCategory.main && (
                      <Box
                        sx={{
                          flex: 1,
                          borderRight: "1px solid #eee",
                          bgcolor: "background.paper",
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            p: 1,
                            fontWeight: "bold",
                            bgcolor: "grey.100",
                          }}
                        >
                          Subcategories
                        </Typography>
                        <List sx={{ maxHeight: 300, overflow: "auto" }}>
                          {categories
                            .find((cat) => cat.name === selectedCategory.main)
                            ?.children?.map((subCategory) => (
                              <ListItem
                                key={subCategory.name}
                                button
                                selected={
                                  selectedCategory.sub === subCategory.name
                                }
                                onMouseEnter={() =>
                                  handleCategoryHover("sub", subCategory.name)
                                }
                                dense
                              >
                                <ListItemText
                                  primary={subCategory.name}
                                  primaryTypographyProps={{
                                    fontWeight:
                                      selectedCategory.sub === subCategory.name
                                        ? "bold"
                                        : "normal",
                                    color:
                                      selectedCategory.sub === subCategory.name
                                        ? "primary.main"
                                        : "text.primary",
                                  }}
                                />
                                {subCategory.children &&
                                  subCategory.children.length > 0 && (
                                    <ChevronRightIcon
                                      fontSize="small"
                                      color="action"
                                    />
                                  )}
                              </ListItem>
                            ))}
                        </List>
                      </Box>
                    )}

                    {/* Child Categories */}
                    {selectedCategory.sub && (
                      <Box sx={{ flex: 1, bgcolor: "background.paper" }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            p: 1,
                            fontWeight: "bold",
                            bgcolor: "grey.100",
                          }}
                        >
                          Items
                        </Typography>
                        <List sx={{ maxHeight: 300, overflow: "auto" }}>
                          {categories
                            .find((cat) => cat.name === selectedCategory.main)
                            ?.children?.find(
                              (sub) => sub.name === selectedCategory.sub
                            )
                            ?.children?.map((child, index) => (
                              <ListItem
                                key={index}
                                button
                                selected={selectedCategory.child === child}
                                onClick={() =>
                                  handleCategoryHover("child", child)
                                }
                                dense
                              >
                                <ListItemText
                                  primary={child}
                                  primaryTypographyProps={{
                                    color:
                                      selectedCategory.child === child
                                        ? "primary.main"
                                        : "text.primary",
                                    fontWeight:
                                      selectedCategory.child === child
                                        ? "bold"
                                        : "normal",
                                  }}
                                />
                              </ListItem>
                            ))}
                        </List>
                      </Box>
                    )}
                  </Paper>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Communication Information Section - 5 columns */}
      <Paper
        elevation={0}
        sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1, mt: 1 }}
      >
        <Typography variant="h6" sx={{ mb: 1, color: "primary.main" }}>
          Communication Information
        </Typography>
        <Grid
          container
          spacing={2}
          sx={{
            display: "grid",
            gridTemplateColumns: { md: "repeat(5, 1fr)", xs: "1fr" },
            gap: 2,
          }}
        >
          {/* Full Name */}
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={data.fullName || ""}
              onChange={handleChange}
              error={!!errors.fullName}
              helperText={errors.fullName}
              variant="outlined"
              size="small"
              required
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={data.email || ""}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              variant="outlined"
              size="small"
              required
            />
          </Grid>

          {/* Mobile Number */}
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Mobile Number"
              name="mobileNumber"
              value={data.mobileNumber || ""}
              onChange={handleChange}
              error={!!errors.mobileNumber}
              helperText={errors.mobileNumber}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">+91</InputAdornment>
                ),
              }}
              required
            />
          </Grid>

          {/* WhatsApp Number */}
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="WhatsApp Number"
              name="whatsappNumber"
              value={data.whatsappNumber || ""}
              onChange={handleChange}
              error={!!errors.whatsappNumber}
              helperText={errors.whatsappNumber}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">+91</InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Pincode */}
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Pincode"
              name="pincode"
              value={data.pincode || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                onChange({ pincode: value });
              }}
              error={!!errors.pincode || !!pincodeError}
              helperText={errors.pincode || pincodeError}
              variant="outlined"
              size="small"
              required
              InputProps={{
                endAdornment: loadingPincode ? (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ) : null,
              }}
            />
          </Grid>

          {/* Head Office Address - Full width on mobile, 5th column on desktop */}
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Head Office Address"
              name="headOfficeAddress"
              value={data.headOfficeAddress || ""}
              onChange={handleChange}
              error={!!errors.headOfficeAddress}
              helperText={errors.headOfficeAddress}
              variant="outlined"
              size="small"
              required
            />
          </Grid>

          {/* State */}
          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth error={!!errors.state}>
              <InputLabel size="small">State</InputLabel>
              <Select
                name="state"
                value={data.state || ""}
                label="State"
                onChange={handleChange}
                variant="outlined"
                size="small"
                required
              >
                {states.map((state) => (
                  <MenuItem key={state.iso2} value={state.name}>
                    {state.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.state && (
                <Typography variant="caption" color="error">
                  {errors.state}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* City */}
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={data.city || ""}
              onChange={handleChange}
              error={!!errors.city}
              helperText={errors.city}
              variant="outlined"
              size="small"
              required
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Social Media Section - 5 columns */}
      <Paper
        elevation={0}
        sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1, mt: 1 }}
      >
        <Typography variant="h6" sx={{ mb: 1, color: "primary.main" }}>
          Social Media & Web Presence
        </Typography>

        <Grid
          container
          spacing={2}
          sx={{
            display: "grid",
            gridTemplateColumns: { md: "repeat(5, 1fr)", xs: "1fr" },
            gap: 2,
          }}
        >
          {/* Website */}
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={data.website || ""}
              onChange={handleChange}
              variant="outlined"
              size="small"
              error={!!errors.website}
              helperText={errors.website}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">https://</InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Facebook */}
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Facebook"
              name="facebook"
              value={data.facebook || ""}
              onChange={handleChange}
              variant="outlined"
              size="small"
              error={!!errors.facebook}
              helperText={errors.facebook}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">@</InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Instagram */}
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Instagram"
              name="instagram"
              value={data.instagram || ""}
              onChange={handleChange}
              variant="outlined"
              size="small"
              error={!!errors.instagram}
              helperText={errors.instagram}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">@</InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* LinkedIn */}
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="LinkedIn"
              name="linkedin"
              value={data.linkedin || ""}
              onChange={handleChange}
              variant="outlined"
              size="small"
              error={!!errors.linkedin}
              helperText={errors.linkedin}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">@</InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Brand Description - Full width */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Brand Description"
              name="brandDescription"
              value={data.brandDescription || ""}
              onChange={handleChange}
              variant="outlined"
              size="small"
              error={!!errors.brandDescription}
              helperText={errors.brandDescription}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default BrandDetails;

