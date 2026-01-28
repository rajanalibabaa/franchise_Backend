import mongoose from "mongoose";

const fields = {
  uuid: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  investorMobileNumber: {
    type: String,
  },
  state: {
    type: String,
  },
  district: {
    type: String,
  },
  city: {
    type: String,
  },
  investmentRange: {
    type: String,
  },
  planToInvest: {
    type: String,
  },
  readyToInvest: {
    type: String,
  },
  brandId: {
    type: String,
    required: true,
  },
  brandName: {
    type: String,
  },
  brandEmail: {
    type: String,
  },
  brandMobileNumber: {
    type: String,
  },
  brandLogo: {
    type: String,
  },
  apply: {
    applyBy: {
      type: String,
      enum: ["Investor", "Brand", "Other"],
      default: "Other",
    },
    applyId: {
      type: String,
      default: "Other",
    },
  },
  industry: {
    type: String,
  },
  category: {
    type: String,
  },
  subCategory: {
    type: String,
  },
  status: {
    type: String,
    enum: [
      "follow-up",
      "deal completed",
      "not interested",
      "not contactable",
      "wrong category",
      "out of area",
    ],
  },
  starredByBrand: {
    type: Boolean,
  },
  starredByInvestor: {
    type: Boolean,
  },
  enquiryVia: {
    type: String,
    enum: ["portal", "expo", "telecall"],
    default: "portal",
  },
  noteByBrand: {
    type: String,
  },
  noteByInvestor: {
    type: String,
  },
};

const BaseSchema = new mongoose.Schema(fields, {
  timestamps: true,
});

const industries = [
  "FoodAndBeverageLeads",
  "EducationAndTrainingLeads",
  "HealthBeautyAndWellnessLeads",
  "RetailAndFashionLeads",
  "AutomotiveLeads",
  "HomeServicesAndMaintenanceLeads",
  "RealEstateAndPropertyServicesLeads",
  "BusinessAndProfessionalServicesLeads",
  "HospitalityAndTravelLeads",
  "ManufacturingAndIndustrialLeads",
  "AgricultureAndOrganicBusinessLeads",
  "ECommerceAndTechnologyLeads",
  "EntertainmentAndRecreationLeads",
  "LogisticsAndTransportationLeads",
  "CleanTechAndEnvironmentLeads",
  "SocialImpactAndNGOLeads",
  "PetCareAndOtherEmergingSectorsLeads",
];

export const IndustryModels = industries.reduce((models, name) => {
  models[name] = mongoose.model(name, BaseSchema);
  return models;
}, {});
