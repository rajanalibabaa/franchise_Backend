import mongoose from 'mongoose';
import uuid from '../../utils/uuid.js';

const PostRequirementSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuid, // Ensure uuid is a function if it generates unique IDs
    unique: true,
  },
  name: { type: String, required: true },
  address: { type: String, required: true },
  country: { type: String, required: true },
  pincode: { 
    type: String, 
    required: true, 
    match: /^[1-9][0-9]{5}$/, // Validate 6-digit Indian pincode
  },
  city: { type: String, required: true },
  state: { type: String, required: true },
  mobileNumber: { 
    type: String, 
    required: true, 
    match: /^[6-9][0-9]{9}$/, // Validate 10-digit Indian mobile number
  },
  whatsappNumber: { 
    type: String, 
    required: true, 
    match: /^[6-9][0-9]{9}$/, // Validate 10-digit Indian WhatsApp number
  },
  email: { 
    type: String, 
    required: true, 
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Validate email format
  },
  industryType: { type: String, required: true },
  investmentRange: {
    min: { type: Number, required: true }, // Changed to Number
    max: { type: Number, required: true }, // Changed to Number
  },
  floorAreaRequirement: { type: String },
  timelineToStart: { type: String, required: true },
  needLoan: { type: String, required: true },
});

export const PostRequirement = mongoose.model('PostRequirement', PostRequirementSchema);