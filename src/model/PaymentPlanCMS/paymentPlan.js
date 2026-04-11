import mongoose from "mongoose";


const packageSchema = new mongoose.Schema({
  investmentRange: {
    type: String
  },
  validityDays: {
    type: Number
  },
  amount: {
    type: Number,
    required: true
  },
  totalLeads: {
    type: Number,
    required: true
  }
   // dynamic states pricing
}, { _id: false });


const planSchema = new mongoose.Schema({
  planName: {
    type: String, // BASIC PLAN / ADVANCE PLAN / GROWTH PLAN
    required: true
  },

  packages: [packageSchema]
}, { timestamps: true });


export default mongoose.model("Plan", planSchema);