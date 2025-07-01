import mongoose from "mongoose";
import uuid from "../../utils/uuid.js";

// -- Subschema for FICO (Franchise Investment Cost Options)
const FicoSchema = new mongoose.Schema(
  {
    investmentRange: String,
    areaRequired: String,
    franchiseModel: String,
    franchiseType: String,
    franchiseFee: String,
    royaltyFee: String,
    stockInvestment: String,
    royaltyFeeUnit: String,
    interiorCost: String,
    otherCost: String,
    roi: String,
    payBackPeriod: String,
    breakEven: String,
    requireWorkingCapital: String,
    marginOnSales: String,
    agreementPeriod: Number
  },
  { _id: false }
);

// -- Main Brand Listing Schema
const BrandListingSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuid,
      unique: true
    },
    brandID: {
      type: String,
      unique: true
    },

    brandDetails: {
      fullName: String,
      email: String,
      mobileNumber: String,
      whatsappNumber: String,
      companyName: String,
      brandName: String,
      tagLine: String,
      ceoName: String,
      ceoMobile: String,
      ceoEmail: String,
      officeEmail: String,
      officeMobile: String,
     headOfficeAddress: String,
     country: { type: String, default: "INDIA" },
     state: String,
     district: String,
      city: String,
      pincode: String,
      
      website: String,
      facebook: String,
      instagram: String,
      linkedin: String,
      gstNumber: String,
      pancardNumber: String,
        
      
    },

    franchiseDetails: {
      aidFinancing: String,
      brandCategories: {
        main: String,
        sub: String,
        groupId: String,
        child: String
      },
      brandDescription: String,
      companyOwnedOutlets: String,
      consultationOrAssistance: String,
      establishedYear: String,
      franchiseDevelopment: String,
      franchiseOutlets: String,
      franchiseSinceYear: String,
      totalOutlets: String,
      fico: [FicoSchema], // ✅ Correctly defined array of FICO objects
      trainingSupport: [String], // ✅ Fixed: now accepts arrays of strings
      uniqueSellingPoints: [String]
    },

    expansionLocationData: {
      currentOutletLocations: {
        domestic: {
          locations: [
            {
              _id: false,
              state: String,
              districts: [
                {
                  _id: false,
                  district: String,
                  cities: [String]
                }
              ]
            }
          ]
        },
        international: {
          locations: [
            {
              _id: false,
              state: String,
              districts: [
                {
                  _id: false,
                  district: String,
                  cities: [String]
                }
              ]
            }
          ]
        }
      },
      expansionLocations: {
        domestic: {
          locations: [
            {
              _id: false,
              state: String,
              districts: [
                {
                  _id: false,
                  district: String,
                  cities: [String]
                }
              ]
            }
          ]
        },
        international: {
          locations: [
            {
              _id: false,
              state: String,
              districts: [
                {
                  _id: false,
                  district: String,
                  cities: [String]
                }
              ]
            }
          ]
        }
      }
    },

    uploads: {
      brandLogo: [String],
      exteriorOutlet: [String],
      franchisePromotionVideo: [String],
      gstCertificate: [String],
      interiorOutlet: [String],
      pancard: [String],
      businessPlan: [String],
      // awards: [String],
      awards: [
        {
          awardDescription: { type: String },
          awardImage: { type: String }
        }
      ]
    }
  },
  {
    timestamps: true
  }
);

// Export the model
const BrandListing = mongoose.model("BrandListing", BrandListingSchema);
export default BrandListing;
