import {
  Grid,
  Typography,
  Button,
  Box,
  Divider,
  Paper,
  styled,
  InputLabel,
  FormControl,
  FormHelperText,
  CircularProgress,
  Avatar,
  Chip,
  Stack,
  Alert,
  TextField,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
}));

const ScrollableContent = styled("div")(({ theme }) => ({
  overflowY: "auto",
  flexGrow: 1,
  paddingRight: theme.spacing(1),
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: "3px",
  },
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
  fontWeight: 600,
}));

const ErrorContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(4),
  color: theme.palette.error.main,
  textAlign: "center",
}));

const FileUploadCard = styled(Box)(({ theme }) => ({
  border: `1px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  textAlign: "center",
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
}));

const PreviewImage = styled("img")({
  width: "100px",
  height: "100px",
  objectFit: "cover",
  borderRadius: "4px",
  border: "1px solid #e0e0e0",
});

const FilePreviewContainer = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  marginTop: "16px",
});

const Uploads = ({
  data = {},
  errors = {},
  onChange,
  gstNumber,
  pancardNumber,
  onGstNumberChange,
  onPancardNumberChange,
}) => {
  const safeData = data || {};
  const safeOnChange = onChange || (() => {});

  const handleFileChange =
    (field, options = {}) =>
    (e) => {
      const { maxFiles = Infinity, allowedTypes = [], maxSize = 5 } = options;
      const files = Array.from(e.target.files);

      // Validate file types
      const validFiles = files.filter((file) => {
        if (allowedTypes.length === 0) return true;
        return allowedTypes.some((type) => file.type.includes(type));
      });

      // Validate file size (in MB)
      const sizeValidFiles = validFiles.filter(
        (file) => file.size <= maxSize * 1024 * 1024
      );

      if (sizeValidFiles.length < validFiles.length) {
        alert(`Some files exceed the maximum size of ${maxSize}MB`);
      }

      // Validate number of files
      const currentFiles = safeData[field] || [];
      const totalFiles = currentFiles.length + sizeValidFiles.length;

      if (totalFiles > maxFiles) {
        alert(`Maximum ${maxFiles} file(s) allowed for this field`);
        return;
      }

      const updatedFiles = [...currentFiles, ...sizeValidFiles];
      safeOnChange({ [field]: updatedFiles });
    };

  const handleRemoveFile = (field, index) => {
    const updatedFiles = [...safeData[field]];
    updatedFiles.splice(index, 1);
    safeOnChange({ [field]: updatedFiles });
  };

  const createObjectURL = (file) => {
    if (!file) return "";
    try {
      return URL.createObjectURL(file);
    } catch (error) {
      console.error("Error creating object URL:", error);
      return "";
    }
  };
  if (!data) {
    return (
      <StyledPaper elevation={2}>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </StyledPaper>
    );
  }

  if (data.error) {
    return (
      <StyledPaper elevation={2}>
        <ErrorContainer>
          <ErrorOutlineIcon fontSize="large" />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Failed to load brand details
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {data.error.message || "Unknown error occurred"}
          </Typography>
        </ErrorContainer>
      </StyledPaper>
    );
  }

  return (
    <StyledPaper elevation={2}>
      <ScrollableContent>
        <SectionHeader variant="h5">Brand Documentation</SectionHeader>

        <Alert severity="info" sx={{ mb: 3 }}>
          Please upload all required documents to complete your brand
          registration.
        </Alert>

        {/* Brand Logo - Single Image */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.brandLogo}>
              <InputLabel shrink>Brand Logo *</InputLabel>
              <FileUploadCard>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Accepted formats: JPG, PNG (Max 2MB)
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Upload Logo
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange("brandLogo", {
                      maxFiles: 1,
                      allowedTypes: ["image/jpeg", "image/png"],
                      maxSize: 2,
                    })}
                  />
                </Button>
                {safeData.brandLogo?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      {safeData.brandLogo.map(
                        (file, index) =>
                          file && (
                            <Box key={index} position="relative">
                              <Avatar
                                src={createObjectURL(file)}
                                sx={{ width: 60, height: 60 }}
                                variant="rounded"
                              />
                              <Button
                                size="small"
                                onClick={() =>
                                  handleRemoveFile("brandLogo", index)
                                }
                                sx={{
                                  position: "absolute",
                                  top: -10,
                                  right: -10,
                                  minWidth: "auto",
                                  padding: "4px",
                                  backgroundColor: "error.main",
                                  color: "white",
                                  "&:hover": {
                                    backgroundColor: "error.dark",
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </Button>
                              <Box
                                sx={{
                                  position: "absolute",
                                  bottom: -5,
                                  right: -5,
                                  backgroundColor: "success.main",
                                  borderRadius: "50%",
                                  padding: "2px",
                                  color: "white",
                                }}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </Box>
                            </Box>
                          )
                      )}
                    </Stack>
                  </Box>
                )}
              </FileUploadCard>
              {errors.brandLogo && (
                <FormHelperText error>{errors.brandLogo}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Videos */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel shrink>
                Brand Promotion Videos
              </InputLabel>
              <FileUploadCard>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Accepted formats: MP4, MOV (Max 50MB each)
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Upload Videos
                  <VisuallyHiddenInput
                    type="file"
                    accept="video/mp4,video/quicktime"
                    multiple
                    onChange={handleFileChange("brandPromotionVideo", {
                      maxFiles: 1,
                      allowedTypes: ["video/mp4", "video/quicktime"],
                      maxSize: 50,
                    })}
                  />
                </Button>
                {safeData.brandPromotionVideo?.length > 0 && (
                  <>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {safeData.brandPromotionVideo.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() =>
                            handleRemoveFile("brandPromotionVideo", index)
                          }
                          deleteIcon={<DeleteIcon />}
                          sx={{ m: 0.5 }}
                          color={
                            safeData.brandPromotionVideo.length >= 2
                              ? "success"
                              : "default"
                          }
                        />
                      ))}
                    </Stack>
                    <Typography
                      variant="caption"
                      color={
                        safeData.brandPromotionVideo.length < 2
                          ? "error"
                          : "textSecondary"
                      }
                    >
                      {safeData.brandPromotionVideo.length < 2 ? (
                        <Box display="flex" alignItems="center">
                          <WarningIcon
                            color="error"
                            fontSize="small"
                            sx={{ mr: 0.5 }}
                          />
                          Minimum 2 videos required (currently{" "}
                          {safeData.brandPromotionVideo.length})
                        </Box>
                      ) : (
                        `${safeData.brandPromotionVideo.length} videos uploaded`
                      )}
                    </Typography>
                  </>
                )}
              </FileUploadCard>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel shrink>
                Franchise Promotion Videos 
              </InputLabel>
              <FileUploadCard>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Accepted formats: MP4, MOV (Max 50MB each)
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Upload Videos
                  <VisuallyHiddenInput
                    type="file"
                    accept="video/mp4,video/quicktime"
                    multiple
                    onChange={handleFileChange("franchisePromotionVideo", {
                      maxFiles: 1,
                      allowedTypes: ["video/mp4", "video/quicktime"],
                      maxSize: 50,
                    })}
                  />
                </Button>
                {safeData.franchisePromotionVideo?.length > 0 && (
                  <>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {safeData.franchisePromotionVideo.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() =>
                            handleRemoveFile("franchisePromotionVideo", index)
                          }
                          deleteIcon={<DeleteIcon />}
                          sx={{ m: 0.5 }}
                          color={
                            safeData.franchisePromotionVideo.length >= 2
                              ? "success"
                              : "default"
                          }
                        />
                      ))}
                    </Stack>
                    <Typography
                      variant="caption"
                      color={
                        safeData.franchisePromotionVideo.length < 2
                          ? "error"
                          : "textSecondary"
                      }
                    >
                      {safeData.franchisePromotionVideo.length < 2 ? (
                        <Box display="flex" alignItems="center">
                          <WarningIcon
                            color="error"
                            fontSize="small"
                            sx={{ mr: 0.5 }}
                          />
                          Minimum 2 videos required (currently{" "}
                          {safeData.franchisePromotionVideo.length})
                        </Box>
                      ) : (
                        `${safeData.franchisePromotionVideo.length} videos uploaded`
                      )}
                    </Typography>
                  </>
                )}
              </FileUploadCard>
            </FormControl>
          </Grid>

          {/* PAN Card - PDF or Image */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <TextField
                label="PAN Number *"
                fullWidth
                value={pancardNumber || ""}
                onChange={(e) =>
                  onPancardNumberChange(e.target.value.toUpperCase())
                }
                error={!!errors.pancardNumber}
                helperText={errors.pancardNumber}
                inputProps={{
                  maxLength: 10,
                  pattern: "[A-Z]{5}[0-9]{4}[A-Z]{1}",
                  title: "PAN must be in format: AAAAA9999A",
                }}
                sx={{ mb: 2 }}
              />
            </Box>
            <FormControl fullWidth error={!!errors.pancard}>
              <InputLabel shrink>PAN Card *</InputLabel>
              <FileUploadCard>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Accepted formats: PDF, JPG, PNG (Max 5MB)
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Upload PAN
                  <VisuallyHiddenInput
                    type="file"
                    accept=".pdf,image/jpeg,image/png"
                    onChange={handleFileChange("pancard", {
                      maxFiles: 1,
                      allowedTypes: [
                        "application/pdf",
                        "image/jpeg",
                        "image/png",
                      ],
                      maxSize: 5,
                    })}
                  />
                </Button>
                {safeData.pancard?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {safeData.pancard.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() => handleRemoveFile("pancard", index)}
                          deleteIcon={<DeleteIcon />}
                          sx={{ m: 0.5 }}
                          color="success"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </FileUploadCard>
            </FormControl>
          </Grid>

          {/* GST Certificate Section with Text Field */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <TextField
                label="GST Number *"
                fullWidth
                value={gstNumber || ""}
                onChange={(e) => onGstNumberChange(e.target.value)}
                error={!!errors.gstNumber}
                helperText={errors.gstNumber}
                inputProps={{
                  maxLength: 15,
                  pattern:
                    "[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}",
                  title: "GST must be in format: 22AAAAA0000A1Z5",
                }}
                sx={{ mb: 2 }}
              />
            </Box>
            <FormControl fullWidth error={!!errors.gstCertificate}>
              <InputLabel shrink>GST Certificate *</InputLabel>
              <FileUploadCard>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Accepted formats: PDF, JPG, PNG (Max 5MB)
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Upload GST
                  <VisuallyHiddenInput
                    type="file"
                    accept=".pdf,image/jpeg,image/png"
                    onChange={handleFileChange("gstCertificate", {
                      maxFiles: 1,
                      allowedTypes: [
                        "application/pdf",
                        "image/jpeg",
                        "image/png",
                      ],
                      maxSize: 5,
                    })}
                  />
                </Button>
                {safeData.gstCertificate?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {safeData.gstCertificate.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() =>
                            handleRemoveFile("gstCertificate", index)
                          }
                          deleteIcon={<DeleteIcon />}
                          sx={{ m: 0.5 }}
                          color="success"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </FileUploadCard>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Outlet Images */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel shrink>
                Exterior Outlet Images (3 required)
              </InputLabel>
              <FileUploadCard>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Accepted formats: JPG, PNG (Max 2MB each)
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Upload Exterior
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    onChange={handleFileChange("exteriorOutlet", {
                      maxFiles: 5,
                      allowedTypes: ["image/jpeg", "image/png"],
                      maxSize: 2,
                    })}
                  />
                </Button>
                {safeData.exteriorOutlet?.length > 0 && (
                  <>
                    <FilePreviewContainer>
                      {safeData.exteriorOutlet.map((file, index) => (
                        <Box key={index} position="relative">
                          <PreviewImage
                            src={createObjectURL(file)}
                            alt={`Exterior Image ${index + 1}`}
                          />
                          <Button
                            size="small"
                            onClick={() =>
                              handleRemoveFile("exteriorOutlet", index)
                            }
                            sx={{
                              position: "absolute",
                              top: -10,
                              right: -10,
                              minWidth: "auto",
                              padding: "4px",
                              backgroundColor: "error.main",
                              color: "white",
                              "&:hover": {
                                backgroundColor: "error.dark",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </Button>
                        </Box>
                      ))}
                    </FilePreviewContainer>
                    <Typography
                      variant="caption"
                      color={
                        safeData.exteriorOutlet.length < 3
                          ? "error"
                          : "textSecondary"
                      }
                    >
                      {safeData.exteriorOutlet.length < 3 ? (
                        <Box display="flex" alignItems="center">
                          <WarningIcon
                            color="error"
                            fontSize="small"
                            sx={{ mr: 0.5 }}
                          />
                          Minimum 3 images required (currently{" "}
                          {safeData.exteriorOutlet.length})
                        </Box>
                      ) : (
                        `${safeData.exteriorOutlet.length} images uploaded`
                      )}
                    </Typography>
                  </>
                )}
              </FileUploadCard>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel shrink>
                Interior Outlet Images (3 required)
              </InputLabel>
              <FileUploadCard>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Accepted formats: JPG, PNG (Max 2MB each)
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Upload Interior
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    onChange={handleFileChange("interiorOutlet", {
                      maxFiles: 5,
                      allowedTypes: ["image/jpeg", "image/png"],
                      maxSize: 2,
                    })}
                  />
                </Button>
                {safeData.interiorOutlet?.length > 0 && (
                  <>
                    <FilePreviewContainer>
                      {safeData.interiorOutlet.map((file, index) => (
                        <Box key={index} position="relative">
                          <PreviewImage
                            src={createObjectURL(file)}
                            alt={`Interior Image ${index + 1}`}
                          />
                          <Button
                            size="small"
                            onClick={() =>
                              handleRemoveFile("interiorOutlet", index)
                            }
                            sx={{
                              position: "absolute",
                              top: -10,
                              right: -10,
                              minWidth: "auto",
                              padding: "4px",
                              backgroundColor: "error.main",
                              color: "white",
                              "&:hover": {
                                backgroundColor: "error.dark",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </Button>
                        </Box>
                      ))}
                    </FilePreviewContainer>
                    <Typography
                      variant="caption"
                      color={
                        safeData.interiorOutlet.length < 3
                          ? "error"
                          : "textSecondary"
                      }
                    >
                      {safeData.interiorOutlet.length < 3 ? (
                        <Box display="flex" alignItems="center">
                          <WarningIcon
                            color="error"
                            fontSize="small"
                            sx={{ mr: 0.5 }}
                          />
                          Minimum 3 images required (currently{" "}
                          {safeData.interiorOutlet.length})
                        </Box>
                      ) : (
                        `${safeData.interiorOutlet.length} images uploaded`
                      )}
                    </Typography>
                  </>
                )}
              </FileUploadCard>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
        </Grid>
      </ScrollableContent>
    </StyledPaper>
  );
};

export default Uploads;

