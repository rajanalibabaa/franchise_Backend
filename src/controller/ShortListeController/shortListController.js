import mongoose from "mongoose";
import ShortListed from "../../model/ShortList/shortListedModel.js";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";


export const postShortListed = async (req,res) => {
    console.log(req.params)
    const { id } = req.params
    const { shortListedId } = req.body
    const investor = req?.investorUser;
    const brand = req?.brandUser;

   try {
     if (id !== investor?.uuid  &&  id !== brand?.uuid) {
         return res.json(
             new ApiResponse(403,{},"Unathorized request")
         )
     }
 
     const brandOwnerId = await BrandListing.findOne({uuid: shortListedId})
     if (!brandOwnerId) {
         return res.json(
             new ApiResponse(404,{},"Brand not found")
         )
     }
 
     console.log("brandOwnerId :",brandOwnerId)
 
     const exists = await ShortListed.findOne({
       $and: [
         { brandOwnerId: new mongoose.Types.ObjectId(brandOwnerId?._id) },
         {
           $or: [
             { "ShortListedBy.investor.userId": new mongoose.Types.ObjectId(investor?._id) },
             { "ShortListedBy.brand.userId": new mongoose.Types.ObjectId(brand?._id) },
           ]
         }
       ]
     });
 
     if (exists) {
         
         await ShortListed.findByIdAndUpdate(
             { _id : exists._id},
             {$set :{updatedAt : new Date()}},
             {new: true}
             
         )
 
         return res.json(
             new ApiResponse(200,{},"Short list already exists,updated the timestamp")
         )
     }
 
     
 
     if(investor?.uuid === id) {
 
         
         const newshortListed = ShortListed.create({
             brandOwnerId : brandOwnerId?._id,
             ShortListedBy:{
                 investor: {
                     userType: "investor",
                     userId: investor?._id
                 }
             }
         })
 
         if (!newshortListed) {
             return res.json(
                 new ApiResponse(500,{},"Failed to create short list")
             )
         }
 
         return res.json(
             new ApiResponse(200,{},"Short list created successfully")
         )
         
     }
     if(brand?.uuid === id) {
         const newshortListed = ShortListed.create({
             brandOwnerId : brandOwnerId?._id,
             ShortListedBy:{
                 brand: {
                     userType: "brand",
                     userId: brand?._id
                 }
             }
         })
 
         if (!newshortListed) {
             return res.json(
                 new ApiResponse(500,{},"Failed to create short list")
             )
         }
 
         return res.json(
             new ApiResponse(200,{},"Short list created successfully")
         )
     }
   } catch (error) {
    console.error(error)
   }

}


export const getShortListedById = async (req, res) => {
    try {
        console.log(req.params);
        const { id } = req.params;
        const investor = req?.investorUser;
        const brand = req?.brandUser;

        if (id !== investor?.uuid  &&  id !== brand?.uuid) {
        return res.json(
            new ApiResponse(403,{},"Unathorized request")
        )
    }

        const shortListed = await ShortListed.find({
            $or: [
                { "ShortListedBy.investor.userId": investor?._id },
                { "ShortListedBy.brand.userId": brand?._id },
            ]
        })
        .populate("brandOwnerId")
        .populate("ShortListedBy.investor.userId")
        .populate("ShortListedBy.brand.userId");

        console.log(shortListed);
        return res.json(
            new ApiResponse(200, shortListed, "Short listed brands fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching short listed brands:", error);
        return res.status(500).json(
            new ApiResponse(500, null, "Internal Server Error")
        );
    }
};


export const getShortListedDataForOwner = async( req,res) => {
    const { id } = req.params;
    const brand = req?.brandUser;
    const investor = req?.investorUser;

    if (id !== investor?.uuid  &&  id !== brand?.uuid) {
        return res.json(
            new ApiResponse(403,{},"Unathorized request")
        )
    }

    const shortListed = await ShortListed.find({
            brandOwnerId: new mongoose.Types.ObjectId( brand?._id)
        }).populate("ShortListedBy.investor.userId")
        .populate("ShortListedBy.brand.userId");

    if (!shortListed && shortListed.length === 0) {
        return res.json(
            new ApiResponse(404,{},"No body has short listed your brand yet")
        )
    }

    return res.json(
            new ApiResponse(200, shortListed, "Short listed brands fetched successfully")
        );

}

export const deleteShortListedById = async (req,res) => {
    const { id } = req.params;
    const investor = req?.investorUser;
    const brand = req?.brandUser;
    const { shortListedId } = req.body;

    if (id !== investor?.uuid  &&  id !== brand?.uuid) {
        return res.json(
            new ApiResponse(403,{},"Unathorized request")
        )
    }

    if (!shortListedId) {
       return res.json(
            new ApiResponse(404,{},"shortListedId is required")
        ) 
    }

    const shortListed = await ShortListed.findOneAndDelete({
        uuid: shortListedId
    })
    if (!shortListed) {
       return res.json(
            new ApiResponse(404,{},"Short list not found")
        ) 
    }
    return res.json(
            new ApiResponse(200,{},"Short list deleted successfully")
        ) 
}