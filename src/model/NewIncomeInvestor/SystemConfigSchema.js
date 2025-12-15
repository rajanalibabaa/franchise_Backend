import mongoose from "mongoose";

const SystemConfigSchema = new mongoose.Schema({
  batchSize: {
    type: Number,
    default: 7,
    min: 1,
    required: true
  },
  maxEmailsPerMonth: {
    type: Number,
    default: 5,
    min: 1,
    required: true
  },
  maxFreeLeadsPerMonth: {
    type: Number,
    default: 20,
    min: 0
  },
  maxFreeLeadsPerBrand: {
    type: Number,
    default: 5,
    min: 0
  },
  updatedBy: {
    type: String,
    default: "system",
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Add index on updatedAt for efficient sorting
SystemConfigSchema.index({ updatedAt: -1 });

// Export the model
export default mongoose.model("SystemConfig", SystemConfigSchema);
