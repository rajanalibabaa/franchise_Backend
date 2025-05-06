import mongoose from 'mongoose';
import uuid from '../../utils/uuid.js';


const PostRequirementSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuid,
    unique: true,
  },
  name: { type: String, required: true },
  address: { type: String, required: true },
  country: { type: String, required: true },
  pincode: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  whatsappNumber: { type: String, required: true },
  email: { type: String, required: true },
  industryType: { type: String, required: true },
  investmentRange: {min: { type: String, required: true },max: { type: String, required: true }},
  floorAreaRequirement: { type: String },
  timelineToStart: { type: String, required: true },
  needLoan: { type: String, required: true }
});

export const PostRequirement = mongoose.model('PostRequirement', PostRequirementSchema);
