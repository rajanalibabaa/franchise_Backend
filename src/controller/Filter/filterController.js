import mongoose from "mongoose";
import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import { likeandshortlist } from "../BrandController/BrandListingController.js";

export const getAllBrandsAndFilter = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const id = req.query.id || null;

    // Get all filters from query parameters (changed from body to query)
    const {
      maincat,
      subcat,
      childcat,
      serchterm,
      country,
      state,
      district,
      city,
      investmentRange,
      modelType,
    } = req.query || {};

    const { likedBrands, shortListedBrands } = await likeandshortlist(id);

    console.log("Filters:", {
      maincat,
      subcat,
      childcat,
      serchterm,
      country,
      state,
      district,
      city,
      investmentRange,
      modelType,
    });

    // Build match conditions
    const match = {};

    // Text search for brandName or brandDescription
    if (serchterm) {
      match.$or = [
        { "brandDetails.brandName": 
          { $regex: serchterm, $options: "i" } 
        },
        {
          "franchiseDetails.franchiseDetails.brandDescription": {
            $regex: serchterm,$options: "i"}
        },
        {
          "franchiseDetails.franchiseDetails.brandCategories.main": {
            $regex: serchterm, $options: "i"}
        },
        {
          "franchiseDetails.franchiseDetails.brandCategories.sub": {
            $regex: serchterm,$options: "i"}
        },
        {
          "franchiseDetails.franchiseDetails.brandCategories.child": {
            $regex: serchterm, $options: "i"}
        },
        {
          "brandexpansionlocationdata.expansionLocationData.expansionLocations.domestic.locations.state":
            { $regex: serchterm, $options: "i" }
        },
        {
          "brandexpansionlocationdata.expansionLocationData.exansionLocations.international.state":
            { $regex: serchterm, $options: "i" }
        },
        {
          "brandexpansionlocationdata.expansionLocationData.expansionLocations.domestic.locations.district":
            { $regex: serchterm, $options: "i" }
        },
        {
          "brandexpansionlocationdata.expansionLocationData.expansionLocations.domestic.locations.city":
            { $regex: serchterm, $options: "i" }
        },
        {
          "brandexpansionlocationdata.expansionLocationData.expansionLocations.international.city":
            { $regex: serchterm, $options: "i" }
        },
      ];
    }

    // Category filters
    if (maincat)
      match["franchiseDetails.franchiseDetails.brandCategories.main"] = maincat;
    if (subcat)
      match["franchiseDetails.franchiseDetails.brandCategories.sub"] = subcat;
    if (childcat)
      match["franchiseDetails.franchiseDetails.brandCategories.child"] =childcat;

    // Investment range filter (for array of objects)
    if (investmentRange) {
      match["franchiseDetails.franchiseDetails.fico"] = {
        $elemMatch: { investmentRange: investmentRange },
      };
    }
    // Model type filter
    if (modelType) {
      match["franchiseDetails.franchiseDetails.fico.franchiseModel"] =
        modelType;
    }

    // Location filters - for both current outlets and expansion locations
    const locationConditions = [];

    if (country) {
      locationConditions.push({
        $or: [
          {
            "brandexpansionlocationdata.expansionLocationData.expansionLocations.international.country":
              country,
          },
          {
            "brandexpansionlocationdata.expansionLocationData.currentOutletLocations.international.country":
              country,
          },
        ],
      });
    }

    // State (domestic or international)
    if (state) {
      locationConditions.push({
        $or: [
          {
            "brandexpansionlocationdata.expansionLocationData.expansionLocations.domestic.locations.state":
              state,
          },
          {
            "brandexpansionlocationdata.expansionLocationData.expansionLocations.international.state":
              state,
          },
        ],
      });
    }

    if (district) {
      locationConditions.push({
        $or: [
          {
            "brandexpansionlocationdata.expansionLocationData.expansionLocations.domestic.locations.districts.district":
              district,
          },
          {
            "brandexpansionlocationdata.expansionLocationData.currentOutletLocations.domestic.locations.districts.district":
              district,
          },
        ],
      });
    }

    if (city) {
      locationConditions.push({
        $or: [
          {
            "brandexpansionlocationdata.expansionLocationData.expansionLocations.domestic.locations.districts.cities":
              city,
          },
          {
            "brandexpansionlocationdata.expansionLocationData.expansionLocations.international.city":
              city,
          },
        ],
      });
    }

    if (locationConditions.length > 0) {
      match.$and = (match.$and || []).concat(locationConditions);
    }

    const aggregationPipeline = [
      {
        $lookup: {
          from: "brandfranchisedetails",
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "franchiseDetails",
        },
      },
      {
        $lookup: {
          from: "branduploads",
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "uploads",
        },
      },
      {
        $lookup: {
          from: "brandexpansionlocationdatas",
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "brandexpansionlocationdata",
        },
      },
      {
        $unwind: {
          path: "$franchiseDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $unwind: { path: "$uploads", preserveNullAndEmptyArrays: true } },
      {
        $unwind: {
          path: "$brandexpansionlocationdata",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Apply match conditions
      ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),

      {
        $addFields: {
          isLiked: {
            $in: [
              "$_id",
              likedBrands.map((id) => new mongoose.Types.ObjectId(id)),
            ],
          },
          isShortListed: {
            $in: [
              "$_id",
              shortListedBrands.map((id) => new mongoose.Types.ObjectId(id)),
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          brandID: "$brandID",
          uuid: 1,
          isLiked: 1,
          isShortListed: 1,
          brandname: "$brandDetails.brandName",
          brandCategories: {
            $ifNull: [
              "$franchiseDetails.franchiseDetails.brandCategories",
              null,
            ],
          },
          brandDescription: {
            $ifNull: [
              "$franchiseDetails.franchiseDetails.brandDescription",null
            ],
          },
          fico: {
            $let: {
              vars: {
                data: { $arrayElemAt: ["$franchiseDetails.franchiseDetails.fico", 0] }
              },
              in: {
                investmentRange: "$$data.investmentRange",
                areaRequired: "$$data.areaRequired",
                franchiseModel: "$$data.franchiseModel"
              }
            }
          },
          
          logo: {
            $cond: {
              if: { $isArray: "$uploads.uploads.brandLogo" },
              then: { $arrayElemAt: ["$uploads.uploads.brandLogo", 0] },
              else: null,
            },
          },
          franchiseVideos: {
            $cond: {
              if: { $isArray: "$uploads.uploads.franchisePromotionVideo" },
              then: {
                $arrayElemAt: ["$uploads.uploads.franchisePromotionVideo", 0],
              },
              else: null,
            },
          },
        },
      },
      { $skip: skip },
      { $limit: limit },
    ];

    // Count total matching documents
    const countPipeline = [
      {
        $lookup: {
          from: "brandfranchisedetails",
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "franchiseDetails",
        },
      },
      {
        $lookup: {
          from: "brandexpansionlocationdatas",
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "brandexpansionlocationdata",
        },
      },
      {
        $unwind: {
          path: "$franchiseDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$brandexpansionlocationdata",
          preserveNullAndEmptyArrays: true,
        },
      },
      ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
      { $count: "total" },
    ];

    const [brands, countResult] = await Promise.all([
      BrandDetails.aggregate(aggregationPipeline),
      BrandDetails.aggregate(countPipeline),
    ]);

    const totalCount = countResult[0]?.total || 0;

    if (!brands || brands.length === 0) {
      return res.json(
        new ApiResponse(404, null, "No brands found matching the criteria")
      );
    }

    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return res.json(
      new ApiResponse(
        200,
        {
          brands,
          pagination: {
            total: totalCount,
            totalPages,
            currentPage: page,
            limit,
            hasNext,
            hasPrevious,
          },
        },
        "Brand data fetched successfully"
      )
    );
  } catch (error) {
    console.error("Error fetching brands:", error);
    return res.json(
      new ApiResponse(500, null, `Failed to fetch brands: ${error.message}`)
    );
  }
};
