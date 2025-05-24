import mongoose from "mongoose";

const favoriteBrandsInvestorSchema = new mongoose.Schema(
    {
        InvestorUserId:{type:mongoose.Schema.Types.ObjectId,ref:"InvsRegister",required:true},
        favoriteBrands:[{
            branduuid:{type:mongoose.Schema.Types.ObjectId,ref:"BrandListing",required:true},
            addedAt:{type:Date,default:Date.now}
        }],
        createdAt: { type: Date, default: Date.now },
        
    },
    {
        timestamps: true, // adds createdAt and updatedAt
    }
);

const FavoriteBrandsInvestor = mongoose.model(
    "favoriteBrandsInvestor",
    favoriteBrandsInvestorSchema
);
export default FavoriteBrandsInvestor;