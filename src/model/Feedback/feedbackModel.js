import mongoose from "mongoose";

const invFeedbackSchema = new mongoose.Schema({
 topic : { type: String, required: true },
feedback :{ type: String, required: true},
rating : { type: Number, required: true, min: 1, max: 5 },
    date: { type: Date, default: Date.now },
});

export const InvFeedback = mongoose.model("InvFeedback", invFeedbackSchema);  