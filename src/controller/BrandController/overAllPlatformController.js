import mongoose from "mongoose";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import { BrandFranchiseDetails } from "../../model/Brand/Brand.model/FranchiseDetails.model.js";
import { shuffleArray } from "../../utils/HelperFunction/shuffle.js";
import { console } from "inspector";
import {likeandshortlist} from "../../controller/BrandController/BrandListingController.js"
 
 
export const overAllPlatformOnlyMainCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;
    const id = req.query.id || null;
 
    const { main , sub , child} = req.query
 
    const { likedBrands, shortListedBrands } = await likeandshortlist(id);
 
    const OverAllCategory = [];
   
    if (main) {
      OverAllCategory.push({ "franchiseDetails.brandCategories.main": main });
    }
    if (main && sub) {
      OverAllCategory.push({ "franchiseDetails.brandCategories.main": main });
      OverAllCategory.push({ "franchiseDetails.brandCategories.sub": sub });
    }
    if (main && sub && child) {
      OverAllCategory.push({ "franchiseDetails.brandCategories.main": main });
      OverAllCategory.push({ "franchiseDetails.brandCategories.sub": sub });
      OverAllCategory.push({ "franchiseDetails.brandCategories.child": child });
    }
 
    const match = {
          $and: [
            { "franchiseDetails.brandCategories.sub": { $ne: null } },
            { "franchiseDetails.brandCategories.sub": { $ne: "" } },
            ...OverAllCategory
          ]
        }
 
    const aggregationPipeline = [
        {
        $match: match
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
        $match: {
          "brandInfo.brandDetails.isBrandPause": { $ne: true },
          "brandInfo.brandDetails.isApproved": { $ne: false }
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
    const aggregationPipeline2 = [
        {
        $match: match
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
        $match: {
          "brandInfo.brandDetails.isBrandPause": { $ne: true },
          "brandInfo.brandDetails.isApproved": { $ne: false }
        }
      },
      {
        $unwind: {
          path: "$brandInfo",
          preserveNullAndEmptyArrays: true
        }
      },
    ];
 
    let [brandsData, totalCount] = await Promise.all([
      BrandFranchiseDetails.aggregate(aggregationPipeline),
      BrandFranchiseDetails.aggregate(aggregationPipeline2)
    ]);
 
    if (!brandsData || brandsData.length === 0) {
      return res.json(new ApiResponse(404, null, "No top food franchises found"));
    }

    totalCount = totalCount.length
   
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
 
//  export const overAllPlatformOnlyMainCategory = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 30;
//     const skip = (page - 1) * limit;
//     const id = req.query.id || null;

//     const { main, sub, child } = req.query;

//     console.log("req.query ",req.query)

//     const { likedBrands, shortListedBrands } = await likeandshortlist(id);

//     const categoryFilter = {};
//     if (main) categoryFilter["franchiseDetails.brandCategories.main"] = main;
//     if (main && sub) categoryFilter["franchiseDetails.brandCategories.sub"] = sub;
//     if (main && sub && child) categoryFilter["franchiseDetails.brandCategories.child"] = child;

//     const aggregationPipeline = [
//       {
//         $match: {
//           "brandDetails.isBrandPause": { $ne: true },
//           "brandDetails.isApproved": { $ne: false },
//         }
//       },
//       {
//         $lookup: {
//           from: "brandfranchisedetails",
//           localField: "uuid",
//           foreignField: "brandOwnerId",
//           as: "franchiseInfo"
//         }
//       },
//       { $unwind: { path: "$franchiseInfo", preserveNullAndEmptyArrays: true } },
//       // {
//       //   $match: categoryFilter
//       // },
//       {
//         $lookup: {
//           from: "branduploads",
//           localField: "uuid",
//           foreignField: "brandOwnerId",
//           as: "uploads"
//         }
//       },
//       { $unwind: { path: "$uploads", preserveNullAndEmptyArrays: true } },
//       {
//         $addFields: {
//           isLiked: { $in: ["$_id", likedBrands.map(id => new mongoose.Types.ObjectId(id))] },
//           isShortListed: { $in: ["$_id", shortListedBrands.map(id => new mongoose.Types.ObjectId(id))] }
//         }
//       },
//       { $sort: { createdAt: -1 } },
//       {
//         $project: {
//           _id: 0,
//           brandID: "$brandID",
//           uuid: "$uuid",
//           brandname: "$brandDetails.brandName",
//           brandCategories: "$franchiseInfo.brandCategories",
//           fico: { $arrayElemAt: ["$franchiseInfo.fico", 0] },
//           logo: { $arrayElemAt: ["$uploads.uploads.brandLogo", 0] },
//           franchiseVideos: { $arrayElemAt: ["$uploads.uploads.franchisePromotionVideo", 0] },
//           isLiked: 1,
//           isShortListed: 1
//         }
//       },
//       { $skip: skip },
//       { $limit: limit }
//     ];

//     const [brandsData, totalCount] = await Promise.all([
//       BrandDetails.aggregate(aggregationPipeline),
//       BrandDetails.countDocuments({
//         "brandDetails.isBrandPause": { $ne: true },
//         "brandDetails.isApproved": { $ne: false },
//         ...categoryFilter
//       })
//     ]);

//     if (!brandsData || brandsData.length === 0) {
//       return res.json(new ApiResponse(404, null, "No top food franchises found"));
//     }

//     const brands = shuffleArray(brandsData);
//     const totalPages = Math.ceil(totalCount / limit);

//     return res.json(new ApiResponse(200, {
//       brands,
//       pagination: {
//         total: totalCount,
//         totalPages,
//         currentPage: page,
//         limit,
//         hasNext: page < totalPages,
//         hasPrevious: page > 1
//       }
//     }, "Top food franchises fetched successfully"));

//   } catch (error) {
//     console.error("Error fetching top food franchises:", error);
//     return res.json(new ApiResponse(500, null, `Failed to fetch top food franchises: ${error.message}`));
//   }
// };
 

 