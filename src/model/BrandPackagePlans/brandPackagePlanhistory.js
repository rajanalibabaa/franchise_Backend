
import mongoose from "mongoose";

/* ================= INVESTMENT RANGE ================= */
const investmentRangeSchema = new mongoose.Schema(
  {
    selectedPlanInvestmetrange: {
      type: String
    },
    selectedPlanState: [
      {
        type: String,
          default: []
      }
    ]
  },
  { _id: true }
);

/* ================= INVESTMENT PACKAGE ================= */
const investmetPackageSchema = new mongoose.Schema(
  {
    InvestmetRageLabel: {
      type: String
    },

     investmentranges: {
      type: [investmentRangeSchema],
      default: []
    },

    Validity: {
      type: String
    },

    TotalLeads: {
      type: Number,
      default: 0
    },

    remainingLeads: {
      type: Number,
      default: 0
    },

    TotalAmount: {
      type: Number,
      default: 0
    },

    StartDate: {
      type: Date
    },

    EndDate: {
      type: Date
    },

    isExperied: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { _id: true }
);

/* ================= PACKAGE ================= */
const packageSchema = new mongoose.Schema(
  {
    packagesType: {
      type: String,
       enum: ["LISTING", "LEAD", "FREE"],
       
    },

    packagesName: {
      type: String
    },

    planUniqueId: {
      type: String
    },

    InvestmetPackages: [investmetPackageSchema]
  },
  { _id: true }
);

/* ================= MAIN SCHEMA ================= */
const BrandPackagesHistorySchema = new mongoose.Schema(
  {
    brandOwnerId: {
      type: String,
      required: true
    },

    Industry: {
      type: String
    },

    Category: {
      type: String
    },

   packages: {
      type: [packageSchema],
      default: []
    }
  },
  { timestamps: true }
);

export const BrandPackagesHistory = mongoose.model(
  "BrandPackagesHistory",
  BrandPackagesHistorySchema
);