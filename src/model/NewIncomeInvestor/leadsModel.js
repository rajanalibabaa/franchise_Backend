import mongoose from 'mongoose';
import uuid from '../../utils/uuid.js';

const investmentRangeEnum = [
  'Below-50,000', 
  'Rs.50,000-2L', 
  'Rs.2L-5L', 
  'Rs.5L-10L', 
  'Rs.10L-20L', 
  'Rs.20L-30L', 
  'Rs.30L-50L', 
  'Rs.50L-1Cr', 
  'Rs.1Cr-2Cr', 
  'Rs.2Cr-5Cr', 
  'Rs.5Cr-above'
];

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
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  investorName: { 
    type: String, 
    required: true,
    trim: true
  },
  category: [{ 
    main: { type: String, required: true }, 
    sub: { type: String, required: true },
    child: { type: String, required: true } 
  }],
  location: {
    country: { type: String, required: true },
    state: { type: String, required: function() { return this.locationType === 'domestic'; } },
    city: { type: String, required: true },
    district: { type: String, required: function() { return this.locationType === 'domestic'; } }
  },
  locationType: {
    type: String,
    enum: ['domestic', 'international'],
    required: true
  },
  investmentRange: { 
    type: String, 
    required: true,
    enum: investmentRangeEnum
  },
  brandPerfectMatches: [{
    email: { type: String, trim: true, lowercase: true },
    companyName: { type: String, trim: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'BrandListing' },
    contacted: { type: Boolean, default: false },
    contactDate: { type: Date },
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date }
  }],
  brandPartialMatches: [{
    email: { type: String, trim: true, lowercase: true },
    companyName: { type: String, trim: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'BrandListing' },
    contacted: { type: Boolean, default: false },
    contactDate: { type: Date },
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date }
  }],
  matchedBrandsCount: {
    perfect: { type: Number, default: 0 },
    partial: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['new', 'processing', 'matched', 'contacted', 'closed'],
    default: 'new'
  },
  emailStatus: {
    perfectMatchesSent: { type: Boolean, default: false },
    partialMatchesSent: { type: Boolean, default: false },
    lastEmailSentAt: { type: Date }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
investorLeadSchema.index({ 'investorEmail': 1 });
investorLeadSchema.index({ 'location.country': 1 });
investorLeadSchema.index({ 'location.state': 1 });
investorLeadSchema.index({ 'location.city': 1 });
investorLeadSchema.index({ 'location.district': 1 });
investorLeadSchema.index({ 'category.child': 1 });
investorLeadSchema.index({ investmentRange: 1 });
investorLeadSchema.index({ status: 1 });
investorLeadSchema.index({ createdAt: -1 });

const InvestorLead = mongoose.model('InvestorLead', investorLeadSchema);
export default InvestorLead;