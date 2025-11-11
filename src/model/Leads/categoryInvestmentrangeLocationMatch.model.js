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


const categoryInvestmentrangeLocationMatchSchema = new mongoose.Schema(
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
    
    categoryInvestmentrangeLocationMatch: {
      type: Number,
      default: 0,
    },
    categoryInvestmentrangeLocationMatchRecords: {
      type: [monthlyRecordSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const CategoryInvestmentrangeLocationMatch =  mongoose.model("CategoryInvestmentrangeLocationMatch", categoryInvestmentrangeLocationMatchSchema);
