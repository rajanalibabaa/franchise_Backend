
import mongoose from "mongoose";

const SystemConfigSchema = new mongoose.Schema({
  batchSize: {
    type: Number,
    default: 7,
    min: 1,
  },
  maxEmailsPerMonth: {
    type: Number,
    default: 5,
    min: 1,
  },
  updatedBy: {
    type: String, // Admin name or ID
    default: "system",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("SystemConfig", SystemConfigSchema);
