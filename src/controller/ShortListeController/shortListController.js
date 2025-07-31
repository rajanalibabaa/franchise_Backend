import mongoose from "mongoose";
import ShortListed from "../../model/ShortList/shortListedModel.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";


export const postShortListed = async (req, res) => {
    const { id } = req.params;
    const { shortListedId } = req.body;
    const investor = req?.investorUser;
    const brand = req?.brandUser;

    try {
        // Validate authorization
        if (id !== investor?.uuid && id !== brand?.uuid) {
            return res.json(
                new ApiResponse(403, {}, "Unauthorized request")
            );
        }

        const brandToShortlist = await BrandDetails.findOne({ uuid: shortListedId });
        if (!brandToShortlist) {
            return res.json(
                new ApiResponse(404, {}, "Brand not found")
            );
        }

        // Check if already shortlisted
        const query = {
            brandOwnerId: brandToShortlist._id,
            $or: [
                { "ShortListedBy.investor.userId": investor?._id },
                { "ShortListedBy.brand.userId": brand?._id }
            ]
        };

        const existingShortlist = await ShortListed.findOne(query);

        if (existingShortlist) {
            await ShortListed.findByIdAndDelete(existingShortlist._id);
            return res.json(
                new ApiResponse(200, { action: 'removed' }, "Removed from shortlist")
            );
        }

        // Create new shortlist entry
        const shortlistData = {
            brandOwnerId: brandToShortlist._id,
            uuid: shortListedId, 
            ShortListedBy: {}
        };

        if (investor?.uuid === id) {
            shortlistData.ShortListedBy.investor = {
                userType: "investor",
                userId: investor._id
            };
        } else if (brand?.uuid === id) {
            shortlistData.ShortListedBy.brand = {
                userType: "brand",
                userId: brand._id
            };
        }

        const newShortlist = await ShortListed.create(shortlistData);

        if (!newShortlist) {
            return res.json(
                new ApiResponse(500, {}, "Failed to create shortlist")
            );
        }

        return res.json(
            new ApiResponse(200, { action: 'added' }, "Added to shortlist successfully")
        );

    } catch (error) {
        console.error("Shortlist error:", error);
        
        if (error.code === 11000) {
            return res.json(
                new ApiResponse(409, {}, "duplicate key")
            );
        }

        return res.json(
            new ApiResponse(500, {}, "Internal server error")
        );
    }
};


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