  import mongoose from "mongoose";

const investmentRangeEnum = [
  "Below-50,000",
  "Rs.50,000-2L",
  "Rs.2L-5L",
  "Rs.5L-10L",
  "Rs.10L-20L",
  "Rs.20L-30L",
  "Rs.30L-50L",
  "Rs.50L-1Cr",
  "Rs.1Cr-2Cr",
  "Rs.2Cr-5Cr",
  "Rs.5Cr-above"
];

const applyByEnum = ["Investor", "Brand", "other"];

const BrandSentSchema = new mongoose.Schema({
  brandId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "BrandListing", 
    required: true 
  },
  brandName: { 
    type: String, 
    required: true 
  },
  brandEmail: { 
    type: String, 
    required: true 
  },
  emailSent: { 
    type: Boolean, 
    default: false 
  },
  emailSentAt: { 
    type: Date 
  }
}, { _id: false });

const InstantApplyInvestorSchema = new mongoose.Schema({
  investorEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address"
    ]
  },
  investorName: {
    type: String,
    required: true,
    trim: true
  },
  investorPhone: {
    type: String,
    required: true,
    trim: true
  },
  category: [  
    {
      main: { type: String },
      sub: { type: String },
      child: { type: String }
    }
  ],
  location: {
    state: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true }
  },
  investmentRange: {
    type: String,
    required: true,
    enum: investmentRangeEnum
  },
  planToInvest: { type: String },
  readyToInvest: { type: String },
  apply: {
    applyBy: {
      type: String,
      enum: applyByEnum,
      default: "other",
      required: true
    },
    applyId: {
      type: String,
      default: "other"
    }
  },
  brandsSent: [BrandSentSchema],

}, { timestamps: true });

export default mongoose.model("InstantApplyInvestor", InstantApplyInvestorSchema);