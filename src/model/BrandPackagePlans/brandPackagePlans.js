import mongoose from "mongoose";

/* ================= INVESTMENT RANGE ================= */
const investmentRangeSchema = new mongoose.Schema(
  { 
    investmentRange: String,
    states: [String],
    statesCount: Number
  },
  { _id: true }
);

/* ================= PACKAGE SCHEMA ================= */
const brandPackageSchema = new mongoose.Schema(
  {
    PakageType: {
      type: String,
      enum: ["LISTING", "LEAD"],
      required: true
    },

    planName: {
      type: String,
      required: true
    },

    investmentRangeLabel: String,

    individualInvestment: [investmentRangeSchema],

    validityDays: Number,

    totalLeads: {
      type: Number,
      default: 0
    },

    remainingLeads: {
      type: Number,
      default: 0
    },

    totalAmount: {
      type: Number,
      required: true
    },

    startDate: {
      type: Date,
      default: () => new Date()
    },

    endDate: {
      type: Date
    },

    isExpired: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    }

  },
  { timestamps: true }
);

/* ================= MAIN SCHEMA ================= */

const BrandPackagesSchema = new mongoose.Schema(
  {
    brandOwnerId: {
      type: String,
      unique: true,
      ref: "BrandDetails",
      required: true
    },

    packages: [brandPackageSchema]

  },
  { timestamps: true }
);

export const BrandPackages = mongoose.model(
  "BrandPackages",
  BrandPackagesSchema
);