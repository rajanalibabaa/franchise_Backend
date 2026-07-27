import mongoose from "mongoose";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import { BrandFranchiseDetails } from "../../model/Brand/Brand.model/FranchiseDetails.model.js";
import { shuffleArray } from "../../utils/HelperFunction/shuffle.js";
import { likeandshortlist } from "../../controller/BrandController/BrandListingController.js";

export const overAllPlatformOnlyMainCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const id = req.query.id || null;

    const { main, sub, child } = req.query;

    console.log("=================================");
    console.log("API QUERY:", req.query);
    console.log("MAIN:", main);
    console.log("SUB:", sub);
    console.log("CHILD:", child);
    console.log("ID:", id);
    console.log("=================================");

    // ------------------------------------
    // LIKE / SHORTLIST
    // ------------------------------------

    let likedBrands = [];
    let shortListedBrands = [];

    if (id) {
      const result = await likeandshortlist(id);

      likedBrands = result?.likedBrands || [];
      shortListedBrands = result?.shortListedBrands || [];
    }

    // ------------------------------------
    // CATEGORY FILTER
    // ------------------------------------

    const OverAllCategory = {};

    if (main) {
      OverAllCategory[
        "franchiseDetails.brandCategories.main"
      ] = main;
    }

    if (sub) {
      OverAllCategory[
        "franchiseDetails.brandCategories.sub"
      ] = sub;
    }

    if (child) {
      OverAllCategory[
        "franchiseDetails.brandCategories.child"
      ] = child;
    }

    console.log(
      "MongoDB Category Filter:",
      JSON.stringify(OverAllCategory, null, 2)
    );

    // ------------------------------------
    // MAIN AGGREGATION
    // ------------------------------------

    const aggregationPipeline = [
      // STEP 1: CATEGORY FILTER
      {
        $match: OverAllCategory,
      },

      // STEP 2: GET BRAND DETAILS
      {
        $lookup: {
          from: "branddetails",
          localField: "brandOwnerId",
          foreignField: "uuid",
          as: "brandInfo",
        },
      },

      // STEP 3: UNWIND BRAND DETAILS
      {
        $unwind: {
          path: "$brandInfo",
          preserveNullAndEmptyArrays: true,
        },
      },

      // STEP 4: BRAND STATUS FILTER
      // TEMPORARILY COMMENTED FOR DEBUGGING
      /*
      {
        $match: {
          "brandInfo.brandDetails.isBrandPause": {
            $ne: true,
          },
          "brandInfo.brandDetails.isApproved": {
            $ne: false,
          },
        },
      },
      */

      // STEP 5: BRAND UPLOADS
      {
        $lookup: {
          from: "branduploads",
          localField: "brandOwnerId",
          foreignField: "brandOwnerId",
          as: "uploads",
        },
      },

      {
        $unwind: {
          path: "$uploads",
          preserveNullAndEmptyArrays: true,
        },
      },

      // STEP 6: LIKE / SHORTLIST
      {
        $addFields: {
          isLiked: {
            $in: [
              "$brandInfo._id",
              likedBrands.map(
                (id) => new mongoose.Types.ObjectId(id)
              ),
            ],
          },

          isShortListed: {
            $in: [
              "$brandInfo._id",
              shortListedBrands.map(
                (id) => new mongoose.Types.ObjectId(id)
              ),
            ],
          },
        },
      },

      // STEP 7: SORT
      {
        $sort: {
          createdAt: -1,
        },
      },

      // STEP 8: PROJECT
      {
        $project: {
          _id: 0,

          brandID: "$brandInfo.brandID",

          uuid: "$brandOwnerId",

          isLiked: 1,

          isShortListed: 1,

          brandname:
            "$brandInfo.brandDetails.brandName",

          state:
            "$brandInfo.brandDetails.state",

          district:
            "$brandInfo.brandDetails.district",

          slug:
            "$brandInfo.brandDetails.slug",

          brandCategories: {
            $ifNull: [
              "$franchiseDetails.brandCategories",
              null,
            ],
          },

          fico: {
            $let: {
              vars: {
                data: {
                  $arrayElemAt: [
                    "$franchiseDetails.fico",
                    0,
                  ],
                },
              },

              in: {
                investmentRange:
                  "$$data.investmentRange",

                areaRequired:
                  "$$data.areaRequired",

                franchiseModel:
                  "$$data.franchiseModel",
              },
            },
          },

          logo: {
            $cond: {
              if: {
                $isArray:
                  "$uploads.uploads.brandLogo",
              },

              then: {
                $arrayElemAt: [
                  "$uploads.uploads.brandLogo",
                  0,
                ],
              },

              else: null,
            },
          },

          franchiseVideos: {
            $cond: {
              if: {
                $isArray:
                  "$uploads.uploads.franchisePromotionVideo",
              },

              then: {
                $arrayElemAt: [
                  "$uploads.uploads.franchisePromotionVideo",
                  0,
                ],
              },

              else: null,
            },
          },
        },
      },

      // STEP 9: PAGINATION
      {
        $skip: skip,
      },

      {
        $limit: limit,
      },
    ];

    // ------------------------------------
    // COUNT
    // ------------------------------------

    const countAggregationPipeline = [
      {
        $match: OverAllCategory,
      },

      {
        $count: "totalCount",
      },
    ];

    // ------------------------------------
    // RUN QUERY
    // ------------------------------------

    const [brandsData, countResult] =
      await Promise.all([
        BrandFranchiseDetails.aggregate(
          aggregationPipeline
        ),

        BrandFranchiseDetails.aggregate(
          countAggregationPipeline
        ),
      ]);

    console.log(
      "BRANDS FOUND:",
      brandsData.length
    );

    console.log(
      "TOTAL COUNT:",
      countResult
    );

    // ------------------------------------
    // NO DATA
    // ------------------------------------

    if (!brandsData || brandsData.length === 0) {
      return res.json(
        new ApiResponse(
          404,
          null,
          "No brands found for this category"
        )
      );
    }

    // ------------------------------------
    // SHUFFLE
    // ------------------------------------

    const brands = shuffleArray(
      brandsData
    );

    const totalCount =
      countResult[0]?.totalCount || 0;

    const totalPages =
      Math.ceil(totalCount / limit);

    const hasNext =
      page < totalPages;

    const hasPrevious =
      page > 1;

    // ------------------------------------
    // RESPONSE
    // ------------------------------------

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

        "Brands fetched successfully"
      )
    );

  } catch (error) {

    console.error(
      "Error fetching brands:",
      error
    );

    return res.json(
      new ApiResponse(
        500,
        null,
        `Failed to fetch brands: ${error.message}`
      )
    );
  }
};



// import mongoose from "mongoose";
// import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
// import { BrandFranchiseDetails } from "../../model/Brand/Brand.model/FranchiseDetails.model.js";
// import { shuffleArray } from "../../utils/HelperFunction/shuffle.js";
// import { likeandshortlist } from "../../controller/BrandController/BrandListingController.js";

// export const overAllPlatformOnlyMainCategory = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 20;
//     const skip = (page - 1) * limit;
//     const id = req.query.id || null;

//     const { main, sub, child } = req.query;
//     console.log("overall platform main category",main,sub);
    

//     const { likedBrands, shortListedBrands } = await likeandshortlist(id);

//     const OverAllCategory = {};

//     if (main) {
//       OverAllCategory["franchiseDetails.brandCategories.main"] = main;
//     }

//     if ((main && sub) || sub) {
//       OverAllCategory["franchiseDetails.brandCategories.sub"] = sub;
//     }

//     if (main && sub && child) {
//       OverAllCategory["franchiseDetails.brandCategories.child"] = child;
//     }
//     const aggregationPipeline = [
//       {
//         $match: { ...OverAllCategory },
//       },
//       {
//         $lookup: {
//           from: "branddetails",
//           localField: "brandOwnerId",
//           foreignField: "uuid",
//           as: "brandInfo",
//         },
//       },
//       {
//         $unwind: {
//           path: "$brandInfo",
//           preserveNullAndEmptyArrays: false,
//         },
//       },
//       {
//         $match: {
//           "brandInfo.brandDetails.isBrandPause": { $ne: true },
//           "brandInfo.brandDetails.isApproved": { $ne: false },
//         },
//       },
//       {
//         $lookup: {
//           from: "branduploads",
//           localField: "brandOwnerId",
//           foreignField: "brandOwnerId",
//           as: "uploads",
//         },
//       },
//       {
//         $unwind: {
//           path: "$uploads",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $addFields: {
//           isLiked: {
//             $in: [
//               "$brandInfo._id",
//               likedBrands.map((id) => new mongoose.Types.ObjectId(id)),
//             ],
//           },
//           isShortListed: {
//             $in: [
//               "$brandInfo._id",
//               shortListedBrands.map((id) => new mongoose.Types.ObjectId(id)),
//             ],
//           },
//         },
//       },
//       { $sort: { createdAt: -1 } },
//       {
//         $project: {
//           _id: 0,
//           brandID: "$brandInfo.brandID",
//           uuid: "$brandOwnerId",
//           isLiked: 1,
//           isShortListed: 1,
//           brandname: "$brandInfo.brandDetails.brandName",
//           state: "$brandInfo.brandDetails.state",
//           district: "$brandInfo.brandDetails.district",
//           slug: "$brandInfo.brandDetails.slug",
//           brandCategories: {
//             $ifNull: ["$franchiseDetails.brandCategories", null],
//           },
//           fico: {
//             $let: {
//               vars: {
//                 data: { $arrayElemAt: ["$franchiseDetails.fico", 0] },
//               },
//               in: {
//                 investmentRange: "$$data.investmentRange",
//                 areaRequired: "$$data.areaRequired",
//                 franchiseModel: "$$data.franchiseModel",
//               },
//             },
//           },
//           logo: {
//             $cond: {
//               if: { $isArray: "$uploads.uploads.brandLogo" },
//               then: { $arrayElemAt: ["$uploads.uploads.brandLogo", 0] },
//               else: null,
//             },
//           },
//           franchiseVideos: {
//             $cond: {
//               if: { $isArray: "$uploads.uploads.franchisePromotionVideo" },
//               then: {
//                 $arrayElemAt: ["$uploads.uploads.franchisePromotionVideo", 0],
//               },
//               else: null,
//             },
//           },
//         },
//       },

//       { $skip: skip },
//       { $limit: limit },
//     ];

//     const countAggregationPipeline = [
//       { $match: { ...OverAllCategory } },
//       {
//         $lookup: {
//           from: "branddetails",
//           localField: "brandOwnerId",
//           foreignField: "uuid",
//           as: "brandInfo",
//         },
//       },
//       {
//         $unwind: {
//           path: "$brandInfo",
//           preserveNullAndEmptyArrays: false,
//         },
//       },
//       {
//         $match: {
//           "brandInfo.brandDetails.isBrandPause": { $ne: true },
//           "brandInfo.brandDetails.isApproved": { $ne: false },
//         },
//       },
//       { $count: "totalCount" },
//     ];

//     const [brandsData, countResult] = await Promise.all([
//       BrandFranchiseDetails.aggregate(aggregationPipeline),
//       BrandFranchiseDetails.aggregate(countAggregationPipeline),
//     ]);

//     const totalCount = countResult[0]?.totalCount || 0;

//     if (!brandsData || brandsData.length === 0) {
//       return res.json(
//         new ApiResponse(404, null, "No top food franchises found"),
//       );
//     }

//     const brands = shuffleArray(brandsData);

//     const totalPages = Math.ceil(totalCount / limit);
//     const hasNext = page < totalPages;
//     const hasPrevious = page > 1;

//     return res.json(
//       new ApiResponse(
//         200,
//         {
//           brands: brands,
//           pagination: {
//             total: totalCount,
//             totalPages,
//             currentPage: page,
//             limit,
//             hasNext,
//             hasPrevious,
//           },
//         },
//         "Top food franchises fetched successfully",
//       ),
//     );

//     console.log("api res",br);
    
//   } catch (error) {
//     console.error("Error fetching top food franchises:", error);
//     return res.json(
//       new ApiResponse(
//         500,
//         null,
//         `Failed to fetch top food franchises: ${error.message}`,
//       ),
//     );
//   }
// };
