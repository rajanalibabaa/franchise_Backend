import mongoose from "mongoose";

const UploadsSchema = new mongoose.Schema(
  {
    brandOwnerId: {
          type: mongoose.Schema.Types.ObjectId,
          unique: true,
          ref: 'BrandDetails',
          required: true
        },
    brandLogo: [String],
    exteriorOutlet: [String],
    franchisePromotionVideo: [String],
    gstCertificate: [String],
    interiorOutlet: [String],
    pancard: [String],
    businessPlan: [String],
    // awards: [
    //   {
    //     awardDescription: { type: String },
    //     awardImage: { type: String }
    //   }
    // ],
    awards: [{ type: String }],
    uuid: {
              type: String,
              default: uuid,
              unique: true,
              ref: 'BrandDetails',
    },
  },
  {
    timestamps: true
  }
);

export const Uploads = mongoose.model("Uploads", UploadsSchema);