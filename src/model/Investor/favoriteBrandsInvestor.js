import mongoose from "mongoose";

const favoriteBrandsInvestorSchema = new mongoose.Schema(
    {
        InvestorUserId:{type:mongoose.Schema.Types.ObjectId,ref:"InvsRegister",required:true},
        favoriteBrands:[{
            brandID:{type:mongoose.Schema.Types.ObjectId,ref:"BrandListing",required:true},
            addedAt:{type:Date,default:Date.now},
            _id:false
        }],
        createdAt: { type: Date, default: Date.now },
        
    },
    {
        timestamps: true, // adds createdAt and updatedAt
    }
);

export const FavoriteBrandsLikedByInvestor = mongoose.model(
    "FavoriteBrandsLikedByInvestor",
    favoriteBrandsInvestorSchema
);

const favoriteBrandsSchema = new mongoose.Schema(
    {
        brandUserId:{type:mongoose.Schema.Types.ObjectId,ref:"BrandListing",required:true},
        favoriteBrandByInvestors:[{
            investorID:{type:mongoose.Schema.Types.ObjectId,ref:"InvsRegister",required:true},
            addedAt:{type:Date,default:Date.now},
             _id:false
        }],
        createdAt: { type: Date, default: Date.now },
        
    },
    {
        timestamps: true, // adds createdAt and updatedAt
    }
);

export const FavoriteBrands = mongoose.model(
    "FavoriteBrands",
    favoriteBrandsSchema
);