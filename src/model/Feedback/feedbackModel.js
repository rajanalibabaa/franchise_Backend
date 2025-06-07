import mongoose from "mongoose";

const invFeedbackSchema = new mongoose.Schema(
    {
        topic : { type: String, required: true },
        feedback :{ type: String, required: true},
        rating : { type: Number, required: true, min: 1, max: 5 },
        ownerId: { type: String, required: true },
        userType: { type: String, required: true, enum: ['investor', 'brand'], },
    },
    {
        timestamps:true
    }
);

export const InvFeedback = mongoose.model("InvFeedback", invFeedbackSchema);  