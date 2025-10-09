import mongoose from "mongoose";

const BrandDetailsSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      unique: true,
    },
    brandID: {
      type: String,
      unique: true,
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
    active: {
      type: Boolean,
      default: false,
    },
    lastActive: {
      type: Date,
    },
    alreadyLogin: {
      type: Boolean,
      default: false,
    },
    loginPlatform: {
      type: String,
      enum: ["https://fb.mrfranchise.in/", "https://mrfranchise.in/"],
    },
    newOtp: {
      type: String,
    },
    otpExpired: {
      type: Date,
      
    },
  },
  {
    timestamps: true,
  }
);

export const BrandDetails = mongoose.model("BrandDetails", BrandDetailsSchema);
