import { IndustryModels } from "../../model/Leads/leadsModels.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import uuid from "../../utils/uuid.js";

export const industryMapping = {
  "Food & Beverages": "FoodAndBeverageLeads",
  "Education & Training": "EducationAndTrainingLeads",
  "Health, Beauty & Wellness": "HealthBeautyAndWellnessLeads",
  "Retails & Fashion": "RetailAndFashionLeads",
  "Automotive": "AutomotiveLeads",
  "Home Services & Maintenance": "HomeServicesAndMaintenanceLeads",
  "Real Estate & Property Services": "RealEstateAndPropertyServicesLeads",
  "Business & Professional Services": "BusinessAndProfessionalServicesLeads",
  "Hospitality & Travel": "HospitalityAndTravelLeads",
  "Manufacturing & Industrial": "ManufacturingAndIndustrialLeads",
  "Agriculture & Organic Business": "AgricultureAndOrganicBusinessLeads",
  "E-Commerce & Technology": "ECommerceAndTechnologyLeads",
  "Entertainment & Recreation": "EntertainmentAndRecreationLeads",
  "Logistics & Transportation": "LogisticsAndTransportationLeads",
  "Clean Tech & Environment": "CleanTechAndEnvironmentLeads",
  "Social Impact & NGO": "SocialImpactAndNGOLeads",
  "Pet Care & Other Emerging Sectors": "PetCareAndOtherEmergingSectorsLeads",
};

export const leadsCreateFunction = async (body, exist, applyBy, applyId) => {
  try {
    const selectedIndustry =
      exist.franchiseDetails.franchiseDetails.brandCategories.main;

    const generateUUID = uuid();

    const fields = {
      uuid: generateUUID,
      fullName: body?.fullName,
      investorEmail: body?.email,
      investorMobileNumber: body?.mobileNumber,
      state: body?.state,
      district: body?.district,
      city: body?.city,
      investmentRange: body?.investmentRange,
      planToInvest: body?.planToInvest,
      readyToInvest: body?.readyToInvest,
      brandId: body?.brandId,
      brandName: body?.brandName,
      brandEmail: exist?.brandDetails?.email,
      brandMobileNumber: exist?.brandDetails?.mobileNumber,
      brandLogo: exist?.uploads?.uploads?.brandLogo[0],
      industry: selectedIndustry,
      category: exist?.franchiseDetails?.franchiseDetails?.brandCategories?.sub,
      subCategory:
        exist?.franchiseDetails?.franchiseDetails?.brandCategories.child,
      apply: {
        applyBy,
        applyId,
      },
    };
    const modelName = industryMapping[selectedIndustry];
    const model = IndustryModels[modelName];

    const data = await model.create(fields);
    if (!data) {
      new ApiResponse(
        500,
        null,
        "Something went wrong while newSubmission saving in database"
      );
    }

    return new ApiResponse(200, data, "Application submitted successfully");
  } catch (error) {
    console.error("Error in instaApplyBrandFormController:", error);
    return new ApiResponse(500, {}, "Internal server error");
  }
};
