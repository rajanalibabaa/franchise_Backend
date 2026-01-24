import mongoose from "mongoose";

const emailRecordSchema = new mongoose.Schema(
  {
    investorId: { type: String },
    investorName: { type: String, required: true },
    investorEmail: { type: String, required: true },
    investorMobile: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const monthlyRecordSchema = new mongoose.Schema(
  {
    range: { type: String, required: true },
    monthNumber: { type: Number, required: true },
    count: { type: Number, default: 0 },
    leadsRecords: [emailRecordSchema],
  },
  { _id: false },
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
    locationInvestmentRangeMatchRecords: {
      type: [
        {
          packageType: {
            type: String,
          },
          packageStartDate: {
            type: String,
          },
          packageEndDate: {
            type: String,
          },
          leadCount: {
            type: Number,
            default: 0,
          },
          records: [monthlyRecordSchema],
        },
        { _id: false },
      ],
    },
  },
  { timestamps: true },
);

export const LocationInvestmentRangeMatch = mongoose.model(
  "LocationInvestmentRangeMatch",
  locationInvestmentRangeMatchSchema,
);
