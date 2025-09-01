import mongoose from "mongoose";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import {
  deleteFileFromR2,
  generateSignedUrl,
  uploadFileToR2,
} from "../../utils/Uploads/s3Uploader.js";
// import { InvsRegister } from "../../model/Investor/invsRegister.js";
import generateCustomId from "../../helpers/brandIdGenerater.js";
import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { BrandFranchiseDetails } from "../../model/Brand/Brand.model/FranchiseDetails.model.js";
import { BrandExpansionLocationData } from "../../model/Brand/Brand.model/ExpansionLocation.model.js";
import { BrandUploads } from "../../model/Brand/Brand.model/Uploads.model.js";
import uuid from "../../utils/uuid.js";
import { InvsRegister } from "../../model/Investor/invsRegister.js";
import { FavoriteBrandsLikedBybrand, FavoriteBrandsLikedByInvestor } from "../../model/Investor/favoriteBrandsInvestor.js";
import ShortListed from "../../model/ShortList/shortListedModel.js";
import { shuffleArray } from "../../utils/HelperFunction/shuffle.js";
import { console } from "inspector";
import NewIncomingBrands from "../../model/Brand/newIncomigBrands.js";
import {likeandshortlist} from "../../controller/BrandController/BrandListingController.js"


export const overAllPlatform = async (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      message: "API is working fine",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  } finally {
    console.log("overAllPlatform API called");
  }     
};



export const getTopAutomotive = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;
    const id = req.query.id || null;

    const { main , sub , child} = req.query

    const { likedBrands, shortListedBrands } = await likeandshortlist(id);


    const aggregationPipeline = [
      // { 
      //   $match: { 
      //     "franchiseDetails.brandCategories.main": "Automotive" 
      //   } 
      // },
        {
        $match: {
          "franchiseDetails.brandCategories.main": main
        }
      },
       {
        $match: {
          "franchiseDetails.brandCategories.sub": sub
        }
      },
      {
        $match: {
          "franchiseDetails.brandCategories.child": child
        }
      },
      {
        $lookup: {
          from: "branddetails",
          localField: "brandOwnerId",
          foreignField: "uuid",
          as: "brandInfo"
        }
      },
      { 
        $unwind: { 
          path: "$brandInfo", 
          preserveNullAndEmptyArrays: true 
        } 
      },
      {
        $lookup: {
          from: "branduploads",
          localField: "brandOwnerId",
          foreignField: "brandOwnerId",
          as: "uploads"
        }
      },
      { 
        $unwind: { 
          path: "$uploads", 
          preserveNullAndEmptyArrays: true 
        } 
      },
      {
        $addFields: {
          isLiked: {
            $in: ["$brandInfo._id", likedBrands.map(id => new mongoose.Types.ObjectId(id))]
          },
          isShortListed: {
            $in: ["$brandInfo._id", shortListedBrands.map(id => new mongoose.Types.ObjectId(id))]
          }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 0,
          brandID: "$brandInfo.brandID",
          uuid: "$brandOwnerId",
          isLiked: 1,
          isShortListed: 1,
          brandname: "$brandInfo.brandDetails.brandName",
          brandCategories: {
            $ifNull: ["$franchiseDetails.brandCategories", null]
          },
         fico: {
            $let: {
              vars: {
                data: { $arrayElemAt: ["$franchiseDetails.fico", 0] }
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
              else: null
            }
          },
          franchiseVideos: {
            $cond: {
              if: { $isArray: "$uploads.uploads.franchisePromotionVideo" },
              then: { $arrayElemAt: ["$uploads.uploads.franchisePromotionVideo", 0] },
              else: null
            }
          }
        }
      },
      { $skip: skip },
      { $limit: limit }
    ];

    const [brandsData, totalCount] = await Promise.all([
      BrandFranchiseDetails.aggregate(aggregationPipeline),
      BrandFranchiseDetails.countDocuments({ 
        "franchiseDetails.brandCategories.sub": "Food Franchises" 
      })
    ]);

    if (!brandsData || brandsData.length === 0) {
      return res.json(new ApiResponse(404, null, "No top food franchises found"));
    }
    
     const brands = shuffleArray(brandsData)

    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return res.json(
      new ApiResponse(200, {
        brands: brands,
        pagination: {
          total: totalCount,
          totalPages,
          currentPage: page,
          limit,
          hasNext,
          hasPrevious
        }
      }, "Top food franchises fetched successfully")
    );

  } catch (error) {
    console.error("Error fetching top food franchises:", error);
    return res.json(
      new ApiResponse(500, null, `Failed to fetch top food franchises: ${error.message}`)
    );
  }
};