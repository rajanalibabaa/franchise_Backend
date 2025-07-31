import mongoose from "mongoose";
import uuid from "../../utils/uuid.js";

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
  "Rs.5Cr-above",
];

const matchTypeEnum = [
  "perfect",
  "categoryAndInvest",
  "categoryAndLocation",
  "investmentAndLocation",
];

const instantApplyLeadSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: () => uuid(),
      required: true,
      unique: true,
    },
    investorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    investorName: {
      type: String,
      required: true,
      trim: true,
    },
    investorPhone: {
      type: String,
      required: true,
      trim: true,
    },
    category: [
      {
        main: { type: String },
        sub: { type: String },
        child: { type: String },
      },
    ],
    location: {
      state: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, required: true },
    },
    investmentRange: {
      type: String,
      required: true,
      enum: investmentRangeEnum,
    },
    planToInvest: { type: String },
    readyToInvest: { type: String },
    apply: {
      applyBy: {
        type: String,
        enum: ["Investor", "Brand", "other"],
        default: "other",
      },
      applyId: {
        type: String,
        default: "other",
      },
    },
    source: { type: String, default: "instantApply" },

    // For the initial brand that was directly applied to
    initialBrand: {
      brandId: {
        type: String, // Changed from ObjectId to String to accept UUIDs
        required: true,
      },
      brandName: { type: String },
      brandEmail: { type: String },
      brandLogo: { type: String },
      emailSent: { type: Boolean, default: false },
      emailSentAt: { type: Date },
      emailError: { type: String },
    },

    // For other matched brands (perfect/partial matches)
    brandMatches: [
      {
        email: { type: String, trim: true, lowercase: true, required: true },
        companyName: { type: String, trim: true, required: true },
        brandId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "BrandListing",
          required: true,
        },
        matchType: {
          type: String,
          enum: matchTypeEnum,
          required: true,
        },
        emailSent: { type: Boolean, default: false },
        emailSentAt: { type: Date },
        emailError: { type: String },
        contacted: { type: Boolean, default: false },
        contactDate: { type: Date },
        notes: { type: String },
      },
    ],

    matchedBrandsCount: {
      perfect: { type: Number, default: 0 },
      categoryAndInvest: { type: Number, default: 0 },
      categoryAndLocation: { type: Number, default: 0 },
      investmentAndLocation: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    
    status: {
      type: String,
      enum: ["new", "processing", "matched", "contacted", "closed", "failed"],
      default: "new",
    },
    
    emailStatus: {
      initialEmailSent: { type: Boolean, default: false },
      initialEmailError: { type: String },
      perfectMatchesSent: { type: Boolean, default: false },
      categoryAndInvestSent: { type: Boolean, default: false },
      categoryAndLocationSent: { type: Boolean, default: false },
      investmentAndLocationSent: { type: Boolean, default: false },
      lastEmailSentAt: { type: Date },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
instantApplyLeadSchema.index({ investorEmail: 1 });
instantApplyLeadSchema.index({ "location.state": 1 });
instantApplyLeadSchema.index({ "location.city": 1 });
instantApplyLeadSchema.index({ "location.district": 1 });
instantApplyLeadSchema.index({ "category.child": 1 });
instantApplyLeadSchema.index({ investmentRange: 1 });
instantApplyLeadSchema.index({ status: 1 });
instantApplyLeadSchema.index({ createdAt: -1 });

const InstantApplyLead = mongoose.model("InstantApplyLead", instantApplyLeadSchema);

export default InstantApplyLead;