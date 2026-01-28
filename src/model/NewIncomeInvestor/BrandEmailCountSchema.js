// new Emailaddress tracking schema

import mongoose from "mongoose";

// 🧩 Schema for each investor email record
const emailRecordSchema = new mongoose.Schema(
  {
    investorId: { type: String }, // optional for free leads
    investorName: { type: String, required: true },
    investorEmail: { type: String, required: true },
    investorMobile: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

// 🗓️ Schema for monthly record (used for both free & paid)
const monthlyRecordSchema = new mongoose.Schema(
  {
    monthYear: { type: String, required: true }, // e.g., "Nov-2025"
    count: { type: Number, default: 0 }, // total sent in that month
    records: [emailRecordSchema],
  },
  { _id: false },
);

// 🏷️ Main BrandEmailCount Schema
const brandEmailCountSchema = new mongoose.Schema(
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
    // 🟢 Free Leads (current month only)
    freeEmailCount: {
      type: Number,
      default: 0,
    },
    freeEmailRecords: {
      type: [monthlyRecordSchema],
      default: [],
    },
    // 🟠 Paid Leads (current month only)
    paidEmailCount: {
      type: Number,
      default: 0,
    },
    paidEmailRecords: {
      type: [monthlyRecordSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("BrandEmailCount", brandEmailCountSchema);
