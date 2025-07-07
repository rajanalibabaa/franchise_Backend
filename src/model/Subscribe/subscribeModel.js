
import mongoose from "mongoose";


const subscribeSchema = new mongoose.Schema(
    {
        email : {
            type: String,
            required: true,
        }
    },
    {
        timestamps:true
    }
)

export const SubscribeModel = mongoose.model("SubscribeModel",subscribeSchema)