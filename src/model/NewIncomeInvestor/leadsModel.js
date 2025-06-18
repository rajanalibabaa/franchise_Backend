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
    enum: ['Below-50,000', 'Rs.50,000-2L', 'Rs.2L-5L', 'Rs.5L-10L', 'Rs.10L-20L', '20+Rs.20L-30L', 'Rs.30L-50L', 'Rs.50L-1Cr', 'Rs.1Cr-2Cr', 'Rs.2Cr-5Cr', 'Rs.5Cr-above']
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