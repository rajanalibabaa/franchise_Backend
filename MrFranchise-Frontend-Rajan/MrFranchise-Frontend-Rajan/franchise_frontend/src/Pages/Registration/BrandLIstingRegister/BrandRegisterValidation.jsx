
const validateBrandDetails = (data) => {
  const errors = {};
  if (!data.fullName.trim()) errors.fullName = "Full name is required";
  if (!data.brandName.trim()) errors.brandName = "Brand name is required";
  if (!data.companyName.trim()) errors.companyName = "Company name is required";
  if (!data.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Invalid email format";
  }
  if (!data.whatsappNumber.trim())
    errors.whatsappNumber = "WhatsApp number is required";
  if (!data.mobileNumber.trim())
    errors.mobileNumber = "Mobile number is required";
  if (!data.headOfficeAddress.trim())
    errors.headOfficeAddress = "Head office address is required";
  if (!data.state.trim()) errors.state = "State is required";
  if (!data.city.trim()) errors.city = "City is required";
  if (!data.pincode.trim()) errors.pincode = "Pincode is required";
  if (!data.establishedYear)
    errors.establishedYear = "Established year is required";
  if (!data.franchiseSinceYear)
    errors.franchiseSinceYear = "Franchise since year is required";
  if (data.brandCategories.length === 0)
    errors.brandCategories = "At least one category is required";
  if (!data.brandDescription.trim())
    errors.brandDescription = "Brand description is required";
  if (data.expansionLocation.length === 0)
    errors.expansionLocation = "At least one expansion location is required";
  return errors;
};

// Validation for Franchise Details
const validateFranchiseDetails = (data) => {
  const errors = {};
  
  // Validate FICO models
  if (!data.fico || data.fico.length === 0) {
    errors.fico = "At least one FICO model is required";
  } else {
    data.fico.forEach((model, index) => {
      if (!model.investmentRange) {
        errors[`fico[${index}].investmentRange`] = "Investment range is required";
      }
      if (!model.areaRequired) {
        errors[`fico[${index}].areaRequired`] = "Area required is required";
      }
      if (!model.franchiseModel) {
        errors[`fico[${index}].franchiseModel`] = "Franchise model is required";
      }
      if (!model.franchiseType) {
        errors[`fico[${index}].franchiseType`] = "Franchise type is required";
      }
      if (!model.franchiseFee) {
        errors[`fico[${index}].franchiseFee`] = "Franchise fee is required";
      }
      if (!model.royaltyFee) {
        errors[`fico[${index}].royaltyFee`] = "Royalty fee is required";
      }
      if (!model.interiorCost) {
        errors[`fico[${index}].interiorCost`] = "Interior cost is required";
      }
      if (!model.exteriorCost) {
        errors[`fico[${index}].exteriorCost`] = "Exterior cost is required";
      }
      if (!model.otherCost) {
        errors[`fico[${index}].otherCost`] = "Other cost is required";
      }
      if (!model.roi) {
        errors[`fico[${index}].roi`] = "ROI period is required";
      }
      if (!model.breakEven) {
        errors[`fico[${index}].breakEven`] = "Break even period is required";
      }
      if (!model.requireInvestmentCapital) {
        errors[`fico[${index}].requireInvestmentCapital`] = "Required investment capital is required";
      }
      if (!model.propertyType) {
        errors[`fico[${index}].propertyType`] = "Property type is required";
      }
    });
  }

  // Validate franchise network
  if (!data.companyOwnedOutlets) {
    errors.companyOwnedOutlets = "Company owned outlets is required";
  }
  if (!data.franchiseOutlets) {
    errors.franchiseOutlets = "Franchise outlets is required";
  }
  if (!data.totalOutlets) {
    errors.totalOutlets = "Total outlets is required";
  }

  // Validate support and training
  if (!data.requirementSupport) {
    errors.requirementSupport = "Requirement support is required";
  }
  if (!data.trainingProvidedBy) {
    errors.trainingProvidedBy = "Training provider is required";
  }
  if (!data.agreementPeriod) {
    errors.agreementPeriod = "Agreement period is required";
  }

  return errors;
};

export { validateBrandDetails, validateFranchiseDetails };


