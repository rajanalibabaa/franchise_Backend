import mongoose from "mongoose";
import ShortListed from "../../model/ShortList/shortListedModel.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import uuid from "../../utils/uuid.js";

export const postShortListed = async (req, res) => {
    const { id } = req.params;
    const { shortListedId } = req.body;
    const investor = req?.investorUser;
    const brand = req?.brandUser;
    const  generateUUID = uuid()

    try {
        if (id !== investor?.uuid && id !== brand?.uuid) {
            return res.status(403).json(
                new ApiResponse(403, {}, "Unauthorized request")
            );
        }

        if (!shortListedId) {
            return res.status(400).json(
                new ApiResponse(400, {}, "shortListedId is required")
            );
        }

        const brandToShortlist = await BrandDetails.findOne({ uuid: shortListedId });
        if (!brandToShortlist) {
            return res.status(404).json(
                new ApiResponse(404, {}, "Brand not found")
            );
        }

        const query = {
            brandOwnerId: brandToShortlist._id,
            $or: []
        };

        if (investor) {
            query.$or.push({ "ShortListedBy.investor.userId": investor._id });
        }
        if (brand) {
            query.$or.push({ "ShortListedBy.brand.userId": brand._id });
        }

        if (query.$or.length === 0) {
            return res.status(403).json(
                new ApiResponse(403, {}, "No valid user found for shortlisting")
            );
        }

        const existingShortlist = await ShortListed.findOne(query);

        if (existingShortlist) {
            await ShortListed.findByIdAndDelete(existingShortlist._id);
            return res.status(200).json(
                new ApiResponse(200, { action: 'removed' }, "Removed from shortlist")
            );
        }

        const shortlistData = {
            uuid:generateUUID , // ✅ Explicit UUID to avoid E11000
            brandOwnerId: brandToShortlist._id,
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
        return res.status(201).json(
            new ApiResponse(201, { action: 'added' }, "Added to shortlist successfully")
        );

    } catch (error) {
        console.error("Shortlist error:", error);

        if (error.code === 11000) {
            return res.status(409).json(
                new ApiResponse(409, {}, "This item is already in your shortlist")
            );
        }

        return res.status(500).json(
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