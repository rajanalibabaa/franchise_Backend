import React, { useState, useEffect, useRef } from "react";
import { useForm, useWatch ,Controller} from "react-hook-form";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Grid,
  TextField,
  Radio,
  RadioGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormLabel,
  FormControlLabel,
  Button,
  Typography,
  Link,
  Paper,
  InputAdornment,
  Stack,
  Tooltip,
  List,
  ListItemText,
  Box,
  ListItem,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,

} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { categories } from "./BrandLIstingRegister/BrandCategories";
import backgroundImage from "../../assets/Images/investor image.jpg";
import LoginPage from "../../Pages/LoginPage/LoginPage"


const phoneCodes = {
  India: "+91",
  USA: "+1",
  UK: "+44",
  Canada: "+1",
  Australia: "+61",
};
const countries = [
  { code: "IN", name: "India" },
  { code: "US", name: "USA" },
  { code: "GB", name: "UK" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
];

const InvestorRegister = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    // trigger,
  } = useForm({
    defaultValues: {
      country: "India",
      preferredState:"",
      preferredCity: "",
    },
  });

  const navigate = useNavigate();
  const [phonePrefix, setPhonePrefix] = useState("");
 const [selectedCountry, setSelectedCountry] = useState("India");

const dropdownRef = useRef(null);
  // State for the first category dropdown
  const [isCategoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
 
const [loginOpen, setLoginOpen] = useState(false);

const openLoginPopup = () => {
    setLoginOpen(true);
  };

  const closeLoginPopup = () => {
    setLoginOpen(false);
  };
// Add this useEffect hook to handle outside clicks
useEffect(() => {
  const handleClickOutside = (event) => {
    if (isCategoryDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setCategoryDropdownOpen(false);
    }
  };

  // Add event listener when dropdown is open
  if (isCategoryDropdownOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  // Clean up event listener
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isCategoryDropdownOpen]);


  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // OTP related states
  const [otpModal, setOtpModal] = useState({
    open: false,
    type: null, // 'email', 'mobile', or 'whatsapp'
    otp: "",
    loading: false,
    verified: false,
  });

  const occupationValue = useWatch({
    control,
    name: "occupation",
    defaultValue: "",
  });
  // const propertyType = useWatch({ control, name: "propertyType" });
  const selectedRange = useWatch({ control, name: "investmentRange" });
  // const selectedState = watch("preferredState");

  const [otpStates, setOtpStates] = useState({
    email: {
      sent: false,
      verified: false,
      loading: false,
      token: "",
    },
    mobile: {
      sent: false,
      verified: false,
      loading: false,
      token: "",
    },
    whatsapp: {
      sent: false,
      verified: false,
      loading: false,
      token: "",
    },
  });

  // Helper functions
  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  // Handler for the first category dropdown
  const handleCategorySelection = (mainCategory, subCategory, item) => {
    setSelectedCategory(item);
    setValue("category", item);
    setCategoryDropdownOpen(false);
  };

  // const openOtpModal = (type) => {
  //   setOtpModal({
  //     open: true,
  //     type,
  //     otp: "",
  //     loading: false,
  //     verified: otpStates[type]?.verified || false,
  //   });
  // };

  const closeOtpModal = () => {
    setOtpModal({
      open: false,
      type: null,
      otp: "",
      loading: false,
      verified: false,
    });
  };

  // const sendOtp = async (type) => {
  //   let endpoint = "";
  //   let payload = {};
  //   let fieldName = "";

  //   if (type === "email") {
  //     fieldName = "email";
  //     endpoint =
  //       "https://franchise-backend-wgp6.onrender.com/api/v1/otpverify/send-otp-email";
  //     payload = { email: watch("email"), type: "email" };
  //   } else if (type === "mobile") {
  //     fieldName = "mobileNumber";
  //     endpoint =
  //       "https://franchise-backend-wgp6.onrender.com/api/v1/otpverify/send-otp-mobile";
  //     payload = {
  //       mobile: `${phonePrefix}${watch("mobileNumber")}`,
  //       type: "mobile",
  //     };
  //   } else if (type === "whatsapp") {
  //     fieldName = "whatsappNumber";
  //     endpoint =
  //       "https://franchise-backend-wgp6.onrender.com/api/v1/otpverify/send-otp-whatsapp";
  //     payload = {
  //       mobile: `${phonePrefix}${watch("whatsappNumber")}`,
  //       type: "whatsapp",
  //     };
  //   }

  //   const selectedCountry=useWatch({
  //     control,
  //     name:"country",
  //     defaultValue:"IN"
  //   })





  //   // Validate the field first
  //   const isValid = await trigger(fieldName);
  //   if (!isValid) {
  //     showSnackbar(`Please enter a valid ${type} address`, "error");
  //     return;
  //   }

  //   setOtpStates((prev) => ({
  //     ...prev,
  //     [type]: {
  //       ...prev[type],
  //       loading: true,
  //       error: false,
  //     },
  //   }));

  //   try {
  //     const response = await axios.post(endpoint, payload, {
  //       headers: { "Content-Type": "application/json" },
  //     });

  //     if (response.status === 200 && response.data.message) {
  //       showSnackbar(`OTP sent to your ${type} successfully!`, "success");
  //       setOtpStates((prev) => ({
  //         ...prev,
  //         [type]: {
  //           ...prev[type],
  //           sent: true,
  //           loading: false,
  //           token: response.data.token,
  //         },
  //       }));
  //       openOtpModal(type);
  //     } else {
  //       throw new Error(response.data.message || `Failed to send ${type} OTP`);
  //     }
  //   } catch (error) {
  //     console.error(`Error sending ${type} OTP:`, error);
  //     showSnackbar(
  //       error.response?.data?.message ||
  //         `Failed to send ${type} OTP. Please try again.`,
  //       "error"
  //     );
  //     setOtpStates((prev) => ({
  //       ...prev,
  //       [type]: {
  //         ...prev[type],
  //         loading: false,
  //         error: true,
  //       },
  //     }));
  //   }
  // };

  const verifyOtp = async () => {
    const { type, otp } = otpModal;

    if (!otp || otp.length < 6) {
      // Assuming 4-6 digit OTP
      showSnackbar("Please enter a valid OTP", "error");
      return;
    }

    console.log("Verifying OTP for type:", type);
    console.log("OTP entered:", otp);
    setOtpModal((prev) => ({ ...prev, loading: true }));

    try {
      const response = await axios.post(
        "https://franchise-backend-wgp6.onrender.com/api/v1/otpverify/verify-otp",
        {
          identifier:
            type === "email"
              ? watch("email")
              : `${phonePrefix}${watch(
                  type === "mobile" ? "mobileNumber" : "whatsappNumber"
                )}`,
          otp,
          type,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${otpStates[type].token}`,
          },
        }
      );
      console.log("OTP verification response:", response.data);

      if (response.status === 200 || response.data.message) {
        showSnackbar(`${type} verified successfully!`, "success");
        setOtpStates((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            verified: true,
            loading: false,
          },
        }));
        setOtpModal((prev) => ({
          ...prev,
          open: false,
          loading: false,
          verified: true,
        }));
      } else {
        throw new Error(response.data.message || "Verification failed");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      showSnackbar(
        error.response?.data?.message || "Invalid OTP. Please try again.",
        "error"
      );
      setOtpModal((prev) => ({ ...prev, loading: false }));
    }
  };

  

  const onSubmit = async (data) => {
    const formattedData = {
      firstName: data.firstName || "",
    email: data.email || "",
    mobileNumber: `${phonePrefix}${data.mobileNumber || ""}`.trim(),
    whatsappNumber: `${phonePrefix}${data.whatsappNumber || ""}`.trim(),
    address: data.address || "",
    pincode: data.pincode || "",
    country: data.country || "",
    state: data.state || "",
    city: data.city || "",
    category: data.category || "",
    investmentRange: data.investmentRange || "",
    investmentAmount: data.investmentAmount || "",
    occupation: data.occupation || "",
    ...(data.occupation === "Other" && { specifyOccupation: data.otherOccupation || "" }),
   propertyType: data.propertyType || "",
  ...(data.propertyType === "Own Property" && { 
    propertySize: data.propertySize || "" 
  }),
    preferredState: data.preferredState || "", 
    preferredCity: data.preferredCity || "",
    };
    console.log("Submitting data:", formattedData); 

    try {
      const response = await axios.post(
        "https://franchise-backend-wgp6.onrender.com/api/v1/investor/createInvestor",
        formattedData,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Registration response:", response.data);
      if (response.status === 201) {
        showSnackbar(
          "Registration successful! Redirecting to login...",
          "success"
        );
        // setTimeout(() => navigate("/"), 2000);
      } else {
        showSnackbar(
          "An unexpected error occurred. Please try again.",
          "error"
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (
        error.response?.status === 409 ||
        error.response?.data?.message === "User already registered"
      ) {
        showSnackbar(
          "This user is already registered. Please log in.",
          "error"
        );
      } else {
        showSnackbar(
          error.response?.data?.message ||
            "An unexpected error occurred. Please try again.",
          "error"
        );
      }
    }
  };

  useEffect(() => {
    if (selectedCountry && phoneCodes[selectedCountry]) {
      setPhonePrefix(phoneCodes[selectedCountry]);
    } else {
      setPhonePrefix("");
    }
  }, [selectedCountry]);

  const pincode = watch("pincode");

  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (selectedCountry === "India" && pincode && pincode.length === 6) {
        try {
          const response = await axios.get(
            `https://api.postalpincode.in/pincode/${pincode}`
          );
          const data = response.data[0];
          if (data.Status === "Success") {
            const locationDetails = data.PostOffice[0];
            setValue("state", locationDetails.State || "");
            setValue(
              "city",
              locationDetails.Block || locationDetails.Name || ""
            );
            setValue("district", locationDetails.District || "");
          } else {
            setValue("state", "");
            setValue("city", "");
            setValue("district", "");
            showSnackbar("Invalid Pincode", "error");
          }
        } catch (error) {
          console.error("Error fetching location details:", error);
          showSnackbar("Error fetching location details", "error");
        }
      }
    };
    fetchLocationDetails();
  }, [selectedCountry, pincode, setValue]);

  // Render functions
  // const renderSelectField = (
  //   label,
  //   name,
  //   options,
  //   requiredMsg = "This field is required"
  // ) => (
  //   <FormControl fullWidth error={!!errors[name]}>
  //     <InputLabel>{label}</InputLabel>
  //     <Select
  //       label={label}
  //       defaultValue=""
  //       {...register(name, { required: requiredMsg })}
  //     >
  //       {options.map((opt) => (
  //         <MenuItem key={opt} value={opt}>
  //           {opt}
  //         </MenuItem>
  //       ))}
  //     </Select>
  //     {errors[name] && (
  //       <Typography variant="body2" color="error">
  //         {errors[name]?.message}
  //       </Typography>
  //     )}
  //   </FormControl>
  // );

  return (
   <Box sx={{backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", height: "100vh"}}>
    <Container
      sx={{
        // maxWidth: "lg",
        // overflow: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 2,
        //  height: "100vh"
       
      }}
    >
      <Paper ref= {dropdownRef} elevation={3} sx={{ pt: 1, pl: 5, pr: 3,borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",bgcolor:"#e6f2de" }} >
          <Toolbar sx={{ display: "flex", justifyContent: "flex-end",mb:-2, mt:-2 }}>
    <FormControl size="small" sx={{ minWidth: 120 ,backgroundColor: "white" }}>
      <Select
        value={watch("country") || "India"} // Use watch to get the current country value
        onChange={(e) => {
          setValue("country", e.target.value);
          setSelectedCountry(e.target.value);
        }}
        displayEmpty
        inputProps={{ "aria-label": "Select country" }}
      >
        {countries.map((country) => (
          <MenuItem key={country.code} value={country.name}>
            {country.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Toolbar>
        <Typography
          variant="h4"
          gutterBottom
          fontWeight="bold"
          sx={{ textAlign: "center", mb: 1, color:"orange" }}
        >
          Investor Registration
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography
            variant="h5"
            sx={{ marginBottom: "5px", marginTop: "5px", fontWeight: "bold" , color:"orange"}}
          >
            Personal Details
          </Typography>
<Grid
          container
          spacing={2}
          sx={{
            display: "grid",
            gridTemplateColumns: { md: "repeat(4, 1fr)", xs: "1fr" },
            gap: 2,
          }}
        >            {/* Name Field */}
            <Grid sx={{xs: 12, sm: 6, mb:-2}}>
              <TextField
                fullWidth
                label="Name"
                {...register("firstName", {
                  required: "First name is required",
                })}
                error={!!errors.firstName}
                helperText={errors.firstName?.message || " "}
              />
            </Grid>
            {/* {email field} */}
            <Grid sx={{  xs: 12, sm: 6, mb:-2 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                   value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message || " "}
                // InputProps={{
                //   endAdornment: (
                //     <InputAdornment position="end">
                //       <Button
                //         size="small"
                //         variant="outlined"
                //         onClick={() => {
                //           if (otpStates.email.verified) return;
                //           sendOtp("email");
                //         }}
                //         disabled={otpStates.email.loading || otpStates.email.verified}
                //       >
                //         {otpStates.email.loading ? (
                //           <CircularProgress size={20} />
                //         ) : otpStates.email.verified ? (
                //           "Verified"
                //         ) : otpStates.email.sent ? (
                //           "Resend OTP"
                //         ) : (
                //           "Send OTP"
                //         )}
                //       </Button>
                //     </InputAdornment>
                //   ),
                // }}
              />
            </Grid>
            {/* Mobile number field */}
            <Grid sx={{  xs: 12, sm: 6 , mb:-2}}>
              <TextField
                fullWidth
                label="Phone Number"
                {...register("mobileNumber", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Invalid phone number (10 digits required)",
                  },
                })}
                error={!!errors.mobileNumber}
                helperText={errors.mobileNumber?.message || " "}
                InputProps={{
                  startAdornment: <InputAdornment position="start">{phonePrefix}</InputAdornment>,
                //   endAdornment: (
                //     <InputAdornment position="end">
                //       <Button
                //         size="small"
                //         variant="outlined"
                //         onClick={() => {
                //           if (otpStates.mobile.verified) return;
                //           sendOtp("mobile");
                //         }}
                //         disabled={otpStates.mobile.loading || otpStates.mobile.verified}
                //       >
                //         {otpStates.mobile.loading ? (
                //           <CircularProgress size={20} />
                //         ) : otpStates.mobile.verified ? (
                //           "Verified"
                //         ) : otpStates.mobile.sent ? (
                //           "Resend OTP"
                //         ) : (
                //           "Send OTP"
                //         )}
                //       </Button>
                //     </InputAdornment>
                //   ),
                }}
              />
            </Grid>

            {/* WhatsApp Field */}
            <Grid sx={{ xs: 12, sm: 6, mb:-2 }}>
              <TextField
                fullWidth
                label="WhatsApp Number"
                {...register("whatsappNumber", {
                  required: "WhatsApp number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Invalid WhatsApp number (10 digits required)",
                  },
                })}
                error={!!errors.whatsappNumber}
                helperText={errors.whatsappNumber?.message || " "}
                InputProps={{
                  startAdornment: <InputAdornment position="start">{phonePrefix}</InputAdornment>,
                //   endAdornment: (
                //     <InputAdornment position="end">
                //       <Button
                //         size="small"
                //         variant="outlined"
                //         onClick={() => {
                //           if(otpStates.whatsapp.verified) return;
                //           sendOtp("whatsapp");
                //         }}
                //         disabled={otpStates.whatsapp.loading || otpStates.whatsapp.verified}
                //       >
                //         {otpStates.whatsapp.loading ? (
                //           <CircularProgress size={20} />
                //         ) : otpStates.whatsapp.verified ? (
                //           "Verified"
                //         ) : otpStates.whatsapp.sent ? (
                //           "Resend OTP"
                //         ) : (
                //           "Send OTP"
                //         )}
                //       </Button>
                //     </InputAdornment>
                //   ),
                }}
              />
            </Grid>



            {/* {country} */}
            {/* <Grid sx={{ width: "21%", xs: 12, sm: 3 }}>
              <TextField
                select
                fullWidth
                defaultValue="India"
                SelectProps={{ native: true }}
                label="Country"
                {...register("country", { required: "Country is required" })}
                error={!!errors.country}
                helperText={errors.country?.message || " "}
              >
                <option value="India">India</option>
              </TextField>
            </Grid> */}



            {/* {address} */}
            <Grid sx={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Address"
                {...register("address")}
              />
            </Grid>
            {/* {pincode} */}
            <Grid sx={{ xs: 12, sm: 3, mb:-2 }}>
              <TextField
                fullWidth
                label="Pincode"
                {...register("pincode", {
                  required: "Pincode is required",
                  pattern: {
                    value: /^\d{6}$/,
                    message: "Pincode must be 6 digits",
                  },
                })}
                error={!!errors.pincode}
                helperText={errors.pincode?.message || " "}
              />
            </Grid>
            {/* {state} */}
            <Grid sx={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="State"
                value={watch("state") || ""}
                {...register("state")}
                InputProps={{ readOnly: true }}
                error={!!errors.state}
              />
            </Grid>
            {/* {city} */}
            <Grid sx={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="City"
                value={watch("city") || ""}
                {...register("city")}
                InputProps={{ readOnly: true }}
                error={!!errors.city}
              />
            </Grid>
            {/* {district} */}
            {/* <Grid sx={{ width: "21%", xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="District"
                value={watch("district") || ""}
                {...register("district")}
                InputProps={{ readOnly: true }}
                error={!!errors.district}
              />
            </Grid> */}
            {/* Occupation Field */}
            <Grid sx={{  xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                defaultValue=""
                SelectProps={{ native: true }}
                {...register("occupation")}
                error={!!errors.occupation}
                helperText={errors.occupation?.message}
              >
                <option value="">Select Occupation</option>
                <option value="Student">Student</option>
                <option value="Salaried Professional">Salaried Professional</option>
                <option value="Business Owner/ Self-Employed">
                  Business Owner/ Self-Employed
                </option>
                <option value="retired">Retired</option>
                <option value="freelancer">Freelancer / Consultant</option>
                <option value="investor">Investor</option>
                <option value="homemaker">Homemaker</option>
                <option value="Other">Other</option>
              </TextField>
            </Grid>
            {occupationValue === "Other" && (
              <Grid item sx={{xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Specify Occupation"
                  {...register("otherOccupation", {
                    required: "please Specify Occupation is required",
                  })}
                  error={!!errors.otherOccupation}
                  helperText={errors.otherOccupation?.message}
                />
              </Grid>
            )} 
          </Grid>



          <Typography
            variant="h5"
            sx={{ marginBottom: "5px", marginTop: "20px" , fontWeight: "bold",color:"orange"}}
          >
            Preferences
          </Typography>

<Grid
          container
          spacing={2}
          sx={{
            display: "grid",
            gridTemplateColumns: { md: "repeat(4, 1fr)", xs: "1fr" },
            gap: 2,
          }}
        >{/* Category Field */}
<Grid sx={{ position: "relative" }}>
  <Stack direction="row" alignItems="center" spacing={1}>

  <TextField
    fullWidth
    label="Select Preferred Category"
    value={selectedCategory}
    onClick={() => setCategoryDropdownOpen(!isCategoryDropdownOpen)}
    InputProps={{
      readOnly: true,
    }}
    error={!!errors.category}
    helperText={errors.category?.message}
    {...register("category", {
      required: "Category is required",
    })}
  />

  {isCategoryDropdownOpen && (
    <Paper
      ref={dropdownRef}
      sx={{
        position: "absolute",
        bottom: "100%",
        left: 0,
        zIndex: 1300,
        mt: 1,
        width: "200%",
        display: "flex",
        boxShadow: 3,
        maxHeight: "260px",
        overflowY: "auto",
      }}
    >
      {/* Main Categories */}
      <Box sx={{ flex: 1, borderRight: "1px solid #eee" }}>
        <Typography
          sx={{
            p: 1,
            fontWeight: "bold",
            bgcolor: "grey.100",
            width: "100%",
          }}
        >
          Main Categories
        </Typography>
        <List>
          {categories.map((category, index) => (
            <ListItem
              key={index}
              button="true"
              onMouseEnter={() => setActiveCategory(index)}
              selected={activeCategory === index}
            >
              <ListItemText
                primary={category.name}
                sx={{
                  fontWeight:
                    activeCategory === index ? "bold" : "normal",
                  color:
                    activeCategory === index
                      ? "primary.main"
                      : "inherit",
                }}
              />
              {category.children && category.children.length > 0 && (
                <ChevronRightIcon
                  sx={{
                    color:
                      activeCategory === index
                        ? "primary.main"
                        : "inherit",
                  }}
                />
              )}
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Subcategories */}
      <Box
        sx={{
          flex: 1,
          borderRight: "1px solid #eee",
          width: "70%",
        }}
      >
        <Typography
          sx={{ p: 1, fontWeight: "bold", bgcolor: "grey.100" }}
        >
          Subcategories
        </Typography>
        {activeCategory !== null &&
          categories[activeCategory]?.children && (
            <List>
              {categories[activeCategory].children.map(
                (subCategory, subIndex) => (
                  <ListItem
                    key={subIndex}
                    button="true"
                    onMouseEnter={() =>
                      setActiveSubCategory(subCategory)
                    }
                    selected={
                      activeSubCategory?.name === subCategory.name
                    }
                  >
                    <ListItemText
                      primary={subCategory.name}
                      sx={{
                        fontWeight:
                          activeSubCategory?.name ===
                          subCategory.name
                            ? "bold"
                            : "normal",
                        color:
                          activeSubCategory?.name ===
                          subCategory.name
                            ? "primary.main"
                            : "inherit",
                      }}
                    />
                    {subCategory.children && subCategory.children.length > 0 && (
                      <ChevronRightIcon
                        sx={{
                          color:
                            activeSubCategory?.name ===
                            subCategory.name
                              ? "primary.main"
                              : "inherit",
                        }}
                      />
                    )}
                  </ListItem>
                )
              )}
            </List>
          )}
      </Box>

      {/* Sub-Child Categories */}
      <Box
        sx={{
          flex: 1,
          borderRight: "1px solid #eee",
          width: "70%",
        }}
      >
        <Typography
          sx={{ p: 1, fontWeight: "bold", bgcolor: "grey.100" }}
        >
          Items
        </Typography>
        {activeSubCategory?.children && (
          <List>
            {activeSubCategory.children.map((item, index) => (
              <ListItem
                key={index}
                button="true"
                onClick={() =>
                  handleCategorySelection(
                    categories[activeCategory]?.name,
                    activeSubCategory?.name,
                    item
                  )
                }
              >
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  )}
  <Tooltip title="Select your preferred category to invest">
                    <InfoIcon
                      color="primary"
                      sx={{ cursor: "pointer", mt: 1 }}
                    />
                  </Tooltip></Stack>
</Grid>

            {/* {preferred investment range field} */}
            <Grid sx={{  xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                defaultValue=""
                SelectProps={{ native: true }}
                {...register("investmentRange", {
                  required: "Preferred investment range is required",
                })}
                error={!!errors.investmentRange}
                helperText={errors.investmentRange?.message}
              >
                <option value="">Select Preferred Investment Range</option>
                <option value="having amount">
                  Having Investment Amount Ready
                </option>
                <option value="take loan">Planning to take a Loan</option>
                <option value="need loan">Need Loan Assistance</option>
              </TextField>
            </Grid>
            {selectedRange && (
              <Grid item sx={{  xs: 12, sm: 4 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TextField
                    select
                    fullWidth
                    defaultValue=""
                    SelectProps={{ native: true,  }}

                    {...register("investmentAmount", {
                      required: "Please select an amount range",
                    })}
                    error={!!errors.investmentAmount}
                    helperText={errors.investmentAmount?.message}
                  >
                    <option value="">Select preferred Investment Amount</option>
                    <option value="Below-50,000">Below - Rs.50 K</option>
                    <option value="Rs.50,000-2L">Rs.50 K - 2 L</option>
                    <option value="Rs.2L-5L">Rs.2 L - 5 L</option>
                    <option value="Rs.5L-10L">Rs.5 L - 10 L</option>
                    <option value="Rs.10L-20L">Rs.10 L - 20 L</option>
                    <option value="Rs.20L-30L">Rs.20 L - 30 L</option>
                    <option value="Rs.30L-50L">Rs.30 L - 50 L</option>
                    <option value="Rs.50L-1Cr">Rs.50 L - 1 Cr</option>
                    <option value="Rs.1Cr-2Cr">Rs.1 Cr - 2 Cr</option>
                    <option value="Rs.2Cr-5Cr">Rs.2 Cr - 5 Cr</option>
                    <option value="Rs.5Cr-above">Rs.5 Cr - Above</option>
                  </TextField>
                  <Tooltip title="Select your preferred investment range as per your budget.">
                    <InfoIcon
                      color="primary"
                      sx={{ cursor: "pointer", mt: 1 }}
                    />
                  </Tooltip>
                </Stack>
              </Grid>
            )}

          
{/* Preferred State Field (changed to text input) */}
                <Grid item xs={12} sm={6} >
                  <TextField
                    fullWidth
                    label="Preferred State "
                    {...register("preferredState", {
                      required: "Preferred state is required",
                    })}
                    error={!!errors.preferredState}
                    helperText={errors.preferredState?.message}
                  />
                </Grid>

                {/* Preferred City Field (changed to text input) */}
                <Grid item xs={12} sm={6} >
                  <TextField
                    fullWidth
                    label="Preferred City "
                    {...register("preferredCity", {
                      required: "Preferred city is required",
                    })}
                    error={!!errors.preferredCity}
                    helperText={errors.preferredCity?.message}
                  />
                </Grid>
{/* Property Type Field */}
          <Grid xs={12} sm={6} md={4}>
  <FormControl component="fieldset" fullWidth error={!!errors.propertyType}>
    <FormLabel component="legend">Property Type *</FormLabel>
    <Controller
      name="propertyType"
      control={control}
      rules={{ required: "Property type is required" }}
      render={({ field }) => (
        <RadioGroup
          row
          {...field}
          value={field.value || ""}
          onChange={(e) => {
            field.onChange(e.target.value);
            if (e.target.value !== "Own Property") {
              setValue("propertySize", "");
            }
          }}
        >
          <FormControlLabel
            value="Own Property"
            control={<Radio />}
            label="Own Property"
          />
          <FormControlLabel
            value="Rental Property"
            control={<Radio />}
            label="Rental Property"
          />
        </RadioGroup>
      )}
    />
    {errors.propertyType && (
      <Typography color="error" variant="caption">
        {errors.propertyType.message}
      </Typography>
    )}
  </FormControl>
</Grid>

{/* Property Size Field - Only show for Own Property */}
{watch("propertyType") === "Own Property" && (
  <Grid item xs={12} sm={6} md={4}>
    <TextField
      select
      fullWidth
      label="Property Size *"
      {...register("propertySize", {
        required: "Property size is required for own property"
      })}
      error={!!errors.propertySize}
      helperText={errors.propertySize?.message}
    >
      <MenuItem value="">Select Total Area</MenuItem>
      <MenuItem value="Below - 100 sq ft">Below - 100 sq ft</MenuItem>
      <MenuItem value="100 sq ft - 200 sq ft">100 sq ft - 200 sq ft</MenuItem>
      <MenuItem value="200 sq ft - 500 sq ft">200 sq ft - 500 sq ft</MenuItem>
      <MenuItem value="500 sq ft - 1000 sq ft">500 sq ft - 1000 sq ft</MenuItem>
      <MenuItem value="1000 sq ft - 1500 sq ft">1000 sq ft - 1500 sq ft</MenuItem>
      <MenuItem value="1500 sq ft - 2000 sq ft">1500 sq ft - 2000 sq ft</MenuItem>
      <MenuItem value="2000 sq ft - 3000 sq ft">2000 sq ft - 3000 sq ft</MenuItem>
      <MenuItem value="3000 sq ft - 5000 sq ft">3000 sq ft - 5000 sq ft</MenuItem>
      <MenuItem value="5000 sq ft - 7000 sq ft">5000 sq ft - 7000 sq ft</MenuItem>
      <MenuItem value="7000 sq ft - 10000 sq ft">7000 sq ft - 10000 sq ft</MenuItem>
      <MenuItem value="Above 10000 sq ft">Above 10000 sq ft</MenuItem>
    </TextField>
  </Grid>
)}

            {/* Terms and Conditions */}
            <Grid sx={{  xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox {...register("terms", { required: true })} />
                }
label={
          <Typography variant="body2">
            I agree to the{" "}
            <Link
              component={RouterLink}
              to="/termscondition"
             
            >
              terms and conditions
            </Link>
          </Typography>
        }              />
              {errors.terms && (
                <Typography color="error" variant="body2">
                  You must accept the terms
                </Typography>
              )}
            </Grid>

            {/* Submit Button */}
            <Grid component="span"
      onClick={openLoginPopup}
      // sx={{
      //   textDecoration: "none",
      //   cursor: "pointer",
      //   color: "primary.main",
      //   "&:hover": {
      //     color: "primary.dark",
      //   },
      // }}
              sx={{
                width: "70%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginLeft: "15%",
                xs: 12,
              }}
            >
              <Button fullWidth type="submit" size="large" variant="contained">
                REGISTER
              </Button>
            </Grid>

            <Grid sx={{  xs: 12 }}>
  <Typography textAlign="center">
    Already have an account?{" "}
    <Box
      component="span"
      onClick={openLoginPopup}
      sx={{
        textDecoration: "none",
        cursor: "pointer",
        color: "primary.main",
        "&:hover": {
          color: "primary.dark",
        },
      }}
    >
      Sign In
    </Box>
  </Typography>
</Grid>

          </Grid>
        </form>
      </Paper>
{/* Login Popup Dialog */}
      <Dialog open={loginOpen} onClose={closeLoginPopup} maxWidth="sm" fullWidth>
        <LoginPage open={loginOpen} onClose={closeLoginPopup} />
      </Dialog>
      {/* OTP Verification Modal */}
      <Dialog open={otpModal.open} onClose={closeOtpModal}>
        <DialogTitle>
          Verify{" "}
          {otpModal.type === "email"
            ? "Email"
            : otpModal.type === "mobile"
            ? "Mobile Number"
            : "WhatsApp Number"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Enter OTP"
            type="text"
            fullWidth
            variant="standard"
            value={otpModal.otp}
            onChange={(e) => {
              // Only allow numbers and limit length
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setOtpModal((prev) => ({ ...prev, otp: value }));
            }}
            disabled={otpModal.verified}
            InputProps={{
              endAdornment: otpModal.verified && (
                <InputAdornment position="end">
                  <Typography color="success.main">Verified</Typography>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeOtpModal}>Cancel</Button>
          <Button
            onClick={verifyOtp}
            disabled={otpModal.verified || otpModal.loading}
            color="primary"
            variant="contained"
          >
            {otpModal.loading ? (
              <CircularProgress size={24} />
            ) : otpModal.verified ? (
              "Verified"
            ) : (
              "Verify"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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
    </Container></Box>
  );
};

export default InvestorRegister;
