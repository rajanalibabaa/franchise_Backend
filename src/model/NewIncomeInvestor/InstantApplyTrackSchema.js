import mongoose from "mongoose";

const BrandBatchSchema = new mongoose.Schema({
  batch: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("BrandBatch", BrandBatchSchema);
