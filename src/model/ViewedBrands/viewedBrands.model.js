import mongoose from "mongoose";


const viewedSchema = new mongoose.Schema(
    {
        brandUserID : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "BrandListing",
            require : true
        } ,
        viewedByInvestors : [{
            InvestorID:{type:mongoose.Schema.Types.ObjectId,ref:"InvsRegister",required:true},
            addedAt:{type:Date,default:Date.now},
            _id:false 
        }],
        viewedByBrands : [{
            BrandID:{type:mongoose.Schema.Types.ObjectId,ref:"BrandListing",required:true},
            addedAt:{type:Date,default:Date.now},
            _id:false 
        }]
    },
    {
        timestamps: true
    }
)

export const ViewedToBrands = mongoose.model("ViewedToBrands",viewedSchema)


const viewedInvestorsSchema = new mongoose.Schema(
    {
        InvestorUserId:{type:mongoose.Schema.Types.ObjectId,ref:"InvsRegister",required:true},
        viewedByInvestors : [{
            BrandID:{type:mongoose.Schema.Types.ObjectId,ref:"BrandListing",required:true},
            addedAt:{type:Date,default:Date.now},
            _id:false 
        }]
    },
    {
        timestamps: true
    }
)

export const ViewedBrandsByInvestor = mongoose.model("ViewedBrandsByInvestor",viewedInvestorsSchema)

const viewedBrandsSchema = new mongoose.Schema(
    {
        brandUserID : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "BrandListing",
            require : true
        } ,
        viewedByBrands : [{
            BrandID:{type:mongoose.Schema.Types.ObjectId,ref:"BrandListing",required:true},
            addedAt:{type:Date,default:Date.now},
            _id:false 
        }]
    },
    {
        timestamps: true
    }
)

export const ViewedBrandsByBrands = mongoose.model("ViewedBrandsByBrands",viewedBrandsSchema)