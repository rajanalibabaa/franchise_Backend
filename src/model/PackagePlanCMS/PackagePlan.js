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
  { _id: true }
);

const planSchema = new mongoose.Schema(
  { 
    packageType: {
      type: String,
      enum: ["LISTING", "LEAD"],
      default: "LEAD"
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