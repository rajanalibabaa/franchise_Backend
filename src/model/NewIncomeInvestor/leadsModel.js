// models/Investment.js
import mongoose from 'mongoose';
import uuid from '../../utils/uuid.js'

const leadsSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: () => uuid(),
    required: true
  },
  investorName :{
     type: String,
  },
  investorEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  category: {
    type: String,
    required: true,
    enum: [ ],
    default: 'Other'
  },
  location: {
    type: String,
    required: true
  },
  investmentAmount: {
    type: String,
    required: true,
  
  },
   brandPerfectMatches: [{
      email: String,
      companyName: String
    }],
    brandPartialMatches: [{
      email: String,
      companyName: String
    }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
// leadsSchema.pre('save', function(next) {
  // this.updatedAt = Date.now();
  // next();
// });

// Create text index for search functionality
// leadsSchema.index({
  // investorEmail: 'text',
  // category: 'text',
  // location: 'text',
  // brandPerfect: 'text',
  // brandPartial: 'text'
// });
// 
const investerRegisterleadsSchema = mongoose.model('lead', leadsSchema);

export default investerRegisterleadsSchema; 