// model/NewIncomeInvestor/ManualleadSchema.js
import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  main: { type: String, required: true },
  sub: { type: String, required: true },
  child: { type: String, default: '' }
});

const ManualLeadSchema = new mongoose.Schema(
  {
    uuid: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String },
    city: { type: String },
    investmentRange: { type: String, required: true },
    planToInvest: { type: String, required: true },
    readyToInvest: { type: String, required: true },
    categories: { type: [CategorySchema], required: true },
    brandName: { type: String, default: 'Manual Entry' },
    brandId: { type: String, default: null },
    notes: { type: String, default: '' },
    tags: [{ type: String }],
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['new', 'contacted', 'qualified', 'converted'], default: 'new' },
    isActive: { type: Boolean, default: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('ManualLead', ManualLeadSchema);
