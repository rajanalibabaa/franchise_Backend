import mongoose from "mongoose";
import uuid from "../../utils/uuid.js";

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
            default: uuid(),
            unique: true
        }
    },
    {
        timestamps: true
    }
);

const ShortListed = mongoose.model("ShortListed", ShortListedSchema);
export default ShortListed;