import mongoose from "mongoose";

const EmailRecordSchema = new mongoose.Schema({
  investorEmail: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
});

const PremiumOfferRecordSchema = new mongoose.Schema({
  investorEmail: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
});

const BrandEmailCountSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BrandListing",
      required: true,
    },
    brandName: { type: String, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    emailCount: { type: Number, default: 0 },
    emailRecords: [EmailRecordSchema],
    premiumOfferCount: { type: Number, default: 0 }, // New field
    premiumOfferRecords: [PremiumOfferRecordSchema], // New field
  },
  { timestamps: true }
);

BrandEmailCountSchema.index({ brandId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model("BrandEmailCount", BrandEmailCountSchema);
