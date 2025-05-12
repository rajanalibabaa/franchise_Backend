import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const franchiseBrandSchema = new Schema({
  // Brand Details
  BrandDetails : {
    companyName: { type: String, required: true },
    brandName: { type: String, required: true },
    gstin: { type: String },
    categories: [{ type: String }],
    ownerName: { type: String },
    description: { type: String },
    address: { type: String },
    country: { type: String },
    pincode: { type: String },
    location: { type: String },
    mobileNumber: { type: String },
    whatsappNumber: { type: String },
    email: { type: String },
    website: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    linkedin: { type: String },
    establishedYear: { type: String },
    franchiseSinceYear: { type: String },
  },
  

  // // Expansion Plans
  ExpansionPlans : {
    expansionType: {
      type: String,
      enum: ['domestic', 'international'],
      default: 'domestic'
    },
    selectedCountries: [{ type: String }],
    selectedStates: [{ type: String }],
    selectedCities: [{ type: String }],
    selectedIndianStates: [{ type: String }],
    selectedIndianDistricts: [{ type: String }],
  // 
  },
  
  // // Franchise Modal
  FranchiseModal : {
    totalInvestment: { type: String },
    franchiseFee: { type: String },
    royaltyFee: { type: String },
    equipmentCost: { type: String },
    expectedRevenue: { type: String },
    expectedProfit: { type: String },
    spaceRequired: { type: String },
    paybackPeriod: { type: String },
    minimumCashRequired: { type: String },
    companyOwnedOutlets: { type: String },
    franchiseOutlets: { type: String },
    totalOutlets: { type: String },
    targetCities: { type: String },
    targetStates: { type: String },
    expansionFranchiseFee: { type: String },
    expansionRoyalty: { type: String },
    paymentTerms: { type: String },
  },
  

  // // Documentation

  Documentation : {
    brandLogo: { type: String },
    businessRegistration: { type: String },
    gstCertificate: { type: String },
    franchiseAgreement: { type: String },
    menuCatalog: { type: String },
    interiorPhotos: { type: String },
    fssaiLicense: { type: String },
    panCard: { type: String },
    aadhaarCard: { type: String },
  },
  

  // Gallery
  Gallery : {
    mediaFiles: [{ type: String }],
  }
  
}, {
  timestamps: true
});

const FranchiseBrand = model('FranchiseBrand', franchiseBrandSchema);

export default FranchiseBrand;
