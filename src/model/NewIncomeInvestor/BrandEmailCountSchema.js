import mongoose from "mongoose";

const EmailRecordSchema = new mongoose.Schema({
  investorEmail: { type: String, required: true },
  sentAt: { type: Date, default: Date.now, required: true }, 
  month: { type: Number, required: true, min: 1, max: 12 }, 
  day: { type: Number, required: true, min: 1, max: 31 },   
  year: { type: Number, required: true },                 
});

// Sub-schema for individual premium offer records sent for paid leads
const PremiumOfferRecordSchema = new mongoose.Schema({
  investorEmail: { type: String, required: true },
  sentAt: { type: Date, default: Date.now, required: true },
  month: { type: Number, required: true, min: 1, max: 12 }, 
  day: { type: Number, required: true, min: 1, max: 31 },   
  year: { type: Number, required: true },                  
});

// Main schema to track email counts per brand per month/year
const BrandEmailCountSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.UUID, 
      ref: "BrandListing",             
      required: true,
    },
    brandName: { type: String, required: true },
                     
    
    // Fields for Free Leads
    emailCount: { type: Number, default: 0 },
    emailRecords: [EmailRecordSchema], // Array of detailed records for free emails sent

    // Fields for Premium Offers / Paid Leads
    premiumOfferCount: { type: Number, default: 0 },
    premiumOfferRecords: [PremiumOfferRecordSchema], // Array of detailed records for premium offer emails sent
  },
  { timestamps: true } // Adds createdAt and updatedAt timestamps
);

// Unique index to ensure only one document per brand per month/year
BrandEmailCountSchema.index({ brandId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model("BrandEmailCount", BrandEmailCountSchema);
