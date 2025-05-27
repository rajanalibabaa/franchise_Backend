import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Breadcrumbs,
  Link,
  CircularProgress,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Slider,
  Chip,
  Drawer,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Tab,
  Tabs,
  Rating,
  Fade,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@mui/material";
import {
  Business,
  LocationOn,
  Close,
  Description,
  FilterAlt,
  Search as SearchIcon,
  Clear as ClearIcon,
  Home,
  Store,
  AttachMoney,
  Star,
  StarBorder,
  Share,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Facebook,
  Instagram,
  LinkedIn,
  AccountTree,
  Support,
  Favorite,
  AreaChart,
} from "@mui/icons-material";
import { CheckCircleOutline } from "@mui/icons-material";
import {motion} from "framer-motion"
import axios from "axios";

function BrandList() {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedModelType, setSelectedModelType] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableModelTypes, setAvailableModelTypes] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedInvestmentRange, setSelectedInvestmentRange] = useState("");
  const investmentRangeOptions = [
    { label: "All Ranges", value: "" },
    { label: "Rs.10,000-50,000", value: "Below - Rs.50 " },
    { label: "Rs.2L-5L", value: "Rs.2L-5L" },
    { label: "Rs.5L-10L", value: "Rs.5 L - 10 L" },
    { label: "Rs.10L-20L", value: "Rs.10 L - 20 L" },
    { label: "Rs.20L-30L", value: "Rs.20 L - 30 L" },
    { label: "Rs.30L-50L", value: "Rs.30 L - 50 L" },
    { label: "Rs.50L-1Cr", value: "Rs.50 L - 1 Cr" },
    { label: "Rs.1Cr-2Cr", value: "Rs.1 Cr - 2 Cr" },
    { label: "Rs.2Cr-5Cr", value: "Rs.2 Cr - 5 Cr" },
    { label: "Rs.5Cr-above", value: "Rs.5 Cr - Above" },
  ];

  // Application form states

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        "http://localhost:5000/api/v1/brandlisting/getAllBrandListing",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const brandsData = response.data.data;
      console.log("Brands data:", brandsData);

      setBrands(brandsData);
      setFilteredBrands(brandsData);

      // Extract unique categories and locations
      const categories = [
        ...new Set(
          brandsData.flatMap(
            (brand) =>
              brand.personalDetails?.brandCategories?.map(
                (category) => category.main
              ) || []
          )
        ),
      ];

      const modelTypes = [
        ...new Set(
          brandsData.flatMap(
            (brand) =>
              brand.franchiseDetails?.modelsOfFranchise?.map(
                (model) => model.franchiseType
              ) || []
          )
        ),
      ];

      const states = [
        ...new Set(
          brandsData
            .map((brand) => brand.personalDetails?.state)
            .filter(Boolean)
        ),
      ];

      const cities = [
        ...new Set(
          brandsData.map((brand) => brand.personalDetails?.city).filter(Boolean)
        ),
      ];
      setAvailableCategories(categories);
      setAvailableModelTypes(modelTypes);
      setAvailableStates(states);
      setAvailableCities(cities);
    } catch (err) {
      setError(err.message || "Failed to fetch brands");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const applyFilters = useCallback(() => {
    let result = [...brands];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((brand) => {
        const brandName = brand.personalDetails?.brandName || "";
        const description = brand.personalDetails?.description || "";
        const companyName = brand.personalDetails?.companyName || "";
        return (
          brandName.toLowerCase().includes(term) ||
          description.toLowerCase().includes(term) ||
          companyName.toLowerCase().includes(term)
        );
      });
    }

    // Apply category filter
    if (selectedCategory) {
      result = result.filter((brand) =>
        brand.personalDetails?.brandCategories?.some(
          (cat) => cat.main === selectedCategory
        )
      );
    }

    // Apply model type filter
    if (selectedModelType) {
      result = result.filter((brand) =>
        brand.franchiseDetails?.modelsOfFranchise?.some(
          (model) => model.franchiseType === selectedModelType
        )
      );
    }

    // Apply state filter
    if (selectedState) {
      result = result.filter(
        (brand) =>
          brand.personalDetails?.state === selectedState ||
          brand.personalDetails?.expansionLocation?.some(
            (loc) => loc.state === selectedState
          )
      );
    }

    // Apply city filter
    if (selectedCity) {
      result = result.filter(
        (brand) =>
          brand.personalDetails?.city === selectedCity ||
          brand.personalDetails?.expansionLocation?.some(
            (loc) => loc.city === selectedCity
          )
      );
    }

    // Apply investment range filter
    if (selectedInvestmentRange) {
      const [min, max] = selectedInvestmentRange.split("-").map(Number);
      result = result.filter((brand) => {
        const franchiseFee =
          parseFloat(brand.franchiseDetails?.franchiseFee) || 0;
        return franchiseFee >= min && franchiseFee <= max;
      });
    }

    setFilteredBrands(result);
  }, [
    brands,
    searchTerm,
    selectedCategory,
    selectedModelType,
    selectedState,
    selectedCity,
    selectedInvestmentRange,
  ]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleOpenBrand = (brand) => {
    setSelectedBrand(brand);
    setOpenDialog(true);
    setTabValue(0);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBrand(null);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedModelType("");
    setSelectedState("");
    setSelectedCity("");
    setSelectedInvestmentRange("");
  };

  const activeFilterCount = [
    searchTerm,
    selectedCategory,
    selectedModelType,
    selectedState,
    selectedCity,
    selectedInvestmentRange,
  ].filter(Boolean).length;

  const FilterPanel = () => (
    <Box sx={{ width: 280, p: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Filters</Typography>
        <Button
          size="small"
          onClick={clearFilters}
          disabled={activeFilterCount === 0}
          startIcon={<ClearIcon />}
          sx={{ color: "#ff9800" }}
        >
          Clear
        </Button>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search brands..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: "#ff9800" }} />,
        }}
        sx={{ mb: 3 }}
      />

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          label="Category"
          sx={{
            "& .MuiSelect-icon": {
              color: "#ff9800",
            },
          }}
        >
          <MenuItem value="">
            <em>All Categories</em>
          </MenuItem>
          {availableCategories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Model Type Filter */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Model Type</InputLabel>
        <Select
          value={selectedModelType}
          onChange={(e) => setSelectedModelType(e.target.value)}
          label="Model Type"
          sx={{
            "& .MuiSelect-icon": {
              color: "#ff9800",
            },
          }}
        >
          <MenuItem value="">
            <em>All Model Types</em>
          </MenuItem>
          {availableModelTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* State Filter */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>State</InputLabel>
        <Select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          label="State"
          sx={{
            "& .MuiSelect-icon": {
              color: "#ff9800",
            },
          }}
        >
          <MenuItem value="">
            <em>All States</em>
          </MenuItem>
          {availableStates.map((state) => (
            <MenuItem key={state} value={state}>
              {state}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* City Filter */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>City</InputLabel>
        <Select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          label="City"
          sx={{
            "& .MuiSelect-icon": {
              color: "#ff9800",
            },
          }}
        >
          <MenuItem value="">
            <em>All Cities</em>
          </MenuItem>
          {availableCities.map((city) => (
            <MenuItem key={city} value={city}>
              {city}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography gutterBottom sx={{ color: "#4caf50" }}>
        Investment Range
      </Typography>
      <Select
        value={selectedInvestmentRange}
        onChange={(e) => setSelectedInvestmentRange(e.target.value)}
        label="Investment Range"
        sx={{
          "& .MuiSelect-icon": {
            color: "#ff9800",
          },
          width: "100%",
        }}
      >
        {investmentRangeOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>

      <Typography variant="body2" sx={{ color: "#4caf50" }}>
        Showing {filteredBrands.length} of {brands.length} brands
      </Typography>
    </Box>
  );

  const [likedStatus, setlikedStatus] = useState({});
  const toggleLike = (brandId) => {
    setlikedStatus((prev) => ({
      ...prev,
      [brandId]: !prev[brandId],
    }));
    console.log("Brand ID liked:", brandId);
  };

  const BrandCard = ({ brand }) => (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
        },
      }}
    >
      <img
        src={brand.brandDetails?.brandLogo}
        alt="logo"
        style={{
          objectFit: "contain",
          backgroundColor: "#f5f5f5",
          p: 2,
          height: 270,
          width: "100%",
        }}
      />
      <CardContent sx={{ flexGrow: 1 }} >
        <Box >
          <Typography
            gutterBottom
            variant="h5"
            component="div"
            sx={{ color: "black" }}
          >
            {brand.personalDetails?.brandName}
          </Typography>
          <Typography>
            <Favorite 
                       onClick={() => toggleLike(brand.uuid)}
                        sx={{
                        // position: "absolute",
                        // top: 8,
                        // right: 8,
                        cursor: "pointer",
                        color: likedStatus[brand.uuid] ? "red" : "gray",
                        }}
            />
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" mb={1}>
          <Rating
            value={4.5}
            precision={0.5}
            readOnly
            size="small"
            icon={<Star fontSize="inherit" sx={{ color: "#ff9800" }} />}
            emptyIcon={<StarBorder fontSize="inherit" />}
          />
          <Typography variant="body2" sx={{ ml: 1, color: "black" }}>
            (24)
          </Typography>
        </Box>

        <Box sx={{ mb: 1 }}>
          {brand.personalDetails?.categories
            ?.slice(0, 2)
            .map((category, index) => (
              <Chip
                key={index}
                label={category}
                size="small"
                sx={{
                  mr: 0.5,
                  mb: 0.5,
                  bgcolor: "#ff9800",
                  color: "white",
                }}
              />
            ))}
        </Box>

        <Typography
          variant="body2"
          sx={{ mb: 1, display: "flex", alignItems: "center", color: "black" }}
        >
          <LocationOn sx={{ mr: 1, fontSize: "1rem", color: "black" }} />
           Location: {brand.personalDetails?.city?.split(",").pop() ||
            "Multiple locations"}
        </Typography>

        <Typography
          variant="body2"
          sx={{ mb: 1, display: "flex", alignItems: "center", color: "black" }}
        >
          <AttachMoney sx={{ mr: 1, fontSize: "1rem", color: "black" }} />
          Investment:{brand.franchiseDetails?.modelsOfFranchise.map(
            (model) => model.investmentRange
          )}
        </Typography>
        <Typography>
          <AreaChart/>
          Area Required :
          {brand.franchiseDetails?.modelsOfFranchise.map(
            (model) => model.areaRequired
          )}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2 }}>
        <Button
          size="medium"
          onClick={() => handleOpenBrand(brand)}
          startIcon={<Description />}
          fullWidth
          variant="contained"
          sx={{
            py: 1,
            bgcolor: "#4caf50",
            "&:hover": {
              bgcolor: "#388e3c",
            },
          }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );

  
  const OverviewTab = React.memo(({ brand }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const formRef = useRef(null);
    const [selectedModel, setSelectedModel] = useState(null);
    const [formData, setFormData] = useState({
        fullName: "",
        franchiseModel: "",
        franchiseType: "",
        investmentRange: "",
        location: "",
        planToInvest: "",
        readyToInvest: "",
    });

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const cardHoverVariants = {
        hover: {
            y: -5,
            boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        }
    };

    const franchiseModels = [
        ...new Set(
            brand?.franchiseDetails?.modelsOfFranchise?.map(
                (m) => m.franchiseModel
            ) || []
        ),
    ];
    const franchiseTypes = [
        ...new Set(
            brand?.franchiseDetails?.modelsOfFranchise?.map(
                (m) => m.franchiseType
            ) || []
        ),
    ];
    const investmentRanges = [
        ...new Set(
            brand?.franchiseDetails?.modelsOfFranchise?.map(
                (m) => m.investmentRange
            ) || []
        ),
    ];
    const investmentTimings = [
        "Immediately",
        "1-3 months",
        "3-6 months",
        "6+ months",
    ];
    const readyToInvestOptions = [
        "Own Investment",
        "Going To Loan",
        "Need Loan Assistance",
    ];

    const handleModelSelect = (model) => {
        setSelectedModel(model);
        setFormData((prev) => ({
            ...prev,
            franchiseModel: model.franchiseModel || prev.franchiseModel,
            franchiseType: model.franchiseType || prev.franchiseType,
            investmentRange: model.investmentRange || prev.investmentRange,
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                brandId: brand?._id,
                brandName: brand?.personalDetails?.brandName || "",
            };

            const response = await axios.post(
                "http://localhost:5000/api/v1/brandlisting/createInstaApply",
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.data.success) {
                alert("✅ Your application has been submitted successfully!");
                setSubmitSuccess(true);
                setFormData({
                    fullName: "",
                    location: "",
                    franchiseModel: "",
                    franchiseType: "",
                    investmentRange: "",
                    planToInvest: "",
                    readyToInvest: "",
                });
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("❌Failed to submit application.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setFormData({
            fullName: "",
            location: "",
            franchiseModel: "",
            franchiseType: "",
            investmentRange: "",
            planToInvest: "",
            readyToInvest: "",
        });
        setSubmitSuccess(false);
    };

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(value || 0);

    const formatList = (items) => items?.join(", ") || "Not specified";
    const toArray = (val) => (Array.isArray(val) ? val : val ? [val] : []);
    const {
        companyImage,
        exteriorOutlet = [],
        interiorOutlet = [],
    } = brand.brandDetails || {};
    const allImages = [
        ...toArray(companyImage),
        ...toArray(exteriorOutlet),
        ...toArray(interiorOutlet),
    ];

    const sections = [
        {
            title: "Brand Overview",
            icon: <DescriptionIcon sx={{ color: "#ff9800" }} />,
            items: [
                { label: "Brand Name", value: brand.personalDetails?.brandName },
                {
                    label: "Description",
                    value: brand.personalDetails?.brandDescription,
                },
                {
                    label: "Categories",
                    value: brand.personalDetails?.brandCategories?.map(
                        (categories, index) => (
                            <Box key={index} display={"flex"} flexDirection="row" gap={1}>
                                <Typography variant="body2">
                                
                                    {categories.main || "Not specified"} & {categories.child || "Not specified"} & {categories.sub || "Not specified"}
                                  
                                </Typography>
                            </Box>
                        )
                    ),
                },
            ],
        },
        {
            title: "Franchise Models",
            icon: <AccountTree sx={{ color: "#ff9800" }} />,
            content: (
                <>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <TableContainer 
                            component={Paper} 
                            sx={{ 
                                mb: 3,
                                overflow: "hidden",
                                borderRadius: "12px",
                                border: "1px solid rgba(0,0,0,0.1)"
                            }}
                        >
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ 
                                        bgcolor: "#7ad03a",
                                        "& th": {
                                            fontWeight: "bold",
                                            fontSize: "0.875rem",
                                        }
                                    }}>
                                        <TableCell sx={{ width: "8%" }}>Model</TableCell>
                                        <TableCell sx={{ width: "8%" }}>Type</TableCell>
                                        <TableCell sx={{ width: "8%" }}>Investment</TableCell>
                                        <TableCell sx={{ width: "8%" }}>Area</TableCell>
                                        <TableCell sx={{ width: "8%" }}>Franchise</TableCell>
                                        <TableCell sx={{ width: "8%" }}>Royalty</TableCell>
                                        <TableCell sx={{ width: "8%" }}>Interior</TableCell>
                                        <TableCell sx={{ width: "8%" }}>Exterior</TableCell>
                                        <TableCell sx={{ width: "8%" }}>ROI</TableCell>
                                        <TableCell sx={{ width: "8%" }}>BreakEven</TableCell>
                                        <TableCell sx={{ width: "8%" }}>Select</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {brand.franchiseDetails?.modelsOfFranchise?.map(
                                        (model, index) => (
                                            <motion.tr
                                                key={index}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                                sx={{
                                                    "&:hover": { backgroundColor: "#fff8e1" },
                                                    backgroundColor:
                                                        selectedModel?._id === model._id
                                                            ? "#fff3e0"
                                                            : "inherit",
                                                }}
                                            >
                                                <TableCell>
                                                    {model.franchiseModel || "Not specified"}
                                                </TableCell>
                                                <TableCell>
                                                    {model.franchiseType || "Not specified"}
                                                </TableCell>
                                                <TableCell>
                                                    {model.investmentRange || "Not specified"}
                                                </TableCell>
                                                <TableCell>
                                                    {model.areaRequired || "Not specified"}
                                                </TableCell>
                                                <TableCell>
                                                    {model.franchiseFee || "Not specified"}
                                                </TableCell>
                                                <TableCell>
                                                    {model.royaltyFee || "Not specified"}
                                                </TableCell>
                                                <TableCell>
                                                    {model.interiorCost || "Not specified"}
                                                </TableCell>
                                                <TableCell>
                                                    {model.exteriorCost || "Not specified"}
                                                </TableCell>
                                                <TableCell>{model.roi || "Not specified"}</TableCell>
                                                <TableCell>
                                                    {model.breakEven || "Not specified"}
                                                </TableCell>
                                                <TableCell>
                                                    <motion.div whileHover={{ scale: 1.05 }}>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => handleModelSelect(model)}
                                                            sx={{
                                                                color: "#ff9800",
                                                                minWidth: 100,
                                                                borderColor: "#ff9800",
                                                                "&:hover": {
                                                                    backgroundColor: "#ff9800",
                                                                    color: "white",
                                                                    borderColor: "#ff9800",
                                                                },
                                                            }}
                                                        >
                                                            {selectedModel?._id === model._id
                                                                ? "Selected"
                                                                : "Select"}
                                                        </Button>
                                                    </motion.div>
                                                </TableCell>
                                            </motion.tr>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button 
                            variant="outlined" 
                            sx={{ 
                                color: "#ff9800", 
                                borderColor: "#ff9800",
                                fontWeight: 600,
                                px: 4,
                                py: 1.5,
                                borderRadius: "8px",
                                textTransform: "none",
                                fontSize: "1rem"
                            }} 
                            onClick={() => setIsModalOpen(true)}
                        >
                            Apply for Franchise
                        </Button>
                    </motion.div>

                    <Dialog
                        open={isModalOpen}
                        onClose={handleModalClose}
                        maxWidth="md"
                        fullWidth
                        PaperProps={{
                            sx: {
                                borderRadius: "12px",
                                overflow: "hidden"
                            }
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <DialogTitle>
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="space-between"
                                >
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            <DescriptionIcon sx={{ color: "#ff9800", mr: 1 }} />{" "}
                                            Franchise Application
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <IconButton onClick={handleModalClose}>
                                            <Close />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </DialogTitle>

                            <DialogContent>
                                {submitSuccess ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <Box sx={{ textAlign: "center", py: 4 }}>
                                            <CheckCircleOutline
                                                sx={{ fontSize: 60, color: "#4caf50", mb: 2 }}
                                            />
                                            <Typography variant="h6" sx={{ mb: 2 }}>
                                                Application Submitted Successfully!
                                            </Typography>
                                            <Typography variant="body1">
                                                We'll contact you soon regarding your franchise
                                                application.
                                            </Typography>
                                            <motion.div whileHover={{ scale: 1.03 }}>
                                                <Button
                                                    variant="contained"
                                                    onClick={handleModalClose}
                                                    sx={{ 
                                                        mt: 2, 
                                                        bgcolor: "#4caf50",
                                                        borderRadius: "8px",
                                                        px: 4,
                                                        py: 1.5,
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    Close
                                                </Button>
                                            </motion.div>
                                        </Box>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        <Grid
                                            container
                                            spacing={2}
                                            sx={{
                                                display: "grid",
                                                pt: 2,
                                                gridTemplateColumns: "repeat(5, 1fr)",
                                            }}
                                        >
                                            <Grid item xs={12} md={6}>
                                                <motion.div variants={itemVariants}>
                                                    <TextField
                                                        fullWidth
                                                        label="Full Name"
                                                        name="fullName"
                                                        value={formData.fullName}
                                                        onChange={handleChange}
                                                        required
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ mb: 2 }}
                                                    />
                                                </motion.div>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <motion.div variants={itemVariants}>
                                                    <TextField
                                                        fullWidth
                                                        label="Location"
                                                        name="location"
                                                        value={formData.location}
                                                        onChange={handleChange}
                                                        required
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ mb: 2 }}
                                                    />
                                                </motion.div>
                                            </Grid>

                                            <Grid item xs={12} md={4}>
                                                <motion.div variants={itemVariants}>
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        label="Franchise Model"
                                                        name="franchiseModel"
                                                        value={formData.franchiseModel}
                                                        onChange={handleChange}
                                                        required
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ mb: 2 }}
                                                    >
                                                        {franchiseModels.map((model, i) => (
                                                            <MenuItem key={i} value={model}>
                                                                {model}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                </motion.div>
                                            </Grid>

                                            <Grid item xs={12} md={4}>
                                                <motion.div variants={itemVariants}>
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        label="Franchise Type"
                                                        name="franchiseType"
                                                        value={formData.franchiseType}
                                                        onChange={handleChange}
                                                        required
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ mb: 2 }}
                                                    >
                                                        {franchiseTypes.map((type, i) => (
                                                            <MenuItem key={i} value={type}>
                                                                {type}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                </motion.div>
                                            </Grid>

                                            <Grid item xs={12} md={4}>
                                                <motion.div variants={itemVariants}>
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        label="Investment Range"
                                                        name="investmentRange"
                                                        value={formData.investmentRange}
                                                        onChange={handleChange}
                                                        required
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ mb: 2 }}
                                                    >
                                                        {investmentRanges.map((range, i) => (
                                                            <MenuItem key={i} value={range}>
                                                                {range}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                </motion.div>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <motion.div variants={itemVariants}>
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        label="Plan to Invest"
                                                        name="planToInvest"
                                                        value={formData.planToInvest}
                                                        onChange={handleChange}
                                                        required
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ mb: 2 }}
                                                    >
                                                        {investmentTimings.map((option, i) => (
                                                            <MenuItem key={i} value={option}>
                                                                {option}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                </motion.div>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <motion.div variants={itemVariants}>
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        label="Ready to Invest"
                                                        name="readyToInvest"
                                                        value={formData.readyToInvest}
                                                        onChange={handleChange}
                                                        required
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ mb: 2 }}
                                                    >
                                                        {readyToInvestOptions.map((option, i) => (
                                                            <MenuItem key={i} value={option}>
                                                                {option}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                </motion.div>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <motion.div
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                >
                                                    <Button
                                                        type="submit"
                                                        variant="contained"
                                                        fullWidth
                                                        size="large"
                                                        disabled={isSubmitting}
                                                        sx={{
                                                            bgcolor: "#ff9800",
                                                            fontWeight: 600,
                                                            "&:hover": {
                                                                bgcolor: "#fb8c00",
                                                            },
                                                            ml: 0,
                                                            borderRadius: "8px",
                                                            py: 1.5,
                                                            fontSize: "1rem"
                                                        }}
                                                    >
                                                        {isSubmitting ? (
                                                            <CircularProgress size={24} color="inherit" />
                                                        ) : (
                                                            "Submit"
                                                        )}
                                                    </Button>
                                                </motion.div>
                                            </Grid>
                                        </Grid>
                                    </form>
                                )}
                            </DialogContent>
                        </motion.div>
                    </Dialog>
                </>
            ),
        },

        {
            title: "Company Details",
            icon: <Business sx={{ color: "#ff9800" }} />,
            items: [
                { label: "Company Name", value: brand.personalDetails?.companyName },
                {
                    label: "Established Year",
                    value: brand.personalDetails?.establishedYear,
                },
                {
                    label: "Franchising Since",
                    value: brand.personalDetails?.franchiseSinceYear,
                },
                // {
                //     label: "Social Media",
                //     value: (
                //         <Box sx={{ display: "flex", gap: 1 }}>
                //             {brand.personalDetails?.facebook && (
                //                 <motion.div whileHover={{ y: -2 }}>
                //                     <IconButton
                //                         href={brand.personalDetails.facebook}
                //                         target="_blank"
                //                     >
                //                         <Facebook sx={{ color: "#1877F2" }} />
                //                     </IconButton>
                //                 </motion.div>
                //             )}
                //             {brand.personalDetails?.instagram && (
                //                 <motion.div whileHover={{ y: -2 }}>
                //                     <IconButton
                //                         href={brand.personalDetails.instagram}
                //                         target="_blank"
                //                     >
                //                         <Instagram sx={{ color: "#E4405F" }} />
                //                     </IconButton>
                //                 </motion.div>
                //             )}
                //             {brand.personalDetails?.linkedin && (
                //                 <motion.div whileHover={{ y: -2 }}>
                //                     <IconButton
                //                         href={brand.personalDetails.linkedin}
                //                         target="_blank"
                //                     >
                //                         <LinkedIn sx={{ color: "#0A66C2" }} />
                //                     </IconButton>
                //                 </motion.div>
                //             )}
                //         </Box>
                //     ),
                // },
            ],
        },

        {
            title: "Franchise Details",
            icon: <AttachMoney sx={{ color: "#ff9800" }} />,
            content: (
                <motion.div variants={itemVariants}>
                    <TableContainer 
                        component={Paper}
                        sx={{
                            borderRadius: "12px",
                            overflow: "hidden",
                            border: "1px solid rgba(0,0,0,0.1)"
                        }}
                    >
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 500 }}>Agreement Period</TableCell>
                                    <TableCell>
                                        {brand?.franchiseDetails?.agreementPeriod ||
                                            "Not specified"}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 500 }}>companyOwned Outlets</TableCell>
                                    <TableCell>
                                        {brand?.franchiseDetails?.franchiseOutlets ||
                                            "Not specified"}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 500 }}>Franchise Outlets</TableCell>
                                    <TableCell>
                                        {brand?.franchiseDetails?.companyOwnedOutlets ||
                                            "Not specified"}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </motion.div>
            ),
        },
        {
            title: "Support & Training",
            icon: <Support sx={{ color: "#ff9800" }} />,
            items: [
                {
                    label: "Training Provided By",
                    value: brand.franchiseDetails?.trainingProvidedBy,
                },
                {
                    label: "Requirement Support",
                    value: brand.franchiseDetails?.requirementSupport,
                },
                {
                    label: "Expansion Locations",
                    value: brand.personalDetails?.expansionLocation?.map(
                        (location, index) => (
                            <Box key={index} sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                                <Typography>{location.city}</Typography> ,
                                <Typography>{location.state}</Typography> ,
                                <Typography>{location.country}</Typography>
                            </Box>
                        )
                    ),
                },
            ],
        },
    ];

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box
                display="flex"
                flexDirection={{ xs: "column", lg: "row" }}
                gap={4}
                sx={{ mt: 2 }}
            >
                <Box flex={1}>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {sections.map((section, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                whileHover="hover"
                            >
                                <Box
                                    sx={{
                                        mb: 4,
                                        bgcolor: "background.paper",
                                        borderRadius: "12px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                        p: 3,
                                        borderLeft: "4px solid #ff9800",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
                                        }
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 600,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            mb: 2,
                                            color: "text.primary",
                                            pb: 1,
                                            borderBottom: "2px solid #ff9800",
                                        }}
                                    >
                                        {section.icon}
                                        {section.title}
                                    </Typography>

                                    {section.content || (
                                        <TableContainer 
                                            component={Paper}
                                            sx={{
                                                borderRadius: "8px",
                                                overflow: "hidden"
                                            }}
                                        >
                                            <Table size="medium">
                                                <TableBody>
                                                    {section.items.map((item, itemIndex) => (
                                                        <TableRow key={itemIndex}>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    color: "text.secondary",
                                                                    width: "30%",
                                                                    fontSize: "0.875rem"
                                                                }}
                                                            >
                                                                {item.label}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{ 
                                                                    color: "text.primary", 
                                                                    wordBreak: "break-word",
                                                                    fontSize: "0.875rem"
                                                                }}
                                                            >
                                                                {item.value || "Not specified"}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                </Box>
                            </motion.div>
                        ))}
                    </motion.div>
                </Box>
            </Box>
        </Box>
    );
});

  const BrandDetailsDialog = React.memo(({}) => {
    const [tabIndex, setTabIndex] = useState(0);
    const [openGallery, setOpenGallery] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const videoRefs = useRef({});

    const franchiseModelsData =
      selectedBrand?.franchiseDetails?.modelsOfFranchise || [];

    // Combine all media URLs into arrays
    const allVideos = [
      ...(selectedBrand?.brandDetails?.brandPromotionVideo || []),
      ...(selectedBrand?.brandDetails?.franchisePromotionVideo || []),
    ];

    const allImages = [
      ...(selectedBrand?.brandDetails?.brandLogo || []),
      ...(selectedBrand?.brandDetails?.companyImage || []),
      ...(selectedBrand?.brandDetails?.exterioroutlet || []),
      ...(selectedBrand?.brandDetails?.interiorOutlet || []),
      // ...(selectedBrand?.brandDetails?.gstCertificate || []),
      // ...(selectedBrand?.brandDetails?.pancard || [])
    ];

    const [formData, setFormData] = useState({
      fullName: "",
      franchiseModel: "",
      franchiseType: "",
      investmentRange: "",
      location: "",
      planToInvest: "",
      readyToInvest: "",
    });

    const handleMediaClick = (media, index) => {
      // If it's a video and we're clicking the controls, don't open full screen
      const isVideoControlClick =
        event.target.tagName === "VIDEO" ||
        event.target.classList.contains("MuiSlider-root") ||
        event.target.classList.contains("MuiButtonBase-root");

      if (!isVideoControlClick) {
        setSelectedMedia(media);
        setOpenGallery(true);
      }
    };

    const renderTabContent = useCallback(() => {
      return <OverviewTab brand={selectedBrand} />;
    }, [selectedBrand]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Extract franchise models data from the response

    // Enhanced franchise model options with all details
    const getFranchiseModelOptions = () => {
      return franchiseModelsData.map((model) => ({
        label: model.franchiseModel,
        value: model.franchiseModel,
        fullData: model, // Include all model data for reference
      }));
    };

    // Enhanced franchise type options based on selected model
    const getFranchiseTypeOptions = () => {
      if (!formData.franchiseModel) return [];
      const selectedModel = franchiseModelsData.find(
        (model) => model.franchiseModel === formData.franchiseModel
      );
      return selectedModel
        ? [
            {
              label: selectedModel.franchiseType,
              value: selectedModel.franchiseType,
              fullData: selectedModel,
            },
          ]
        : [];
    };

    // Enhanced investment range options based on selected model
    const getInvestmentRangeOptions = () => {
      if (!formData.franchiseModel) return [];
      const selectedModel = franchiseModelsData.find(
        (model) => model.franchiseModel === formData.franchiseModel
      );
      return selectedModel
        ? [
            {
              label: selectedModel.investmentRange,
              value: selectedModel.investmentRange,
              fullData: selectedModel,
            },
          ]
        : [];
    };
    // Other options (unchanged)
    const investmentTimings = [
      "Immediately",
      "1-3 months",
      "3-6 months",
      "6+ months",
    ];
    const readyToInvestOptions = [
      "Own Investment",
      "Going To Loan",
      "Need Loan Assistance",
    ];

    const handleModalClose = () => {
      setIsModalOpen(false);
      setFormData({
        fullName: "",
        franchiseModel: "",
        franchiseType: "",
        investmentRange: "",
        location: "",
        planToInvest: "",
        readyToInvest: "",
      });
      setSubmitSuccess(false);
    };

    // Form structure with enhanced fields
    const formFields = [
      {
        name: "fullName",
        label: "Full Name",
        type: "text",
        required: true,
      },
      {
        name: "location",
        label: "Your Location",
        type: "text",
        required: true,
      },
      // {
      //   sectionTitle: 'Investor Details',
      //   icon: <BusinessIcon sx={{ color: '#ff9800', fontSize: 20 }} />
      // },
      {
        name: "franchiseModel",
        label: "Franchise Model",
        type: "select",
        options: getFranchiseModelOptions(),
        required: true,
      },
      {
        name: "franchiseType",
        label: "Franchise Type",
        type: "select",
        options: getFranchiseTypeOptions(),
        required: true,
        disabled: !formData.franchiseModel,
      },
      {
        name: "investmentRange",
        label: "Investment Range",
        type: "select",
        options: getInvestmentRangeOptions(),
        required: true,
        disabled: !formData.franchiseModel,
      },
      {
        name: "planToInvest",
        label: "Plan to Invest",
        type: "select",
        options: investmentTimings.map((option) => ({
          label: option,
          value: option,
        })),
        required: true,
      },
      {
        name: "readyToInvest",
        label: "Ready to Invest",
        type: "select",
        options: readyToInvestOptions.map((option) => ({
          label: option,
          value: option,
        })),
        required: true,
      },
    ];

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const formRef = useRef(null);
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const payload = {
          ...formData,
          brandId: selectedBrand?._id,
          brandName: selectedBrand?.personalDetails?.brandName || "",
        };
        console.log(payload);

        const response = await axios.post(
          "http://localhost:5000/api/v1/brandlisting/createInstaApply",
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          alert("✅ Your application has been submitted successfully!");
          // Reset form fields
          setFormData({
            fullName: "",
            location: "",
            franchiseModel: "",
            franchiseType: "",
            investmentRange: "",
            planToInvest: "",
            readyToInvest: "",
          });
          setIsModalOpen(false);
        }
      } catch (error) {
        console.error("Submission error:", error);
        // Optional: Add toast or alert for user feedback
        alert(
          "Error submitting form: " +
            (error.response?.data?.message || error.message || "Network error")
        );
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        scroll="paper"
        sx={{
        "& .MuiDialog-paper": {
          borderRadius: 3,
          overflow: "hidden",
          background: "linear-gradient(145deg, #f5f7fa 0%, #ffffff 100%)",
        },
      }}
      >
        {/* Dialog Title */}
        <DialogTitle
          sx={{
            position: "sticky",
            padding: 1,
            top: 0,
            zIndex: 1,
            bgcolor: "background.paper",
            boxShadow: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }} gap={2}>
              <Box
                sx={{
                  position: "relative",
                  mr: { sm: 3 },
                  mb: { xs: 2, sm: 0 },
                }}
              >
                <img
                  src={selectedBrand?.brandDetails?.brandLogo}
                  alt={selectedBrand?.personalDetails?.brandName}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    objectFit: "cover",
                    ml: 2,
                  }}
                />

                <Box
                  sx={{
                    position: "absolute",
                    bottom: 5,
                    right: -10,
                    bgcolor: "#ff9800",
                    color: "white",
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: 2,
                  }}
                >
                  <BusinessIcon fontSize="small" />
                </Box>
              </Box>
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 700,
                background:
                  "linear-gradient(45deg,rgb(6, 6, 6) 30%,rgb(6, 6, 6) 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {selectedBrand?.personalDetails?.brandName}

              <Box display="flex" alignItems="center" mb={1}>
                <Rating
                  value={3.5}
                  precision={0.5}
                  readOnly
                  size="medium"
                  icon={<Star fontSize="inherit" sx={{ color: "#ff9800" }} />}
                  emptyIcon={
                    <StarBorder fontSize="inherit" sx={{ color: "#e0e0e0" }} />
                  }
                />
                <Typography
                  variant="body2"
                  sx={{
                    ml: 1,
                    color: "black",
                  }}
                >
                  (24 reviews)
                </Typography>
              </Box>
            </Typography>
          </Box>
          <Box>
            <IconButton
              onClick={handleCloseDialog}
              sx={{
                color: "black",
                "&:hover": {
                  bgcolor: "rgba(11, 11, 11, 0.1)",
                },
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* Dialog Content */}
        <Typography variant="subtitle1" m={2}>
          {selectedBrand?.personalDetails?.brandCategories &&
            selectedBrand.personalDetails.brandCategories.length > 0 && (
              <Box>
                {selectedBrand.personalDetails.brandCategories.map(
                  (category, index) => (
                    <Box
                      key={index}
                      sx={{ mb: 1 }}
                      display={"flex"}
                      justifyContent={"flex-start"} gap={20} 
                    >
                      {/* <Typography>Main: {category.main}</Typography>
                      <Typography>Sub: {category.sub}</Typography> */}
                      <Typography sx={{ fontWeight: "bold" }}>
                        Category:{" "}
                        <label style={{ color: "#ff9800" }}>
                          {category.child}
                        </label>
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold" }}
                      >
                        Investment Range :
                        <label style={{ color: "#ff9800" }}>
                          {selectedBrand?.franchiseDetails?.modelsOfFranchise?.map(
                            (model) => model.investmentRange
                          )}
                        </label>
                      </Typography>
                      <Typography sx={{ fontWeight: "bold" }}>
                        Arearequired :
                        <label style={{ color: "#ff9800" }}>
                          {selectedBrand?.franchiseDetails?.modelsOfFranchise?.map(
                            (model) => model.areaRequired
                          )}
                        </label>
                      </Typography>
                    </Box>
                  )
                )}
              </Box>
            )}
             {selectedBrand?.personalDetails?.expansionLocation.length > 0 && (
         <Typography sx={{ fontWeight: "bold" }}>
           Expansion Locations :
           <label style={{ color: "#ff9800" }}>
             {selectedBrand?.personalDetails?.expansionLocation?.map(
               (location) => `${location.city}, ${location.state}`
             )}
           </label>
         </Typography>
       )}
        </Typography>
      
        <DialogContent
          dividers
          sx={{
            display: "flex",
            p: 1,
            position: "relative",
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* Main Content Area */}
          <Box
            sx={{
              flex: 1,
              p: 3,
              overflowY: "auto",
              maxHeight: "70vh",
            }}
          >
            {selectedBrand && (
              <>
                {/* Brand Header */}

                <Grid
                  display={"flex"}
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                >
                  <Grid display={"flex"} flexDirection={"column"}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        // mb: 1,
                        flexDirection: { xs: "column", sm: "row" },
                      }}
                    ></Box>
                  </Grid>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={12}>
                      <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2 }}>
                        <Tabs
                          value={tabIndex}
                          onChange={(e, newValue) => setTabIndex(newValue)}
                          centered
                          sx={{ mb: 2 }}
                        >
                          <Tab label="Video" />
                          <Tab label="Images" />
                        </Tabs>

                        {tabIndex === 0 ? (
                          <Box display="flex" flexWrap="wrap" gap={2}>
                            {allVideos.map((videoUrl, index) => (
                              <Box
                                key={index}
                                sx={{
                                  width: { xs: "100%", sm: "48%", md: "48%" },
                                  height: 300,
                                  borderRadius: 2,
                                  overflow: "hidden",
                                  backgroundColor: "#f5f5f5",
                                  cursor: "relative",
                                }}
                                onClick={(e) =>
                                  handleMediaClick(videoUrl, index, e)
                                }
                              >
                                <video
                                  ref={(el) => (videoRefs.current[index] = el)}
                                  controls
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <source src={videoUrl} type="video/mp4" />
                                  Your browser does not support the video tag.
                                </video>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Box display="flex" flexWrap="wrap" gap={2}>
                            {allImages.map((imageUrl, index) => (
                              <Box
                                key={index}
                                sx={{
                                  width: { xs: "100%", sm: "30%", md: "23%" },
                                  height: 200,
                                  borderRadius: 2,
                                  overflow: "hidden",
                                  backgroundColor: "#f5f5f5",
                                  cursor: "pointer",
                                }}
                                onClick={() => handleMediaClick(imageUrl)}
                              >
                                <img
                                  src={imageUrl}
                                  alt={`Gallery ${index}`}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>
                <Box sx={{ minHeight: "300px" }}>{renderTabContent()}</Box>
              </>
            )}
          </Box>
        </DialogContent>
        {/* Dialog Actions */}
        <DialogActions
          sx={{
            p: 2,
            bgcolor: "#f5f5f5",
            borderTop: "2px solid #4caf50",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<Share sx={{ color: "#ff9800" }} />}
            sx={{
              borderRadius: 2,
              px: 3,
              borderColor: "#ff9800",
              color: "#ff9800",
              "&:hover": {
                borderColor: "#fb8c00",
                bgcolor: "rgba(255,152,0,0.08)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Share
          </Button>
          <Button variant="outlined" sx={{
              borderRadius: 2,
              px: 3,
              borderColor: "#ff9800",
              color: "#ff9800",
              "&:hover": {
                borderColor: "#fb8c00",
                bgcolor: "rgba(255,152,0,0.08)",
              },
              transition: "all 0.3s ease",
            }} onClick={() => setIsModalOpen(true)}>
            Apply for Franchise
          </Button>
          <Dialog
            open={isModalOpen}
            onClose={handleModalClose}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={0}
              >
                <Box display="flex" alignItems="center">
                  <DescriptionIcon sx={{ color: "#ff9800", mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Franchise Application
                  </Typography>
                </Box>
                <IconButton onClick={handleModalClose}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent>
              <Grid container spacing={3}>
                {submitSuccess && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Application submitted successfully! We'll contact you soon.
                  </Alert>
                )}

                <form onSubmit={handleSubmit} ref={formRef}>
                  <Grid
                    container
                    spacing={2}
                    pt={1}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                    }}
                    flexDirection={"column"}
                  >
                    {formFields.map((field, index) => {
                      if (field.sectionTitle) {
                        return (
                          <Grid item xs={12} key={`section-${index}`}>
                            <Typography
                              variant="subtitle1"
                              fontWeight={600}
                              sx={{
                                color: "text.primary",
                                mt: 1,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              {field.icon}
                              {field.sectionTitle}
                            </Typography>
                          </Grid>
                        );
                      }

                      return (
                        <Grid item xs={12} key={field.name}>
                          {field.type === "select" ? (
                            <TextField
                              select
                              fullWidth
                              label={field.label}
                              name={field.name}
                              value={formData[field.name] || ""}
                              onChange={handleChange}
                              required={field.required}
                              disabled={field.disabled}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: "#e0e0e0",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: "#ff9800",
                                  },
                                },
                              }}
                            >
                              {field.options.map((option, i) => (
                                <MenuItem key={i} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </TextField>
                          ) : (
                            <TextField
                              fullWidth
                              label={field.label}
                              name={field.name}
                              value={formData[field.name] || ""}
                              onChange={handleChange}
                              variant="outlined"
                              required={field.required}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: "#e0e0e0",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: "#ff9800",
                                  },
                                },
                              }}
                            />
                          )}
                        </Grid>
                      );
                    })}

                    {/* Franchise Details Summary
            {formData.franchiseModel && (
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2, mt: 2, bgcolor: '#fff9e6' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#ff9800' }}>
                    Franchise Model Details
                  </Typography>
                  {franchiseModelsData
                    .filter(model => model.franchiseModel === formData.franchiseModel)
                    .map((model, i) => (
                      <Box key={i}>
                        <Typography><strong>Model:</strong> {model.franchiseModel}</Typography>
                        <Typography><strong>Type:</strong> {model.franchiseType}</Typography>
                        <Typography><strong>Investment Range:</strong> {model.investmentRange}</Typography>
                        <Typography><strong>Area Required:</strong> {model.areaRequired}</Typography>
                        <Typography><strong>Franchise Fee:</strong> {model.franchiseFee}</Typography>
                        <Typography><strong>Royalty Fee:</strong> {model.royaltyFee}</Typography>
                        <Typography><strong>Agreement Period:</strong> {selectedBrand?.franchiseDetails?.agreementPeriod || 'N/A'}</Typography>
                        <Typography><strong>Total Outlets:</strong> {selectedBrand?.franchiseDetails?.totalOutlets || 'N/A'}</Typography>
                        <Typography><strong>Company Owned:</strong> {selectedBrand?.franchiseDetails?.companyOwnedOutlets || 'N/A'}</Typography>
                        <Typography><strong>Franchise Owned:</strong> {selectedBrand?.franchiseDetails?.franchiseOutlets || 'N/A'}</Typography>
                        <Typography><strong>Support:</strong> {selectedBrand?.franchiseDetails?.requirementSupport || 'N/A'}</Typography>
                        <Typography><strong>Training:</strong> {selectedBrand?.franchiseDetails?.trainingProvidedBy || 'N/A'}</Typography>
                      </Box>
                    ))}
                </Paper>
              </Grid>
            )} */}

                    {/* Submit Button */}
                    <Grid item xs={12}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        mt={1}
                        ml={6}
                      >
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          disabled={isSubmitting}
                          sx={{
                            bgcolor: "#ff9800",
                            px: 4,
                            fontWeight: 700,
                            "&:hover": {
                              bgcolor: "#fb8c00",
                            },
                          }}
                        >
                          {isSubmitting ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            "Submit"
                          )}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </Grid>
            </DialogContent>
          </Dialog>
        </DialogActions>

        {/* Media Viewer Dialog */}
        <Dialog
          open={openGallery}
          onClose={() => setOpenGallery(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <IconButton onClick={() => setOpenGallery(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {selectedMedia &&
              (selectedMedia.endsWith(".mp4") ||
              selectedMedia.endsWith(".webm") ? (
                <video
                  controls
                  autoPlay
                  style={{
                    width: "100%",
                    maxHeight: "80vh",
                    objectFit: "contain",
                  }}
                >
                  <source src={selectedMedia} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={selectedMedia}
                  alt="Full view"
                  style={{
                    width: "100%",
                    maxHeight: "80vh",
                    objectFit: "contain",
                  }}
                />
              ))}
          </DialogContent>
        </Dialog>
      </Dialog>
    );
  });

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href="/"
          sx={{ display: "flex", alignItems: "center", color: "#4caf50" }}
        >
          <Home sx={{ mr: 0.5, color: "#ff9800" }} /> Home
        </Link>
        <Typography
          sx={{ display: "flex", alignItems: "center", color: "#4caf50" }}
        >
          <Store sx={{ mr: 0.5, color: "#ff9800" }} /> Franchise Brands
        </Typography>
      </Breadcrumbs>

      <Box display="flex" flexDirection={{ xs: "column", md: "row" }}>
        {/* Desktop Filters */}
        <Box
          sx={{
            width: { md: 280 },
            flexShrink: 0,
            display: { xs: "none", md: "block" },
          }}
        >
          <FilterPanel />
        </Box>

        {/* Mobile Filters Button */}
        <Box sx={{ display: { xs: "block", md: "none" }, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterAlt sx={{ color: "#ff9800" }} />}
            endIcon={
              <Badge
                badgeContent={activeFilterCount}
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: "#4caf50",
                    color: "white",
                  },
                }}
              />
            }
            onClick={() => setMobileFiltersOpen(true)}
            fullWidth
            sx={{
              py: 1.5,
              borderColor: "#ff9800",
              color: "#ff9800",
              "&:hover": {
                borderColor: "#fb8c00",
              },
            }}
          >
            Filters
          </Button>
        </Box>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, ml: { md: 3 } }}>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="60vh"
            >
              <CircularProgress
                size={60}
                thickness={4}
                sx={{ color: "#ff9800" }}
              />
            </Box>
          ) : error ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="60vh"
            >
              <Typography color="error" variant="h6">
                {error}
              </Typography>
            </Box>
          ) : filteredBrands.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography
                variant="h5"
                component={"span"}
                sx={{ color: "#4caf50" }}
              >
                No brands match your filters
              </Typography>
              <Typography variant="body1" sx={{ color: "#ff9800", mb: 3 }}>
                Try adjusting your search or filter criteria
              </Typography>
              <Button
                variant="outlined"
                onClick={clearFilters}
                startIcon={<ClearIcon />}
                size="large"
                sx={{
                  borderColor: "#ff9800",
                  color: "#ff9800",
                  "&:hover": {
                    borderColor: "#fb8c00",
                  },
                }}
              >
                Clear All Filters
              </Button>
            </Box>
          ) : (
            <>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ color: "#4caf50" }}
              >
                Available Franchise Brands
              </Typography>
              <Typography variant="body1" sx={{ color: "black", mb: 3 }}>
                Showing {filteredBrands.length} of {brands.length} brands
              </Typography>

              <Grid container spacing={3}>
                {filteredBrands.map((brand) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={brand._id}>
                    <BrandCard brand={brand} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>
      </Box>

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="left"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        ModalProps={{ keepMounted: true }}
      >
        <Box sx={{ width: 280 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={2}
          >
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setMobileFiltersOpen(false)}>
              <Close sx={{ color: "#ff9800" }} />
            </IconButton>
          </Box>
          <Divider />
          <FilterPanel />
          <Box p={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setMobileFiltersOpen(false)}
              size="large"
              sx={{
                bgcolor: "#4caf50",
                "&:hover": {
                  bgcolor: "#388e3c",
                },
              }}
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Drawer>

      <BrandDetailsDialog />
    </Container>
  );
}

export default BrandList;
