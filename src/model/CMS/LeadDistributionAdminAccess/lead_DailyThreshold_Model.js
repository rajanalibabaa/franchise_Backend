import mongoose from "mongoose";

const leadThresholdSchema = new mongoose.Schema(
  {
    brandId: {
      type: String,
      required: true,
      index: true,
    },

    packageId: {
      type: String,
      required: true,
      index: true,
    },

    totalLeads: {
      type: Number,
      required: true,
      default: 0,
    },

    durationDays: {
      type: Number,
      required: true,
      default: 0,
    },

    autoCalculatedThreshold: {
      type: Number,
      default: 0,
    },

    customThreshold: {
      type: Number,
      default: null,
    },

    finalThreshold: {
      type: Number,
      default: 0,
    },

    todaySentCount: {
      type: Number,
      default: 0,
    },

    lastResetDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

export const LeadThreshold = mongoose.model(
    "LeadThreshold",
    leadThresholdSchema
);