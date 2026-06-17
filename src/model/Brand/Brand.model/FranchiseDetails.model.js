import mongoose from "mongoose";

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

const FranchiseDetailsSchema = new mongoose.Schema(
  {
    brandOwnerId: {
      type: String,
      unique: true,
      ref: 'BrandDetails',
      required: true
    }, 
    franchiseDetails:{
      aidFinancing: String,
      brandCategories: {
        main: String,
        sub: String,
        groupId: String,
        productTags: [{parent:String,tags:[String]}],
        serviceTags: [{parent:String,tags:[String]}]
      },
      brandDescription: String,
      companyOwnedOutlets: String,
      consultationOrAssistance: String,
      establishedYear: String,
      franchiseDevelopment: String,
      franchiseOutlets: String,
      franchiseSinceYear: String,
      totalOutlets: String,
      fico: [FicoSchema],
      trainingSupport: [String],
      uniqueSellingPoints: [String],
      franchiseTags:{
        PrimaryClassifications:[String],
        ProductServiceTypes:[String],
        TargetAudience:[String],
        ServiceModel:[String],
        PricingValue:[String],
        AmbienceExperience:[String],
        FeaturesAmenities:[String],
        TechnologyIntegration:[String],
        SustainabilityEthics:[String],
        BusinessOperations:[String],
    }
  },
    
      
  },
  {
    timestamps: true
  }
);

export const BrandFranchiseDetails = mongoose.model("BrandFranchiseDetails", FranchiseDetailsSchema);