import mongoose from "mongoose";
import uuid from "../../utils/uuid.js"; 

const FranchiseModelSchema = new mongoose.Schema(
  {
    investmentRange: String,
    areaRequired: String,
    franchiseModel: String,
    franchiseType: String,
    franchiseFee: String,
    royaltyFee: String,
    interiorCost: String,
    exteriorCost: String,
    otherCost: String,
    roi: String,
    breakEven: String,
    requiredInvestmentCapital: String,
    marginOnSales: String,
    fixedReturn: String,
    propertyType: String
  },
  { _id: false }
);

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
      brandName: String,
      ceoEmail: String,
      ceoMobile: String,
      ceoName: String,
      city: String,
      companyName: String,
      country: { type: String, default: "IN" },
      email: String,
      facebook: String,
      fullName: String,
      gstNumber: String,
      headOfficeAddress: String,
      instagram: String,
      linkedin: String,
      managerName: String,
      mobileNumber: String,
      pancardNumber: String,
      pincode: String,
      state: String,
      website: String,
      whatsappNumber: String
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
      fico: [String],
      franchiseDevelopment: String,
      franchiseOutlets: String,
      franchiseSinceYear: String,
      totalOutlets: String,
      trainingSupport: String,
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
      pancard: [String]
    }
  },
  {
    timestamps: true // ✅ Automatically adds createdAt and updatedAt
  }
);

// Model export
const BrandListing = mongoose.model("BrandListing", BrandListingSchema);
export default BrandListing;