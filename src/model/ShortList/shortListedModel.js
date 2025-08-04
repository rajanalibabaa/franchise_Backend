import mongoose from "mongoose";


const ShortListedSchema = new mongoose.Schema(
    {
        brandOwnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BrandListing",
        },
        ShortListedBy: {
            investor: {
                userType: {
                    type: String
                },
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "InvsRegister",
                }
            },
            brand: {
                userType: {
                    type: String
                },
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "BrandListing",
                }
            }
        },
        uuid: {
            type: String,
            unique: true
        }
    },
    {
        timestamps: true
    }
);

const ShortListed = mongoose.model("ShortListed", ShortListedSchema);
export default ShortListed;