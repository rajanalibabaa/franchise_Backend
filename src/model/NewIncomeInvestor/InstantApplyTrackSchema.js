import mongoose from "mongoose";

const BrandBatchSchema = new mongoose.Schema({
  batch: {
    type: Number,
    default: 0,
  },
  isFreeLeadsBrandPaused: {
    type: Boolean,
    default: false,
  },
  isPaidLeadsBrandPaused: {
    type: Boolean,
    default: false,
  },
  isPaidCategoryInvestmentrangeLocationLeadsPaused: {
    type: Boolean,
    default: false,
  },
  isPaidCategoryInvestmentrangePaused: {
    type: Boolean,
    default: false,
  },
  isPaidCategoryLocationPaused: {
    type: Boolean,
    default: false,
  },
  isPaidLocationInvestmentRangeLeadsPaused: {
    type: Boolean,
    default: false,
  },
  isDistrictMatchPaused: {
    type: Boolean,
    default: false,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("BrandBatch", BrandBatchSchema);
