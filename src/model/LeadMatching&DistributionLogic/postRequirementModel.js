import mongoose from "mongoose";

const postRequirementSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    investment: {
        type: Number,
        required: true,
    },
});

// Check if the model is already compiled
const PostRequirement =
    mongoose.models.PostRequirement || mongoose.model("PostRequirement", postRequirementSchema);

export default PostRequirement; 