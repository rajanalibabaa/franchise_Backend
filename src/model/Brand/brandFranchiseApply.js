

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
  location: {
    type: String
  },
  franchiseModel: {
    type: String
  },
  franchiseType: {
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
    // required: true
  },
  brandName: {
    type: String
  },
  brandEmail: {
    type: String
  },
  brandLogo:[{
    type: String
  }],
  apply : {

    applyBy: {
    type: String,
    enum: ['Investor', 'Brand'],
    required: true
  },
  investor_ID: {
    type: String,
    required: function () {
      return this.applyBy === 'Investor';
    }
  },
  investorEmail: {
    type: String,
    required: function () {
      return this.applyBy === 'Investor';
    }
  },
  brand_ID: {
    type: String,
    required: function () {
      return this.applyBy === 'Brand';
    }
  },
  mobileNumber: {
    type: String,
    required: true
  }
  },
  
}, {
  timestamps: true
});

export const instantApply = mongoose.model('instantApply', instaApplyBrandFormSchema);

// export default instaApplyBrandForm;