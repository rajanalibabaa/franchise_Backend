import mongoose from "mongoose";

const brandListingPageSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  brandName: { type: String, required: true },
  category: {
    main: { type: String, required: true },
    sub: { type: String, required: true },
  },
  ownerName: { type: String, required: true },
  aboutCompany: { type: String, required: true },
  address: { type: String, required: true },
  country: { type: String, required: true },
  pincode: { type: String, required: true },
  location: {
    state: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
  },
  mobileNumber: { type: String, required: true },
  whatsAppNumber: { type: String, required: true },
  email: { type: String, required: true },
  otp: {
    email: {
      code: { type: String },
      expiresAt: { type: Date },
      verified: { type: Boolean, default: false },
    },
    mobile: {
      code: { type: String },
      expiresAt: { type: Date },
      verified: { type: Boolean, default: false },
    },
    whatsapp: {
      code: { type: String },
      expiresAt: { type: Date },
      verified: { type: Boolean, default: false },
    },
  },

  website: {
    officalWebsite: { type: String, required: true },
    facebook: { type: String, required: true },
    instagram: { type: String, required: true },
    linkedIn: { type: String, required: true },
    twitter: { type: String, required: true },
    youtube: { type: String, required: true },
  },
  eastablishYear: { type: String, required: true },
  franchising: { type: String, required: true },
  expansions: {
    interNational: { type: String, required: true },
    domestic: { type: String, required: true },
  },
  investment: { type: String, required: true },
  franchiseFee: { type: String, required: true },
  royalityFee: { type: String, required: true },
  equipmentCost: { type: String, required: true },
  expectMonthlyRevenue: { type: String, required: true },
  expectMonthlyProfit: { type: String, required: true },
  PayBackPeriod: { type: String, required: true },
  spaceRequired: { type: String, required: true },
  training: { type: String, required: true },
  minumuminvestment: { type: String, required: true },
  companyownoutlet: { type: String, required: true },
  franchiseoutlet: { type: String, required: true },
  totalOutlet: { type: String, required: true },
  targetcitiesExpansion: { type: String, required: true },
  targetstatesExpansion: { type: String, required: true },
  paymentterms: { type: String, required: true },
  brandLogo: { type: String, required: true },
  brandImage: { type: String, required: true },
  brandVideo: { type: String, required: true },
  aadharimgae: { type: String, required: true },
  panImage: { type: String, required: true },
  gstImage: { type: String, required: true },
  companyRegistrationImage: { type: String, required: true },
  menuCatalogImage: { type: String, required: true },
  interiorImage: { type: String, required: true },
  galleryImage: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const BrandListingPage = mongoose.model(
  "BrandListingPage",
  brandListingPageSchema
);
export default BrandListingPage;
