import mongoose from "mongoose";

const adminVideoAdvertiseSchema = new mongoose.Schema(
  {
    title: {
        type: String,
        
    },
    description: {
        type: String,   
    },
    videoUrl: {
        type: String,
    },
    thumbnailUrl: {
        type: String,
    },
    uuid:{
        type: String,
        unique: true,
        required: true,
    }
    
  },
  {
    timestamps: true,
  }
);

export const AdminVideoAdvertiseSchema = mongoose.model("AdminVideoAdvertiseSchema", adminVideoAdvertiseSchema);








