 import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
    name:{ 
        type: String,
        required: true,
        trim: true
    },
    category:{
        type: String,
        required: true,
        trim: true
    },
    targetLocations:{
        type: [String],
        required: true,
        trim: true
    },
    minInvestment:{
        type: Number,
        required: true
    },
    maxInvestment:{
        type: Number,
        required: true
    },
    email :{
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    }
});


const Brand = mongoose.model('Brand', brandSchema);
export default Brand;






















