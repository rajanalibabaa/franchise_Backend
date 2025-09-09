import mongoose from "mongoose";
import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { InvsRegister } from "../../model/Investor/invsRegister.js";
import {
  ViewedBrandsByBrands,
  ViewedBrandsByInvestor,
  ViewedToBrands,
} from "../../model/ViewedBrands/viewedBrands.model.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import { likeandshortlist } from "../BrandController/BrandListingController.js";

export const postViewBrands = async (req, res) => {
  try {
    const paramsID = req.params.id;
    const viewedID = req.body.viewedID;
    const investor = req.investorUser;
    const brand = req.brandUser;

    console.log("view :", viewedID);

    if (paramsID !== investor?.uuid && paramsID !== brand?.uuid) {
      return res.json(new ApiResponse(403, {}, "Unauthorized request"));
    }

    const targetBrand = await BrandDetails.findOne({ uuid: viewedID });
    if (!targetBrand) {
      return res.json(new ApiResponse(404, {}, "Target brand not found"));
    }

    // === Investor Viewing a Brand ===
    if (investor?.uuid && paramsID === investor.uuid) {
      const existingInvestorView = await ViewedBrandsByInvestor.findOne({
        InvestorUserId: investor._id,
        "viewedByInvestors.BrandID": targetBrand._id,
      });

      if (existingInvestorView) {
        await ViewedBrandsByInvestor.updateOne(
          {
            InvestorUserId: investor._id,
            "viewedByInvestors.BrandID": targetBrand._id,
          },
          { $set: { "viewedByInvestors.$.addedAt": new Date() } }
        );
      } else {
        await ViewedBrandsByInvestor.findOneAndUpdate(
          { InvestorUserId: investor._id },
          {
            $push: {
              viewedByInvestors: {
                BrandID: targetBrand._id,
                addedAt: new Date(),
              },
            },
          },
          { upsert: true, new: true }
        );
      }

      // Update the brand's record of being viewed
      const existingBrandViewRecord = await ViewedToBrands.findOne({
        brandUserID: targetBrand._id,
        "viewedByInvestors.InvestorID": investor._id,
      });

      if (existingBrandViewRecord) {
        await ViewedToBrands.updateOne(
          {
            brandUserID: targetBrand._id,
            "viewedByInvestors.InvestorID": investor._id,
          },
          { $set: { "viewedByInvestors.$.addedAt": new Date() } }
        );
      } else {
        await ViewedToBrands.findOneAndUpdate(
          { brandUserID: targetBrand._id },
          {
            $push: {
              viewedByInvestors: {
                InvestorID: investor._id,
                addedAt: new Date(),
              },
            },
          },
          { upsert: true, new: true }
        );
      }

      return res.json(
        new ApiResponse(200, {}, "Viewed brand successfully recorded")
      );
    }

    // === Brand Viewing Another Brand ===
    if (brand?.uuid && paramsID === brand.uuid) {
      const existingBrandView = await ViewedBrandsByBrands.findOne({
        brandUserID: brand._id,
        "viewedByBrands.BrandID": targetBrand._id,
      });

      if (existingBrandView) {
        await ViewedBrandsByBrands.updateOne(
          { brandUserID: brand._id, "viewedByBrands.BrandID": targetBrand._id },
          { $set: { "viewedByBrands.$.addedAt": new Date() } }
        );
      } else {
        await ViewedBrandsByBrands.findOneAndUpdate(
          { brandUserID: brand._id },
          {
            $push: {
              viewedByBrands: {
                BrandID: targetBrand._id,
                addedAt: new Date(),
              },
            },
          },
          { upsert: true, new: true }
        );
      }

      const existingTargetBrandView = await ViewedToBrands.findOne({
        brandUserID: targetBrand._id,
        "viewedByBrands.BrandID": brand._id,
      });

      if (existingTargetBrandView) {
        await ViewedToBrands.updateOne(
          { brandUserID: targetBrand._id, "viewedByBrands.BrandID": brand._id },
          { $set: { "viewedByBrands.$.addedAt": new Date() } }
        );
      } else {
        await ViewedToBrands.findOneAndUpdate(
          { brandUserID: targetBrand._id },
          {
            $push: {
              viewedByBrands: {
                BrandID: brand._id,
                addedAt: new Date(),
              },
            },
          },
          { upsert: true, new: true }
        );
      }

      return res.json(
        new ApiResponse(200, {}, "Viewed brand successfully recorded")
      );
    }

    return res.json(new ApiResponse(400, {}, "Invalid request"));
  } catch (err) {
    console.error("Error in postViewBrands:", err);
    return res.json(new ApiResponse(500, {}, "Internal server error"));
  }
};

export const getAllViewBrandByID = async (req, res) => {
  try {
    const { id } = req.params;
    const investor = req.investorUser;
    const brand = req.brandUser;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const main = req.query.main;

    const { likedBrands, shortListedBrands } = await likeandshortlist(id);

    // ✅ Collect viewed brand IDs
    let brandIds = [];
    if (investor && investor._id) {
      const viewedData = await ViewedBrandsByInvestor.findOne({
        InvestorUserId: investor._id,
      });
 
      if (!viewedData?.viewedByInvestors?.length) {
        return res.json(
          new ApiResponse(200, [], "You haven't viewed any brands yet")
        );
      }

      brandIds = viewedData.viewedByInvestors
        .sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt))
        .map((b) => new mongoose.Types.ObjectId(b.BrandID));
    } else {
      const viewedData = await ViewedBrandsByBrands.findOne({
        brandUserID: brand._id,
      });
 
      if (!viewedData?.viewedByBrands?.length) {
        return res.json(
          new ApiResponse(200, [], "You haven't viewed any brands yet")
        );
      }

      brandIds = viewedData.viewedByBrands
        .sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt))
        .map((b) => new mongoose.Types.ObjectId(b.BrandID));
    }

    if (!brandIds.length) {
      return res.json(
        new ApiResponse(200, [], "No viewed brands found")
      );
    }

    // ✅ Single pipeline for all brands
    const pipeline = [
      { $match: { _id: { $in: brandIds } } },
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
      { $unwind: { path: "$franchiseDetails", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$uploads", preserveNullAndEmptyArrays: true } },

      // ✅ Filter by "main" if provided
      ...(main
        ? [
            {
              $match: {
                "franchiseDetails.franchiseDetails.brandCategories.main": main,
              },
            },
          ]
        : []),

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
            $ifNull: ["$franchiseDetails.franchiseDetails.brandCategories", null],
          },
          fico: {
            $let: {
              vars: {
                data: {
                  $arrayElemAt: ["$franchiseDetails.franchiseDetails.fico", 0],
                },
              },
              in: {
                investmentRange: "$$data.investmentRange",
                areaRequired: "$$data.areaRequired",
                franchiseModel: "$$data.franchiseModel",
              },
            },
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
              then: { $arrayElemAt: ["$uploads.uploads.franchisePromotionVideo", 0] },
              else: null,
            },
          },
        },
      },

      // ✅ Apply pagination
      { $skip: skip },
      { $limit: limit },
    ];

    // ✅ Count total before skip/limit
    const totalCountPipeline = pipeline.filter(
      (stage) => !("$skip" in stage) && !("$limit" in stage)
    );
    totalCountPipeline.push({ $count: "count" });

    const [brands, totalResult] = await Promise.all([
      BrandDetails.aggregate(pipeline),
      BrandDetails.aggregate(totalCountPipeline),
    ]);

    const totalCount = totalResult.length ? totalResult[0].count : 0;
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
        "Viewed brands retrieved successfully"
      )
    );
  } catch (err) {
    console.error("Error in getAllViewBrandByID:", err);
    return res.json(new ApiResponse(500, {}, "Internal server error"));
  }
};
export const deleteViewBrandByID = async (req, res) => {
  try {
    const { id } = req.params;
    const { brandID } = req.body;
    const investor = req.investorUser;
    const brand = req.brandUser;

    if (id !== investor?.uuid && id !== brand?.uuid) {
      return res
        .status(403)
        .json(new ApiResponse(403, {}, "Unauthorized request"));
    }

    const target = await BrandListing.findOne({ uuid: brandID });
    if (!target) {
      return res.status(404).json(new ApiResponse(404, {}, "Brand not found"));
    }

    if (investor && investor._id) {
      const updatedView = await ViewedBrandsByInvestor.findOneAndUpdate(
        { InvestorUserId: investor._id },
        { $pull: { viewedByInvestors: { BrandID: target._id } } },
        { new: true }
      );

      await ViewedToBrands.findOneAndUpdate(
        { brandUserID: target._id },
        { $pull: { viewedByInvestors: { InvestorID: investor._id } } }
      );

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedView,
            "Brand removed from investor's views"
          )
        );
    }

    if (brand && brand._id) {
      const updatedView = await ViewedBrandsByBrands.findOneAndUpdate(
        { brandUserID: brand._id },
        { $pull: { viewedByBrands: { BrandID: target._id } } },
        { new: true }
      );

      await ViewedToBrands.findOneAndUpdate(
        { brandUserID: target._id },
        { $pull: { viewedByBrands: { BrandID: brand._id } } }
      );

      return res
        .status(200)
        .json(
          new ApiResponse(200, updatedView, "Brand removed from brand views")
        );
    }

    return res.status(400).json(new ApiResponse(400, {}, "Invalid request"));
  } catch (err) {
    console.error("Error in deleteViewBrandByID:", err);
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Internal server error"));
  }
};

export const getViewBrandsByAll = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = req.brandUser;

    if (id !== brand?.uuid) {
      return res.json(new ApiResponse(403, {}, "Unauthorized request"));
    }

    const viewedData = await ViewedToBrands.findOne({ brandUserID: brand._id });

    const brandViewed = viewedData?.viewedByBrands?.length;
    const investorViewed = viewedData?.viewedByInvestors?.length;

    const total = investorViewed + brandViewed || 0;

    return res.json(
      new ApiResponse(
        200,
        {
          totalViewCount: total,
        },
        "View data retrieved successfully"
      )
    );
  } catch (error) {
    console.error("getAllViewBrands error:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Internal server error"));
  }
};



