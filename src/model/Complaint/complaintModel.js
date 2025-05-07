import mongoose from "mongoose";    

const complaintSchema = new mongoose.Schema({
    topic: { type: String, required: true },
    complaint: { type: String, required: true },
    date: { type: Date, default: Date.now },
})

export const Complaint = mongoose.model("Complaint", complaintSchema);

