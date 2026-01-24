import mongoose from "mongoose";

const OtherIndustriesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      // lowercase : true,
      unique: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Enter a valid 10-digit mobile number"],
      unique: true,
    },
    registerAs: {
      type: String,
      required: true,
      enum: ["Investor", "Brand"],
    },
    category: {
      type: String,
      required: true,
      enum: ["Food & Beverage", "Retail", "Education", "Health & Wellness"],
    },
    message: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);
export const OtherIndustriesModel = mongoose.model(
  "OtherIndustriesModel",
  OtherIndustriesSchema,
);
