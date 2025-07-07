

import mongoose from 'mongoose';

const instaApplyBrandFormSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  mobileNumber: {
    type: String
  },
  state: {
    type: String
  },
  district: {
    type: String
  },
  city: {
    type: String
  },
  investmentRange: {
    type: String
  },
  planToInvest: {
    type: String
  },
  readyToInvest: {
    type: String
  },
  brandId: {
    type: String,
    required: true
  },
  brandName: {
    type: String,
  },
  brandEmail: {
    type: String,
  },
  brandLogo: {
    type: String,
  },

  apply : {

    applyBy: {
      type: String,
      enum: ['Investor', 'Brand','other'],
      // required: true,
      default:"other"
    },
    applyId :{
      type: String,
      default:"other"
    }

  }
  
}, {
  timestamps: true
});

export const instantApply = mongoose.model('instantApply', instaApplyBrandFormSchema);

// export default instaApplyBrandForm;