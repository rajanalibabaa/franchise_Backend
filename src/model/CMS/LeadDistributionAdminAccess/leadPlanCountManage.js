import mongoose from "mongoose";

const LeadPlansCountManageSchema = new mongoose.Schema(
  {
    leadPlan: {
      type: Number,
      default: 0,
    },
    listingPlan: {
      type: Number,
      default: 0,
    },
    free: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("LeadPlansCountManage", LeadPlansCountManageSchema);