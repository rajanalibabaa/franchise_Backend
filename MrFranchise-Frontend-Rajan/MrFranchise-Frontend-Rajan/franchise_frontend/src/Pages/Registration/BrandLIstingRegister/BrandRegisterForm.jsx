import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
  StepConnector,
  stepConnectorClasses,
  styled,
  Toolbar,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Paper,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,

} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import BrandDetails from "./BrandDetails";
import FranchiseDetails from "./FranchiseDetails";
import Uploads from "../BrandLIstingRegister/BrandRegisterUploads";
import{ validateBrandDetails,validateFranchiseDetails } from "./BrandRegisterValidation";
import axios from "axios";

const FORM_DATA_KEY = "brandRegistrationFormData";
const FORM_STEP_KEY = "brandRegistrationActiveStep";

const steps = ["Brand Details", "Franchise Details", "Uploads"];

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        "linear-gradient( 95deg,rgb(255,128,0) 0%,rgb(255,165,0) 50%,rgb(255,200,0) 100%)",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        "linear-gradient( 95deg,rgb(255,128,0) 0%,rgb(255,165,0) 50%,rgb(255,200,0) 100%)",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor:
      theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled("div")(({ theme, ownerState }) => ({
  backgroundColor:
    theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
  zIndex: 1,
  color: "#fff",
  width: 35,
  height: 35,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  ...(ownerState.active && {
    backgroundImage:
      "linear-gradient( 136deg, rgb(255,128,0) 0%, rgb(255,165,0) 50%, rgb(255,200,0) 100%)",
    boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
  }),
  ...(ownerState.completed && {
    backgroundImage:
      "linear-gradient( 136deg, rgb(255,128,0) 0%, rgb(255,165,0) 50%, rgb(255,200,0) 100%)",
  }),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className } = props;

  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    >
      {props.icon}
    </ColorlibStepIconRoot>
  );
}

const countries = [
  { code: "IN", name: "India" },
  { code: "US", name: "USA" },
  { code: "GB", name: "UK" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
];

const initialFormData = {
  brandDetails: {
    fullName: "",
    brandName: "",
    companyName: "",
    email: "",
    mobileNumber: "",
    country: "IN",
    whatsappNumber: "",
    headOfficeAddress: "",
    state: "",
    city: "",
    pincode: "",
    establishedYear: "",
    franchiseSinceYear: "",
    brandCategories: [],
    brandDescription: "",
    expansionLocation: [],
    website: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    gstNumber: "",
    pancardNumber: "",
  },
  franchiseDetails: {
    fico: [],
    companyOwnedOutlets: "",
    franchiseOutlets: "",
    totalOutlets: "",
    requirementSupport: "",
    trainingProvidedBy: "",
    agreementPeriod: "",
  },
  uploads: {
    franchisePromotionVideo: [],
    brandPromotionVideo: [],
    pancard: [],
    gstCertificate: [],
    brandLogo: [],
    exteriorOutlet: [],
    interiorOutlet: [],
  },
};

const BrandRegisterForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem(FORM_DATA_KEY);
    return savedData ? JSON.parse(savedData) : initialFormData;
  });


  // console.log("Form Data:", formData);  

  const [validationErrors, setValidationErrors] = useState({
    brandDetails: {},
    franchiseDetails: {},
    uploads: {},
  });

  const [activeStep, setActiveStep] = useState(() => {
    const savedStep = localStorage.getItem(FORM_STEP_KEY);
    return savedStep ? parseInt(savedStep) : 0;
  });

  const [openPreview, setOpenPreview] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  useEffect(() => {
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
    localStorage.setItem(FORM_STEP_KEY, activeStep.toString());
  }, [formData, activeStep]);




  const validateUploadsDetails = (data) => {
    const errors = {};
    if (data.brandLogo.length === 0)
      errors.brandLogo = "Brand logo is required";
    if (data.pancard.length === 0) errors.pancard = "PAN card is required";
    if (data.gstCertificate.length === 0)
      errors.gstCertificate = "GST certificate is required";
    return errors;
  };

  const validateStep = useCallback(
    (step) => {
      const errors = {};
      let isValid = true;

      switch (step) {
        case 0:
          errors.brandDetails = validateBrandDetails(
            formData.brandDetails || {}
          );
          isValid = Object.keys(errors.brandDetails).length === 0;
          break;
        case 1:
          errors.franchiseDetails = validateFranchiseDetails(
            formData.franchiseDetails || {}
          );
          isValid = Object.keys(errors.franchiseDetails).length === 0;
          break;
        case 2:
          errors.uploads = validateUploadsDetails(formData.uploads || {});
          isValid = Object.keys(errors.uploads).length === 0;
          break;
        default:
          break;
      }

      setValidationErrors(errors);

      if (!isValid) {
        setSnackbar({
          open: true,
          message: "Please fill all required fields correctly",
          severity: "error",
        });
      }

      return isValid;
    },
    [formData]
  );

  const handleNext = () => {
    const isValid = validateStep(activeStep);
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    const isValid = validateStep(activeStep);
    
    if (isValid) {
      try {
        // Your submit logic here
        //form data to submit 
        const formDataSend = new FormData();

        formDataSend.append('personalDetails', JSON.stringify({
          fullName: formData.brandDetails.fullName,
          email: formData.brandDetails.email,
          mobileNumber: formData.brandDetails.mobileNumber,
          brandName: formData.brandDetails.brandName,
          companyName: formData.brandDetails.companyName,
          country: countries.find(c => c.code === formData.brandDetails.country)?.name || formData.brandDetails.country,
          pincode: formData.brandDetails.pincode,
          headOfficeAddress: formData.brandDetails.headOfficeAddress,
          state: formData.brandDetails.state,
          city: formData.brandDetails.city,
          establishedYear: formData.brandDetails.establishedYear,
          franchiseSinceYear: formData.brandDetails.franchiseSinceYear,
          brandCategories: formData.brandDetails.brandCategories,
          brandDescription: formData.brandDetails.brandDescription,
          expansionLocation: formData.brandDetails.expansionLocation,
          pancardNumber: formData.brandDetails.pancardNumber,
          gstNumber: formData.brandDetails.gstNumber,
          website: formData.brandDetails.website,
          facebook: formData.brandDetails.facebook,
          instagram: formData.brandDetails.instagram,
          linkedin: formData.brandDetails.linkedin,   
             }));
             formDataSend.append('franchiseDetails', JSON.stringify({
               modelsOfFranchise: formData.franchiseDetails.fico,
          companyOwnedOutlets: formData.franchiseDetails.companyOwnedOutlets,
          franchiseOutlets: formData.franchiseDetails.franchiseOutlets,
          totalOutlets: formData.franchiseDetails.totalOutlets,
          requirementSupport: formData.franchiseDetails.requirementSupport,
          trainingProvidedBy: formData.franchiseDetails.trainingProvidedBy,
          agreementPeriod: formData.franchiseDetails.agreementPeriod,

             }))
             formDataSend.append('brandDetails', JSON.stringify({
               
             }))
              // Add files to formData
      const fileFields = {
        brandLogo: formData.uploads.brandLogo,
        gstCertificate: formData.uploads.gstCertificate,
        pancard: formData.uploads.pancard,
        exteriorOutlet: formData.uploads.exteriorOutlet,
        interiorOutlet: formData.uploads.interiorOutlet,
        franchisePromotionVideo: formData.uploads.franchisePromotionVideo,
        brandPromotionVideo: formData.uploads.brandPromotionVideo
      };
      Object.entries(fileFields).forEach(([fieldName, files]) => {
        if (files && files.length > 0) {
          files.forEach(file => {
            formDataSend.append(fieldName, file);
          });
        }
      });
      //   const apiData = {
      //   personalDetails: {
      //     fullName: formData.brandDetails.fullName,
      //     email: formData.brandDetails.email,
      //     mobileNumber: formData.brandDetails.mobileNumber,
      //     brandName: formData.brandDetails.brandName,
      //     companyName: formData.brandDetails.companyName,
      //     country: countries.find(c => c.code === formData.brandDetails.country)?.name || formData.brandDetails.country,
      //     pincode: formData.brandDetails.pincode,
      //     headOfficeAddress: formData.brandDetails.headOfficeAddress,
      //     state: formData.brandDetails.state,
      //     city: formData.brandDetails.city,
      //     establishedYear: formData.brandDetails.establishedYear,
      //     franchiseSinceYear: formData.brandDetails.franchiseSinceYear,
      //     brandCategories: formData.brandDetails.brandCategories,
      //     brandDescription: formData.brandDetails.brandDescription,
      //     expansionLocation: formData.brandDetails.expansionLocation,
      //     pancardNumber: formData.brandDetails.pancardNumber,
      //     gstNumber: formData.brandDetails.gstNumber,
      //     website: formData.brandDetails.website,
      //     facebook: formData.brandDetails.facebook,
      //     instagram: formData.brandDetails.instagram,
      //     linkedin: formData.brandDetails.linkedin,
      //   },
      //   franchiseDetails: {
      //             },
      //   brandDetails: {
      //     pancard: formData.uploads.pancard,
      //     gstCertificate: formData.uploads.gstCertificate,
      //     brandLogo: formData.uploads.brandLogo,
      //     exterioroutlet: formData.uploads.exteriorOutlet,
      //     interiorOutlet: formData.uploads.interiorOutlet,
      //     franchisePromotionVideo: formData.uploads.franchisePromotionVideo,
      //     brandPromotionVideo: formData.uploads.brandPromotionVideo,
      //   }
      // };



        const response = await axios.post('http://localhost:5000/api/v1/brandlisting/createBrandListing', formDataSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
        );

        console.log(response.data);

      // if (response.status !== 200 && response.status !== 201) {
      //   throw new Error(response.data.message || "Submission failed");
      // }
        setSnackbar({
          open: true,
          message: "Form submitted successfully!",
          severity: "success",
        });

        // Reset form after successful submission
        localStorage.removeItem(FORM_DATA_KEY);
        localStorage.removeItem(FORM_STEP_KEY);
        setFormData(initialFormData);
        setActiveStep(0);
      } catch (error) {     
        console.log('submission error',error);
           
        setSnackbar({
          open: true,
          message: "Submission failed. Please try again.",
          severity: "error",
        });
      }
    }
  };

  const handleCountryChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      brandDetails: {
        ...prev.brandDetails,
        country: event.target.value,
      },
    }));
  };

  const handleBrandDetailsChange = (update) => {
    setFormData((prev) => ({
      ...prev,
      brandDetails: {
        ...prev.brandDetails,
        ...update,
      },
    }));
  };

  const handleFranchiseDetailsChange = (updatedData) => {
    setFormData((prev) => ({
      ...prev,
      franchiseDetails: {
        ...prev.franchiseDetails,
        ...updatedData,
      },
    }));
  };

  const handleUploadsChange = (updatedData) => {
    setFormData((prev) => ({
      ...prev,
      uploads: {
        ...prev.uploads,
        ...updatedData,
      },
    }));
  };

  const handleGstNumberChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      brandDetails: {
        ...prev.brandDetails,
        gstNumber: value,
      },
    }));
  };

  const handlePancardNumberChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      brandDetails: {
        ...prev.brandDetails,
        pancardNumber: value,
      },
    }));
  };

  const handlePreviewOpen = () => {
    setOpenPreview(true);
  };

  const handlePreviewClose = () => {
    setOpenPreview(false);
  };

  const handleCancel = () => {
    // Show confirmation dialog
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel? All form data will be lost."
    );

    if (confirmCancel) {
      // Clear local storage
      localStorage.removeItem(FORM_DATA_KEY);
      localStorage.removeItem(FORM_STEP_KEY);

      // Reset form
      setFormData(initialFormData);
      setActiveStep(0);
      setValidationErrors({
        brandDetails: {},
        franchiseDetails: {},
        uploads: {},
      });

      // Show success message
      setSnackbar({
        open: true,
        message: "Form has been cleared",
        severity: "info",
      });

      // Navigate to home page after a short delay
      setTimeout(() => {
        navigate("/"); // Replace "/" with your actual home route
      }, 1000);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <BrandDetails
            data={formData.brandDetails}
            errors={validationErrors.brandDetails}
            onChange={handleBrandDetailsChange}
          />
        );
      case 1:
        return (
          <FranchiseDetails
            data={formData.franchiseDetails}
            errors={validationErrors.franchiseDetails}
            onChange={handleFranchiseDetailsChange}
          />
        );
      case 2:
        return (
          <Uploads
            data={formData.uploads}
            errors={validationErrors.uploads}
            onChange={handleUploadsChange}
            gstNumber={formData.brandDetails.gstNumber}
            pancardNumber={formData.brandDetails.pancardNumber}
            onGstNumberChange={handleGstNumberChange}
            onPancardNumberChange={handlePancardNumberChange}
          />
        );
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  const handleRemoveCategory = (index) => {
    const updatedCategories = [...formData.brandDetails.brandCategories];
    updatedCategories.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      brandDetails: {
        ...prev.brandDetails,
        brandCategories: updatedCategories,
      },
    }));
  };

  const handleRemoveExpansionLocation = (index) => {
    const updatedLocations = [...formData.brandDetails.expansionLocation];
    updatedLocations.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      brandDetails: {
        ...prev.brandDetails,
        expansionLocation: updatedLocations,
      },
    }));
  };

  const handleRemoveFicoModel = (index) => {
    const updatedFico = [...formData.franchiseDetails.fico];
    updatedFico.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      franchiseDetails: {
        ...prev.franchiseDetails,
        fico: updatedFico,
      },
    }));
  };

  const renderSelectedCategories = () => {
    if (!formData.brandDetails.brandCategories?.length) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Accordion elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Selected Categories (
              {formData.brandDetails.brandCategories.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              {formData.brandDetails.brandCategories.map((category, index) => (
                <Grid item key={index}>
                  <Chip
                    label={`${category.main} > ${category.sub} > ${category.child}`}
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                    onDelete={() => handleRemoveCategory(index)}
                    deleteIcon={<CloseIcon />}
                  />
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  };

  const renderExpansionLocations = () => {
    if (!formData.brandDetails.expansionLocation?.length) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Accordion elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Expansion Locations (
              {formData.brandDetails.expansionLocation.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              {formData.brandDetails.expansionLocation.map(
                (location, index) => (
                  <Grid item key={index}>
                    <Chip
                      label={`${location.city}, ${location.state}, ${location.country}`}
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                      onDelete={() => handleRemoveExpansionLocation(index)}
                      deleteIcon={<CloseIcon />}
                    />
                  </Grid>
                )
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  };

  const renderFicoModels = () => {
  if (!formData.franchiseDetails.fico?.length) return null;

  // Define the order of fields you want to display
  const fieldOrder = [
    'franchiseModel',
    'franchiseType',
    'investmentRange',
    'areaRequired',
    'franchiseFee',
    'royaltyFee',
    'interiorCost',
    'exteriorCost',
    'otherCost',
    'roi',
    'roiPeriod',
    'breakEven',
    'requireInvestmentCapital',
    'propertyType'
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Accordion elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            FICO Models ({formData.franchiseDetails.fico.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {formData.franchiseDetails.fico.map((model, index) => (
              <Grid item xs={12} key={index}>
                <Paper
                  sx={{
                    p: 2,
                    position: "relative",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <IconButton
                    sx={{ position: "absolute", top: 8, right: 8 }}
                    onClick={() => handleRemoveFicoModel(index)}
                  >
                    <CloseIcon />
                  </IconButton>
                  <Grid container spacing={1}>
                    {fieldOrder.map((field) => (
                      <Grid item xs={12} sm={6} key={field}>
                        <Typography variant="body2">
                          <strong>{formatFieldName(field)}:</strong>{" "}
                          {model[field] || "Not specified"}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

  const formatFieldName = (name) => {
    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/Gst/i, "GST")
      .replace(/Pancard/i, "PAN Card");
  };

  const formatFieldValue = (value) => {
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(", ") : "None";
    }
    return value || "Not provided";
  };
 const renderPreviewContent = () => {
  // Add null checks for all form data sections
  const brandDetails = formData.brandDetails || {};
  const franchiseDetails = formData.franchiseDetails || {};
  const uploads = formData.uploads || {};

  // Helper function to render file previews
  const renderFilePreviews = (files) => {
if (!files || !Array.isArray(files) || files.length === 0) return "No files uploaded";

    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>
        {files.map((file, index) => {
          // Handle both string URLs and File objects
          let url =
            typeof file === "string"
              ? file
              : file instanceof File
              ? URL.createObjectURL(file)
              : "";

          // Determine file type
          const isImage =
            typeof file === "string"
              ? file.match(/\.(jpeg|jpg|gif|png)$/i)
              : file.type?.includes("image");
          const isVideo =
            typeof file === "string"
              ? file.match(/\.(mp4|mov|avi)$/i)
              : file.type?.includes("video");
          const fileName =
            typeof file === "string" ? file.split("/").pop() : file.name;

          return (
            <Box key={index} sx={{ width: 150 }}>
              {isImage ? (
                <img
                  src={url}
                  alt={`Preview ${index}`}
                  style={{ width: "100%", height: "auto", borderRadius: 4 }}
                />
              ) : isVideo ? (
                <video controls style={{ width: "100%", borderRadius: 4 }}>
                  <source src={url} type={file.type || "video/mp4"} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <Paper sx={{ p: 1, textAlign: "center" }}>
                  <Typography variant="caption">{fileName}</Typography>
                </Paper>
              )}
              <Typography
                variant="caption"
                noWrap
                sx={{ display: "block", mt: 0.5 }}
              >
                {fileName}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  };

  // Helper function to render brand categories
  const renderBrandCategories = (categories) => {
    if (!categories || categories.length === 0) return "No categories selected";

    return (
      <Box>
        {categories.map((category, index) => (
          <Box
            key={index}
            sx={{
              mb: 1,
              p: 1,
              border: "1px solid #e0e0e0",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2">
              <strong>Main Category:</strong> {category.main || "Not specified"}
            </Typography>
            <Typography variant="body2">
              <strong>Sub Category:</strong> {category.sub || "Not specified"}
            </Typography>
            <Typography variant="body2">
              <strong>Child Category:</strong> {category.child || "Not specified"}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  // Helper function to render expansion locations
  const renderExpansionLocations = (locations) => {
    if (!locations || locations.length === 0) return "No locations added";

    return (
      <Box>
        {locations.map((location, index) => (
          <Box
            key={index}
            sx={{
              mb: 1,
              p: 1,
              border: "1px solid #e0e0e0",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2">
              <strong>Country:</strong> {location.country || "Not specified"}
            </Typography>
            <Typography variant="body2">
              <strong>State:</strong> {location.state || "Not specified"}
            </Typography>
            <Typography variant="body2">
              <strong>District:</strong> {location.district || "Not specified"}
            </Typography>
            <Typography variant="body2">
              <strong>City:</strong> {location.city || "Not specified"}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  // Helper function to render FICO models with all details
 const renderFicoModels = (ficoModels) => {
  if (!ficoModels || ficoModels.length === 0) return "No FICO models added";

  return (
    <Box>
      {ficoModels.map((model, index) => {
        // Filter out empty/null/undefined fields
        const modelFields = Object.entries(model).filter(
          ([, value]) => value !== "" && value !== null && value !== undefined
        );

        if (modelFields.length === 0) {
          return (
            <Box
              key={index}
              sx={{
                mb: 2,
                p: 2,
                border: "1px solid #e0e0e0",
                borderRadius: 1,
              }}
            >
              <Typography variant="body2">Model {index + 1} (No details provided)</Typography>
            </Box>
          );
        }

        return (
          <Box
            key={index}
            sx={{
              mb: 2,
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 1,
            }}
          >
            
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Model {index + 1}
            </Typography>
            
            <Grid container spacing={1}>
              {modelFields.map(([key, value]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Typography variant="body2">
                    <strong>{formatFieldName(key)}:</strong> {value}
                  
                  </Typography>
                </Grid>
              ))}
            </Grid>

       

          </Box>
        );
      })}
    </Box>
  );
};

  return (
    <Box sx={{ mt: 2 }}>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Typography
          variant="subtitle1"
          sx={{ p: 2, fontWeight: "bold", backgroundColor: "#f5f5f5" }}
        >
          Brand Details
        </Typography>
        <Table size="small">
          <TableBody>
            {Object.entries(brandDetails).map(([key, value]) => {
              // Skip brandCategories and expansionLocation as we'll render them separately
              if (key === "brandCategories" || key === "expansionLocation") {
                return null;
              }
              return (
                <TableRow key={key}>
                  <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                    {formatFieldName(key)}
                  </TableCell>
                  <TableCell>{formatFieldValue(value)}</TableCell>
                </TableRow>
              );
            })}
            
            {/* Brand Categories row */}
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                Brand Categories
              </TableCell>
              <TableCell>
                {renderBrandCategories(brandDetails.brandCategories)}
              </TableCell>
            </TableRow>
            
            {/* Expansion Locations row */}
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                Expansion Locations
              </TableCell>
              <TableCell>
                {renderExpansionLocations(brandDetails.expansionLocation)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Typography
          variant="subtitle1"
          sx={{ p: 2, fontWeight: "bold", backgroundColor: "#f5f5f5" }}
        >
          Franchise Details
        </Typography>
        <Table size="small">
          <TableBody>
            {Object.entries(franchiseDetails).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                  {formatFieldName(key)}
                </TableCell>
                <TableCell>
                  {key === "fico" ?   (
                    renderFicoModels(value)
                  ) : (
                    formatFieldValue(value)
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer component={Paper}>
        <Typography
          variant="subtitle1"
          sx={{ p: 2, fontWeight: "bold", backgroundColor: "#f5f5f5" }}
        >
          Uploads
        </Typography>
        <Table size="small">
          <TableBody>
            {Object.entries(uploads).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                  {formatFieldName(key)}
                </TableCell>
                <TableCell>
                  {value.length > 0 ? (
                    <>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {value.length} file(s) uploaded
                      </Typography>
                      {renderFilePreviews(value)}
                    </>
                  ) : (
                    "No files uploaded"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          p: 2,
        }}
      >
        <Box >
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            connector={<ColorlibConnector />}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel StepIconComponent={ColorlibStepIcon}>
                  {label}
                </StepLabel>
              </Step>
            ))}
            <Toolbar sx={{ justifyContent: "flex-end" }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={formData.brandDetails.country}
                  onChange={handleCountryChange}
                  displayEmpty
                  inputProps={{ "aria-label": "Select country" }}
                >
                  {countries.map((country) => (
                    <MenuItem key={country.code} value={country.code}>
                      {country.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Toolbar>
          </Stepper>
          <Box sx={{ display: "flex", flexDirection: "row", mb: 1, gap: 2 }}>
            <Box width="30%"> {activeStep >= 0 && renderSelectedCategories()}</Box>
            <Box width="25%"> {activeStep >= 0 && renderExpansionLocations()}</Box>
            <Box width="45%"> {activeStep >= 1 && renderFicoModels()}</Box>
          </Box>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            mb: 0,
            pl: 1,
            overflow: "auto",
          }}
        >
          <Box sx={{ p: 2}}>
          {getStepContent(activeStep)}
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            pt: 2,
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            Back
          </Button>

          <Button variant="outlined" onClick={handlePreviewOpen} sx={{ mr: 2 }}>
            Preview
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={handleCancel}
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button variant="contained" onClick={handleSubmit}>
              Submit
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Box>

      {/* Preview Dialog */}
      <Dialog
        open={openPreview}
        onClose={handlePreviewClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ borderBottom: "1px solid #e0e0e0" }}>
          Form Data Preview
        </DialogTitle>
        <DialogContent dividers>{renderPreviewContent()}</DialogContent>
        <DialogActions sx={{ borderTop: "1px solid #e0e0e0" }}>
          <Button onClick={handlePreviewClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BrandRegisterForm;

