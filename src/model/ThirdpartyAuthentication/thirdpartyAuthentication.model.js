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

export const ThirdPartyAuth = mongoose.model(
  "ThirdPartyAuth",
  thirdPartyAuthSchema
);
