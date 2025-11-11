import mongoose from "mongoose";


const emailRecordSchema = new mongoose.Schema(
  {
    investorId: { type: String },
    investorName: { type: String, required: true },
    investorEmail: { type: String, required: true },
    investorMobile: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { _id: false }
);


const monthlyRecordSchema = new mongoose.Schema(
  {
    monthYear: { type: String, required: true }, 
    count: { type: Number, default: 0 },
    records: [emailRecordSchema],
  },
  { _id: false }
);


const locationInvestmentRangeMatchSchema = new mongoose.Schema(
  {
    brandId: {
      type: String,
      required: true,
      index: true,
    },
    brandName: {
      type: String,
      required: true,
      trim: true,
    },
    
    locationInvestmentRangeMatch: {
      type: Number,
      default: 0,
    },
    locationInvestmentRangeMatchRecords: {
      type: [monthlyRecordSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const LocationInvestmentRangeMatch =  mongoose.model("LocationInvestmentRangeMatch", locationInvestmentRangeMatchSchema);
