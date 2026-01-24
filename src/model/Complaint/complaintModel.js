import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    complaint: { type: String, required: true },
    ownerId: { type: String, required: true },
    userType: { type: String, required: true, enum: ["investor", "brand"] },
  },
  {
    timestamps: true,
  },
);

export const Complaint = mongoose.model("Complaint", complaintSchema);
