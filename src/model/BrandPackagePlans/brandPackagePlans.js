import mongoose from "mongoose";

/* ================= PAUSE HISTORY ================= */
const pauseHistorySchema = new mongoose.Schema(
  {
    pausedDate: {
      type: Date,
    },

    playDate: {
      type: Date,
    },

    balanceDays: {
      type: Number,
      default: 0,
    },
  },
  { _id: true },
);

/* ================= INVESTMENT RANGE ================= */
const investmentRangeSchema = new mongoose.Schema(
  {
    selectedPlanInvestmetrange: {
      type: String,
    },
    selectedPlanStateAndDistrict: [
      {
        state: {
          type: String,
        },
        district: [String],
      },
    ],
  },
  { _id: true },
);

/* ================= INVESTMENT PACKAGE ================= */
const investmetPackageSchema = new mongoose.Schema(
  {
    packagesName: {
      type: String,
    },

    planUniqueId: {
      type: String,
    },
    investmetRageLabel: {
      type: String,
    },

    investmentranges: {
      type: [investmentRangeSchema],
      default: [],
    },

    validity: {
      type: String,
    },

    totalLeads: {
      type: Number,
      default: 0,
    },
    sendingLeads: {
      type: Number,
      default: 0,
    },
    sendingPercentage: {
      type: Number,
      default: 0,
    },
    remainingLeads: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    packageStartDate: {
      type: Date,
    },
    packageEndDate: {
      type: Date,
    },
    currentDate: {
      type: Date,
    },
    renewalEndDate: {
      type: Date,
    },
    isPaused: {
      type: Boolean,
      default: false,
    },
    pauseHistory: {
      type: [pauseHistorySchema],
      default: [],
    },
    isExperied: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isPending: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true },
);

/* ================= PACKAGE ================= */
const packageSchema = new mongoose.Schema(
  {
    packagesType: {
      type: String,
      enum: ["LISTING", "LEAD", "FREE"],
    },
    investmetPackages: [investmetPackageSchema],
  },
  { _id: true },
);

/* ================= MAIN SCHEMA ================= */
const BrandPackagesSchema = new mongoose.Schema(
  {
    brandOwnerId: {
      type: String,
      required: true,
    },

    industry: {
      type: String,
    },

    category: {
      type: String,
    },
    brandName: {
      type: String,
    },
    packages: {
      type: [packageSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export const BrandPackages = mongoose.model(
  "BrandPackages",
  BrandPackagesSchema,
);