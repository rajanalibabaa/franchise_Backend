import mongoose from "mongoose";

const MahalSchema = new mongoose.Schema(
    {
        name: {
            type : String,
            required : true
        },
        ph: {
            type : String,
            required : true
        },
        title: {
            type : String,
        },
        mahal: {
            type : String,
        },
        startDate: {
            type : String,
        },
        endDate: {
            type : String,
        },
        startTime: {
            type : String,
        },
        endTime: {
            type : String,
        },
        date: {
            type : String,
        },
        uuid : {
            type : String,
            required : true
        }
    },
    {
        timestamps: true
    }
)

export const Mahal = mongoose.model("Mahal",MahalSchema)