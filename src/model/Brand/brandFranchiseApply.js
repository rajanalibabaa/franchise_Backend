import mongoose from 'mongoose';
import uuid from '../../utils/uuid.js';


const formSubmissionSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuid,
      unique: true,
    },
    fullName: { type: String, required: true },
    location: { type: String, required: true },
    franchiseModel: { type: String, required: true },
    franchiseType: { type: String, required: true },
    investmentRange: { type: String, required: true },
    planToInvest: { type: String, required: true },
    readyToInvest: { type: String, required: true },
    brandId: { type: String, required: true },
    brandName: { type: String },
    brandEmail: { type: String },        // Added
    investorEmail: { type: String ,required:true},     // Added
    mobileNumber: { type: String,required:true},      // Added
  },
  {
    timestamps: true,
  }
);

const instaApplyBrandForm = mongoose.model('instaApplyBrandForm', formSubmissionSchema);

export default instaApplyBrandForm;