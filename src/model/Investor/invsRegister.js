import mongoose from 'mongoose';
import uuid from '../../utils/uuid.js'

const invsRegisterSchema = new mongoose.Schema({
  uuid: {
    type:String, default: uuid,unique: true,
  },  
  // Personal Info
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  mobileNumber: { type: String, required: true, trim: true },
  whatsappNumber: { type: String, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },

  // Address Info
  address: { type: String, required: true },
  country: { type: String, required: true },
  pincode: { type: String, required: true },
  state: { type: String },
  district: { type: String },
  city: { type: String },

  // Investment Info
  category: {
    type: String,
    enum: ['Investor', 'Buyer', 'Seller', 'Agent', 'Other'],
    required: true,
  },
  investmentRange: {
    type: String,
    required: true
  },  
  capital: { type: Number, required: true },
  occupation: { type: String },
  type: {
    type: String,
    enum: ['Residential', 'Commercial', 'Industrial', 'Agricultural'],
    required: true,
  },
  lookingFor: { type: String },
  ownProperty: { type: Boolean, required: true },

  createdAt: {
    type: Date,
    default: Date.now,
  },

    
});

export const InvsRegister = mongoose.model('InvsRegister', invsRegisterSchema);