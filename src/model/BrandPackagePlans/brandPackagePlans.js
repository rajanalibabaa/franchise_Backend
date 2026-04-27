import mongoose from "mongoose";

/* ================= PACKAGE SCHEMA ================= */
const brandPackageSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      required: true
    },

    investmentRange: String,

    validityDays: Number,
 
    states: [String],

    stateCount: {
      type: Number,
      default: 0
    },

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

    /* START DATE WITH TIME */
    startDate: {
      type: Date,
      default: () => new Date()
    },

    /* END DATE WITH TIME */
    endDate: {
      type: Date
    },

    /* OPTIONAL: AUTO EXPIRE FLAG */
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

const listingPackagesSchema = new mongoose.Schema(
  {
    name:{
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    validityDays: {
      type: Number,
      required: true
    },
     /* START DATE WITH TIME */
    startDate: {
      type: Date,
      default: () => new Date()
    },
    /* END DATE WITH TIME */
    endDate: {
      type: Date
    },

    /* OPTIONAL: AUTO EXPIRE FLAG */
    isExpired: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
    
  { timestamps: true },

);

/* ================= BRAND PACKAGES SCHEMA ================= */

const BrandPackagesSchema = new mongoose.Schema(
  {
    brandOwnerId: {
      type: String,
      unique: true,
      ref: "BrandDetails",
      required: true
    },

    packages: [brandPackageSchema],
    listingPackages: [listingPackagesSchema] 
     

  },
  { timestamps: true }
);

export const BrandPackages = mongoose.model(
  "BrandPackages",
  BrandPackagesSchema
);