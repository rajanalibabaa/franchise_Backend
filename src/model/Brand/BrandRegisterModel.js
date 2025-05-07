import mongoose from "mongoose";

const brandRegisterSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      match: /^[0-9]{10,15}$/, // Basic pattern for phone numbers
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
    },
    brandName: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    franchiseType: {
      type: String,
      required: true,
      trim: true,
    },
    // agreeToTerms: {
    //   type: Boolean,
    //   required: true,
    // },
  },
  {
    timestamps: true, 
  }
);

export const BrandRegister = mongoose.model("BrandRegister", brandRegisterSchema);

