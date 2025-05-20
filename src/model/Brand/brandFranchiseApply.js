// models/formSubmission.model.js

import mongoose from 'mongoose';
import uuid from '../../utils/uuid.js';
const formSubmissionSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuid, // Ensure uuid is a function if it generates unique IDs
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
  brandName: { type: String }
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const instaApplyBrnadForm = mongoose.model('instaApplyBrnadForm', formSubmissionSchema);

export default instaApplyBrnadForm;
