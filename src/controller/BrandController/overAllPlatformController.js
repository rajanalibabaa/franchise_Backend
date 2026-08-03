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

    const {
      main,
      sub,
      child,
      search = "",
    } = req.query;

    // ------------------------------------
    // CLEAN SEARCH
    // ------------------------------------

    const searchTerm = search.trim();

    console.log("=================================");
    console.log("API QUERY:", req.query);
    console.log("MAIN:", main);
    console.log("SUB:", sub);
    console.log("CHILD:", child);
    console.log("ID:", id);
    console.log("SEARCH:", searchTerm);
    console.log("PAGE:", page);
    console.log("LIMIT:", limit);
    console.log("=================================");

    // ------------------------------------
    // LIKE / SHORTLIST
    // ------------------------------------

    let likedBrands = [];
    let shortListedBrands = [];

    if (id) {
      const result = await likeandshortlist(id);

      likedBrands = result?.likedBrands || [];
      shortListedBrands =
        result?.shortListedBrands || [];
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
      JSON.stringify(
        OverAllCategory,
        null,
        2
      )
    );

    // ------------------------------------
    // SEARCH REGEX
    // ------------------------------------

    let brandSearchRegex = null;

    if (searchTerm) {
      // Escape special regex characters
      const escapedSearch = searchTerm.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      brandSearchRegex = new RegExp(
        escapedSearch,
        "i"
      );

      console.log(
        "Brand Search Regex:",
        brandSearchRegex
      );
    }

    // =====================================================
    // MAIN AGGREGATION
    // =====================================================

    const aggregationPipeline = [
      // ------------------------------------
      // STEP 1: CATEGORY FILTER
      // ------------------------------------

      {
        $match: OverAllCategory,
      },

      // ------------------------------------
      // STEP 2: GET APPROVED BRAND DETAILS
      // ------------------------------------

      {
        $lookup: {
          from: "branddetails",

          let: {
            franchiseBrandOwnerId:
              "$brandOwnerId",
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

          as: "brandInfo",
        },
      },

      // ------------------------------------
      // STEP 3: ONLY KEEP APPROVED BRANDS
      // ------------------------------------

      {
        $unwind: {
          path: "$brandInfo",
          preserveNullAndEmptyArrays: false,
        },
      },

      // =====================================================
      // STEP 4: BRAND NAME SEARCH
      // =====================================================

      ...(brandSearchRegex
        ? [
            {
              $match: {
                "brandInfo.brandDetails.brandName":
                  brandSearchRegex,
              },
            },
          ]
        : []),

      // ------------------------------------
      // STEP 5: BRAND UPLOADS
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
      // STEP 6: LIKE / SHORTLIST
      // ------------------------------------

      {
        $addFields: {
          isLiked: {
            $in: [
              "$brandInfo._id",

              likedBrands.map(
                (id) =>
                  new mongoose.Types.ObjectId(
                    id
                  )
              ),
            ],
          },

          isShortListed: {
            $in: [
              "$brandInfo._id",

              shortListedBrands.map(
                (id) =>
                  new mongoose.Types.ObjectId(
                    id
                  )
              ),
            ],
          },
        },
      },

      // ------------------------------------
      // STEP 7: SORT
      // ------------------------------------

      {
        $sort: {
          createdAt: -1,
        },
      },

      // ------------------------------------
      // STEP 8: PROJECT
      // ------------------------------------

      {
        $project: {
          _id: 0,

          brandID:
            "$brandInfo.brandID",

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

      // ------------------------------------
      // STEP 9: PAGINATION
      // ------------------------------------

      {
        $skip: skip,
      },

      {
        $limit: limit,
      },
    ];

    // =====================================================
    // COUNT PIPELINE
    // =====================================================

    const countAggregationPipeline = [
      // ------------------------------------
      // CATEGORY FILTER
      // ------------------------------------

      {
        $match: OverAllCategory,
      },

      // ------------------------------------
      // BRAND DETAILS
      // ------------------------------------

      {
        $lookup: {
          from: "branddetails",

          let: {
            franchiseBrandOwnerId:
              "$brandOwnerId",
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

      // ------------------------------------
      // ONLY APPROVED ACTIVE BRANDS
      // ------------------------------------

      {
        $unwind: {
          path: "$approvedActiveBrand",
          preserveNullAndEmptyArrays: false,
        },
      },

      // =====================================================
      // SEARCH IN COUNT ALSO
      // =====================================================

      ...(brandSearchRegex
        ? [
            {
              $match: {
                "approvedActiveBrand.brandDetails.brandName":
                  brandSearchRegex,
              },
            },
          ]
        : []),

      // ------------------------------------
      // COUNT
      // ------------------------------------

      {
        $count: "totalCount",
      },
    ];

    // =====================================================
    // RUN BOTH QUERIES
    // =====================================================

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
      "APPROVED BRANDS FOUND:",
      brandsData.length
    );

    console.log(
      "APPROVED TOTAL COUNT:",
      countResult
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
          200,
          {
            brands: [],

            pagination: {
              total: 0,

              totalPages: 0,

              currentPage: page,

              limit,

              hasNext: false,

              hasPrevious: page > 1,
            },
          },

          searchTerm
            ? `No brands found for "${searchTerm}"`
            : "No approved brands found for this category"
        )
      );
    }

    // ------------------------------------
    // SHUFFLE
    // ------------------------------------

    const brands = shuffleArray(
      brandsData
    );

    // ------------------------------------
    // TOTAL COUNT
    // ------------------------------------

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

        "Approved brands fetched successfully"
      )
    );
  } catch (error) {
    console.error(
      "Error fetching approved brands:",
      error
    );

    return res.json(
      new ApiResponse(
        500,
        null,
        `Failed to fetch approved brands: ${error.message}`
      )
    );
  }
};
