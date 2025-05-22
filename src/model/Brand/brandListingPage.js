// import mongoose from "mongoose";
// import uuid from "../../utils/uuid.js";

// const BrandListingSchema = new mongoose.Schema(
//   {
//     uuid: {
//       type: String,
//       default: uuid, // Ensure uuid is a function if it generates unique IDs
//       unique: true,
//     },

//     personalDetails: {
//       FullName: { type: String },
//       email: { type: String },
//       mobileNumber: { type: String },
//       whatsappNumber: { type: String },
//       brandName: { type: String },
//       companyName: { type: String },
//       country: { type: String },
//       pincode: { type: String },
//       HeadOfficeaddress: { type: String },
//       state: { type: String },
//       city: { type: String },
//       establishedYear: { type: String },
//       franchiseSinceYear: { type: String },
//       brandCategories: [{ type: String }],
//       brandDescription: { type: String },
//       expansionLocation: { type: String },
//       pancardNumber: { type: String },
//       gstNumber: { type: String },
//       website: { type: String },
//       facebook: { type: String },
//       instagram: { type: String },
//       linkedin: { type: String },
//     },
//     franchiseDetails: {

// foco:[{      
//   investmentRange: { type: String },
//   areaRequired: { type: String },
//   franchiseModel: { type: String },
//         franchiseType: { type: String },
//               franchiseFee: { type: String },
//       royaltyFee: { type: String },
//       interiorcost: { type: String },
//       exteriorCost: { type: String },
//       otherCost: { type: String },
//       Roi: { type: String },
//       breakEven: { type: String },
//       requireInvestmentCapital: { type: String },
//       propertyType: { type: String },
// }],
//       companyOwnedOutlets: { type: String },
//       franchiseOutlets: { type: String },
//       totalOutlets: { type: String },
//       requirementSuport: { type: String },
//       traningProvidedBy: { type: String },
//       aggrementPeriods: { type: String },
//     },
//     brandDetails: {
//       pancard: [{ type: String }], // store file paths or URLs
//       gstCertificate: [{ type: String }],
//       gstNumber: { type: String },
//       brandLogo: [{ type: String }],
//       companyImage: [{ type: String }],
//       exterioroutlet: [{ type: String }],
//       interiorOutlet: [{ type: String }],
//       franchisePromotionVideo: [{ type: String }],
//       brandPromotionVideo: [{ type: String }],
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const BrandListing = mongoose.model("BrandListing", BrandListingSchema);
// export default BrandListing;
import mongoose from "mongoose";
import uuid from "../../utils/uuid.js"; // Custom function to generate unique IDs

const FranchiseModelSchema = new mongoose.Schema(
  {
    investmentRange: { type: String },
    areaRequired: { type: String },
    franchiseModel: { type: String }, // Consider enum here
    franchiseType: { type: String },
    franchiseFee: { type: String },
    royaltyFee: { type: String },
    interiorCost: { type: String },
    exteriorCost: { type: String },
    otherCost: { type: String },
    roi: { type: String },
    breakEven: { type: String },
    requiredInvestmentCapital: { type: String },
    propertyType: { type: String },
  },
  { _id: false }
);
const BrandListingSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuid, // auto-generated unique ID
      unique: true,
    },
    personalDetails: {
      fullName: { type: String },
      email: { type: String },
      mobileNumber: { type: String },
      whatsappNumber: { type: String },
      brandName: { type: String },
      companyName: { type: String },
      country: { type: String },
      pincode: { type: String },
      headOfficeAddress: { type: String },
      state: { type: String },
      city: { type: String },
      establishedYear: { type: String },
      franchiseSinceYear: { type: String },
      brandCategories: [{ type: String }],
      brandDescription: { type: String },
      expansionLocation:[ { type: String }],
      pancardNumber: { type: String },
      gstNumber: { type: String },

      website: { type: String },
      facebook: { type: String },
      instagram: { type: String },
      linkedin: { type: String },
    },
    franchiseDetails: {
      modelsOfFranchise: [FranchiseModelSchema], // Array of franchise models (FOCO/FOFO)
      companyOwnedOutlets: { type: String },
      franchiseOutlets: { type: String },
      totalOutlets: { type: String },
      requirementSupport: { type: String }, // could be array or sub-object
      trainingProvidedBy: { type: String },
      agreementPeriod: { type: String },
    },
   brandDetails: {
      pancard: [{ type: String }], // store file paths or URLs
      gstCertificate: [{ type: String }],
      gstNumber: { type: String },
      brandLogo: [{ type: String }],
      companyImage: [{ type: String }],
      exterioroutlet: [{ type: String }],
      interiorOutlet: [{ type: String }],
      franchisePromotionVideo: [{ type: String }],
      brandPromotionVideo: [{ type: String }],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const BrandListing = mongoose.model("BrandListing", BrandListingSchema);
export default BrandListing;
