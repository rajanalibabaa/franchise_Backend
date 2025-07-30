import mongoose from "mongoose";

const UploadsSchema = new mongoose.Schema(
  {
    brandOwnerId: {
          type: String,
          unique: true,
          ref: 'BrandDetails',
          required: true
        },
    uploads:{
    brandLogo: [String],
    exteriorOutlet: [String],
    franchisePromotionVideo: [String],
    gstCertificate: [String],
    interiorOutlet: [String],
    pancard: [String],
    businessPlan: [String],
    awards: [
      {
        awardDescription: { type: String },
        awardImage: { type: String },
        _id:false
      },
      
    ],}
   
  },
  {
    timestamps: true
  }
);

export const BrandUploads = mongoose.model("BrandUploads", UploadsSchema);