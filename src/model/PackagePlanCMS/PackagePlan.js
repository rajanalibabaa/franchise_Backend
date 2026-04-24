import mongoose from "mongoose";

/* individual package */
const packageSchema = new mongoose.Schema(
  {
    investmentRangeLabel: String,
    investmentRange: [String],
    validityDays: Number,
    amount: {
      type: Number,
      required: true
    },
    totalLeads: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

/* plan schema */
const planSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      required: true
    },
    packages: [packageSchema]
  },
  { _id: false }
);

/* listing package schema */
const listingPackageSchema = new mongoose.Schema(
  {
    name:
  {
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
    }
  },
  { _id: false }
);

/* main schema */
const packagesSchema = new mongoose.Schema(
  {
    packagesPlan: [planSchema],

    listingPackage: [listingPackageSchema] // multiple allowed
  },
  { timestamps: true }
);

export default mongoose.model("Packages", packagesSchema);