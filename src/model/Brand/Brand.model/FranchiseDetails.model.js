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
    franchiseDetails:{aidFinancing: String,
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
    fico: [FicoSchema],
    trainingSupport: [String],
    uniqueSellingPoints: [String],}
      
  },
  {
    timestamps: true
  }
);

export const FranchiseDetails = mongoose.model("FranchiseDetails", FranchiseDetailsSchema);