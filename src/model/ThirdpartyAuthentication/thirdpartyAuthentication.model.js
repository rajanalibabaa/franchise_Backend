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
    phone: {
      type: String,
      trim: true,
    },
    uuid: {
      type: String,
      required: true,
      unique: true,
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
