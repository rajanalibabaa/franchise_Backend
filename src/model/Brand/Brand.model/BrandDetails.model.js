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
      pause:{
        type:Boolean,
        default:false
      },
      payment:{
        type:Boolean,
        default:false
      },
      
    },
    active: {
      type: Boolean,
      default: false,
    },
    lastActive: {
      type: Date,
    },

    loginPlatform: {
      type: String,
    },
    newOtp: {
      type: String,
    },
    otpExpired: {
      type: Date,
    },
    userNewVerifyToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const BrandDetails = mongoose.model("BrandDetails", BrandDetailsSchema);
