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
      OverAllCategory["franchiseDetails.brandCategories.main"] = main;
    }

    if (sub) {
      OverAllCategory["franchiseDetails.brandCategories.sub"] = sub;
    }

    if (child) {
      OverAllCategory["franchiseDetails.brandCategories.child"] = child;
    }

    console.log(
      "MongoDB Category Filter:",
      JSON.stringify(OverAllCategory, null, 2),
    );

    // ------------------------------------
    // MAIN AGGREGATION
    // ------------------------------------

    const aggregationPipeline = [
      // STEP 1: CATEGORY FILTER
      {
        $match: OverAllCategory,
      },

      // STEP 2: GET ONLY APPROVED BRAND DETAILS
      {
        $lookup: {
          from: "branddetails",

          let: {
            franchiseBrandOwnerId: "$brandOwnerId",
          },

          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$uuid", "$$franchiseBrandOwnerId"],
                    },
                    {
                      $eq: ["$brandDetails.isApproved", true],
                    },
                  ],
                },
              },
            },
          ],

          as: "brandInfo",
        },
      },

      // STEP 3: ONLY KEEP RECORDS
      // WHERE APPROVED BRAND WAS FOUND
      {
        $unwind: {
          path: "$brandInfo",
          preserveNullAndEmptyArrays: false,
        },
      },

      // ------------------------------------
      // STEP 4: BRAND UPLOADS
      // ------------------------------------

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

      // ------------------------------------
      // STEP 5: LIKE / SHORTLIST
      // ------------------------------------

      {
        $addFields: {
          isLiked: {
            $in: [
              "$brandInfo._id",
              likedBrands.map(
                (id) => new mongoose.Types.ObjectId(id),
              ),
            ],
          },

          isShortListed: {
            $in: [
              "$brandInfo._id",
              shortListedBrands.map(
                (id) => new mongoose.Types.ObjectId(id),
              ),
            ],
          },
        },
      },

      // ------------------------------------
      // STEP 6: SORT
      // ------------------------------------

      {
        $sort: {
          createdAt: -1,
        },
      },

      // ------------------------------------
      // STEP 7: PROJECT
      // ------------------------------------

      {
        $project: {
          _id: 0,

          brandID: "$brandInfo.brandID",

          uuid: "$brandOwnerId",

          isLiked: 1,

          isShortListed: 1,

          brandname: "$brandInfo.brandDetails.brandName",

          state: "$brandInfo.brandDetails.state",

          district: "$brandInfo.brandDetails.district",

          slug: "$brandInfo.brandDetails.slug",

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

      // ------------------------------------
      // STEP 8: PAGINATION
      // ------------------------------------

      {
        $skip: skip,
      },

      {
        $limit: limit,
      },
    ];

    // ------------------------------------
    // COUNT ONLY APPROVED BRANDS
    // ------------------------------------

    const countAggregationPipeline = [
  {
    $match: OverAllCategory,
  },

  {
    $lookup: {
      from: "branddetails",

      let: {
        franchiseBrandOwnerId: "$brandOwnerId",
      },

      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: [
                    "$uuid",
                    "$$franchiseBrandOwnerId",
                  ],
                },

                {
                  $eq: [
                    "$brandDetails.isApproved",
                    true,
                  ],
                },

                {
                  $eq: [
                    "$brandDetails.isBrandPause",
                    false,
                  ],
                },
              ],
            },
          },
        },
      ],

      as: "approvedActiveBrand",
    },
  },

  {
    $match: {
      "approvedActiveBrand.0": {
        $exists: true,
      },
    },
  },

  {
    $count: "totalCount",
  },
];
    // ------------------------------------
    // RUN QUERIES
    // ------------------------------------

    const [brandsData, countResult] =
      await Promise.all([
        BrandFranchiseDetails.aggregate(
          aggregationPipeline,
        ),

        BrandFranchiseDetails.aggregate(
          countAggregationPipeline,
        ),
      ]);

    console.log(
      "APPROVED BRANDS FOUND:",
      brandsData.length,
    );

    console.log(
      "APPROVED TOTAL COUNT:",
      countResult,
    );

    // ------------------------------------
    // NO DATA
    // ------------------------------------

    if (
      !brandsData ||
      brandsData.length === 0
    ) {
      return res.json(
        new ApiResponse(
          404,
          null,
          "No approved brands found for this category",
        ),
      );
    }

    // ------------------------------------
    // SHUFFLE
    // ------------------------------------

    const brands = shuffleArray(brandsData);

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

        "Approved brands fetched successfully",
      ),
    );
  } catch (error) {
    console.error(
      "Error fetching approved brands:",
      error,
    );

    return res.json(
      new ApiResponse(
        500,
        null,
        `Failed to fetch approved brands: ${error.message}`,
      ),
    );
  }
};