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


export const leadsgetAllFunctions = async(industry,page=1,limit =10,filters={})=>{
  try {
    
if(!industry || industryMapping[industry]) {
  return new ApiResponse(400, null, "Invalid industry name");
}
const modelName = industryMapping[industry];
const model = IndustryModels[modelName];
const skip = (page - 1) * limit;
const query ={}

 // Apply filters if provided
    if (filters.state) query.state = filters.state;
    if (filters.district) query.district = filters.district;
    if (filters.city) query.city = filters.city;
    if (filters.investmentRange) query.investmentRange = filters.investmentRange;
    if (filters.planToInvest) query.planToInvest = filters.planToInvest;
    if (filters.readyToInvest) query.readyToInvest = filters.readyToInvest;
    if (filters.brandId) query.brandId = filters.brandId;
    if (filters.category) query.category = filters.category;
    if (filters.subCategory) query.subCategory = filters.subCategory;
// Get total count for pagination
    const totalCount = await model.countDocuments(query);

      const data = await model
      .find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Use lean() for better performance

       if (!data) {
      return new ApiResponse(404, null, "No leads found");
    }

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1,
    };

    return new ApiResponse(200, { data, pagination }, "Leads fetched successfully");

  } catch (error) {
    console.error("Error in instaApplyBrandFormController:", error);
    return new ApiResponse(500, {}, "Internal server error");
    
  }
}