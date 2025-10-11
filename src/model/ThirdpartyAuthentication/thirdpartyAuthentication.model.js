import mongoose from "mongoose";

const thirdPartyAuthSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    profilePhoto: {
      type: String,
    },
    source: {
      type: String,
      enum: ["google", "facebook"],
    },
    mobileNumber: {
      type: String,
      trim: true,
    },
    uuid: {
      type: String,
      required: true,
      unique: true,
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
    }
  },
  {
    timestamps: true,
  }
);

export const ThirdPartyAuth = mongoose.model(
  "ThirdPartyAuth",
  thirdPartyAuthSchema
);
