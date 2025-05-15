// models/Investment.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const leadsSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
    required: true
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
    type: Number,
    required: true,
    min: [1000000, 'Investment amount cannot be negative']
  },
  brandPerfect: {
    type: [String],
    default: []
  },
  brandPartial: {
    type: [String],
    default: []
  },
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
leadsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create text index for search functionality
leadsSchema.index({
  investorEmail: 'text',
  category: 'text',
  location: 'text',
  brandPerfect: 'text',
  brandPartial: 'text'
});

const lead = mongoose.model('lead', leadsSchema);

module.exports = lead;