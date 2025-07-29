import mongoose from "mongoose";
import uuid from "../../utils/uuid.js"

const BrandDetailsSchema = new mongoose.Schema(
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
    awardDescription: { type: String },
  },
  {
    timestamps: true
  }
);

export const BrandDetails = mongoose.model("BrandDetails", BrandDetailsSchema);