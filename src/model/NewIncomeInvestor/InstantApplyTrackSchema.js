import mongoose from "mongoose";

const BrandBatchSchema = new mongoose.Schema({
  brandId: { type:String, ref: "BrandListing" }
    , // Reference to the brand
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
