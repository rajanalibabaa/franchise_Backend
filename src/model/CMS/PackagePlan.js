
import mongoose from "mongoose";

/* individual package */
const packageSchema = new mongoose.Schema(
  {
    investmentRangeLabel: String,
    investmentRange: [String],
    validityDays: Number,
    basicLeadCount:Number,
    amount: {
      type: Number,
      required: true
    },
    totalLeads:[Number]
  },
  { _id: true }
);

const planSchema = new mongoose.Schema(
  { 
    packageType: {
      type: String,
      enum: ["LISTING", "LEAD","FREE"],
      default: "LEAD"
    },
    planUniqueId: {
      type: String,
      required: true
    },
    indexNumber: {
      type: Number,
      required: true
    },
    planName: {
      type: String,
      required: true
    },
    packages: [packageSchema]
  },

);
/* main schema */
const packagesSchema = new mongoose.Schema(
  {
    packagesPlan: [planSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Packages", packagesSchema);