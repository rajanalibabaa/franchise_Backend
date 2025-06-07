// models/Investment.js
import mongoose from 'mongoose';
import uuid from '../../utils/uuid.js';

const investorLeadSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: () => uuid(),
    required: true,
    unique: true
  },
  investorEmail: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true
  },
  investorName: { 
    type: String, 
    required: true,
    trim: true
  },
  category: [{ main: { type: String }, sub: { type: String },child: { type: String } }],
  location: {
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true }
  },
  investmentRange: { 
    type: String, 
    required: true,
    // enum: ['1_2_crores', '5_10_lakhs', '2_5_crores', '5_10_crores', '10_20_crores', '20+_crores']
  },
  brandPerfectMatches: [{
    email: { type: String, trim: true, lowercase: true },
    companyName: { type: String, trim: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'BrandListing' }
  }],
  brandPartialMatches: [{
    email: { type: String, trim: true, lowercase: true },
    companyName: { type: String, trim: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'BrandListing' }
  }],
  matchedBrandsCount: {
    perfect: { type: Number, default: 0 },
    partial: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for better query performance
investorLeadSchema.index({ 'location.country': 1 });
investorLeadSchema.index({ 'location.state': 1 });
investorLeadSchema.index({ 'location.city': 1 });
investorLeadSchema.index({ 'category.child': 1 });
investorLeadSchema.index({ investmentRange: 1 });
investorLeadSchema.index({ createdAt: -1 });

const InvestorLead = mongoose.model('InvestorLead', investorLeadSchema);
export default InvestorLead;