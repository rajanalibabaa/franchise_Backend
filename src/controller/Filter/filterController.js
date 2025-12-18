import mongoose from "mongoose";
import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import { likeandshortlist } from "../BrandController/BrandListingController.js";
import { BrandFranchiseDetails } from "../../model/Brand/Brand.model/FranchiseDetails.model.js";
import { BrandExpansionLocationData } from "../../model/Brand/Brand.model/ExpansionLocation.model.js";
import { IndustryManagement } from "../../model/Admin/CMS/industryManagement.model.js";

export const getAllBrandsAndFilter = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const id = req.query.id;

    const {
      maincat,
      subcat,
      childcat,
      country,
      state,
      district,
      city,
      investmentRange,
      modelType,
      areaRequired,
      serchIndustry,
    } = req.query || {};

    const searchterm = req.query.searchterm || req.query.searchTerm

    const { likedBrands, shortListedBrands } = await likeandshortlist(id);

    const match = {};

      if (searchterm) {
      const orConditions = [
        { "brandDetails.brandName": { $regex: searchterm, $options: "i" } },
        { "brandDetails.companyName": { $regex: searchterm, $options: "i" } },
        { uuid: { $regex: `^${searchterm}$`, $options: "i" } },
        // {
        //   "franchiseDetails.franchiseDetails.brandDescription": {
        //     $regex: searchterm,
        //     $options: "i",
        //   },
        // },
        {
          "franchiseDetails.franchiseDetails.brandCategories.productTags.tags": {
            $regex: searchterm,
            $options: "i",
          },
        },
        // {
        //   "franchiseDetails.franchiseDetails.brandCategories.serviceTags.tags": {
        //     $regex: searchterm,
        //     $options: "i",
        //   },
        // },
        {
          "franchiseDetails.franchiseDetails.brandCategories.main": {
            $regex: searchterm,
            $options: "i",
          },
        },
        {
          "franchiseDetails.franchiseDetails.brandCategories.sub": {
            $regex: searchterm,
            $options: "i",
          },
        },
        // {
        //   "franchiseDetails.franchiseDetails.brandCategories.child": {
        //     $regex: searchterm,
        //     $options: "i",
        //   },
        // },
        // {
        //   "franchiseDetails.franchiseDetails.fico.areaRequired": {
        //     $regex: searchterm,
        //     $options: "i",
        //   },
        // },
        // {
        //   "brandexpansionlocationdata.expansionLocationData.expansionLocations.domestic.locations.state":
        //     { $regex: searchterm, $options: "i" },
        // },
        // {
        //   "brandexpansionlocationdata.expansionLocationData.expansionLocations.international.state":
        //     { $regex: searchterm, $options: "i" },
        // },
        // {
        //   "brandexpansionlocationdata.expansionLocationData.expansionLocations.domestic.locations.districts":
        //     { $regex: searchterm, $options: "i" },
        // },
        // {
        //   "brandexpansionlocationdata.expansionLocationData.expansionLocations.domestic.locations.city":
        //     { $regex: searchterm, $options: "i" },
        // },
        // {
        //   "brandexpansionlocationdata.expansionLocationData.expansionLocations.international.city":
        //     { $regex: searchterm, $options: "i" },
        // },
      ];

      if (serchIndustry) {
        match.$and = [
          {
            "franchiseDetails.franchiseDetails.brandCategories.main":
              serchIndustry,
          },
          { $or: orConditions },
        ];
      } else {
        match.$or = orConditions;
      }
    }


    // Category filters
    if (maincat)
      match["franchiseDetails.franchiseDetails.brandCategories.main"] = maincat;
    if (subcat)
      match["franchiseDetails.franchiseDetails.brandCategories.sub"] = subcat;
    if (childcat)
      match["franchiseDetails.franchiseDetails.brandCategories.child"] =
        childcat;

    // Investment Range
    if (investmentRange) {
      match["franchiseDetails.franchiseDetails.fico"] = {
        $elemMatch: { investmentRange },
      };
    }

    // Area Required
    if (areaRequired) {
      match["franchiseDetails.franchiseDetails.fico"] = {
        $elemMatch: { areaRequired },
      };
    }

    // Model Type
    if (modelType) {
      match["franchiseDetails.franchiseDetails.fico.franchiseModel"] =
        modelType;
    }

    // Location filters
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
      match.$and = (match?.$and || []).concat(locationConditions);
    }

    const aggregationPipeline = [
      {
        $match: {
          "brandDetails.isBrandPause": { $ne: true },
          "brandDetails.isApproved": { $ne: false },
        },
      },
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
      { $match: match },
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
          isBrandPause: "$brandDetails.isBrandPause",
          payment: "$brandDetails.payment",
          isFreeLeadPaused: "$brandDetails.isFreeLeadPaused",
          // isApproved: "$brandDetails.isApproved",
          brandCategories: {
            $ifNull: [
              "$franchiseDetails.franchiseDetails.brandCategories",
              null,
            ],
          },
          brandDescription: {
            $ifNull: [
              "$franchiseDetails.franchiseDetails.brandDescription",
              null,
            ],
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

    const countPipeline = [
      {
        $match: {
          "brandDetails.isBrandPause": { $ne: true },
          "brandDetails.isApproved": { $ne: false },
        },
      },
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
      { $match: match },
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

// export const getAllBrandFiltersdata = async (req, res) => {
//   const { main, sub, district, state, areaRequired, industry } = req.query;

//   try {
//     if ((sub && main) || sub) {
//       const childcatData = await BrandFranchiseDetails.aggregate([
//         {
//           $match: {
//             "franchiseDetails.brandCategories.sub": sub,
//           },
//         },
//         {
//           $project: {
//             childcat: "$franchiseDetails.brandCategories.child",
//           },
//         },
//         {
//           $match: {
//             childcat: { $exists: true, $ne: null, $ne: "" },
//           },
//         },
//         {
//           $group: {
//             _id: "$childcat",
//           },
//         },
//         {
//           $project: {
//             _id: 0,
//             child: "$_id",
//           },
//         },
//         {
//           $sort: { child: 1 },
//         },
//       ]);

//       // console.log("Child categories data:", childcatData);
//       const childcatNames = childcatData.map((item) => item.child);
//       return res.json(
//         new ApiResponse(
//           200,
//           childcatNames,
//           "Child categories fetched successfully"
//         )
//       );
//     }
//     // Handle state filter - return districts for the state
//     if (state) {
//       const districtsData = await BrandExpansionLocationData.aggregate([
//         {
//           $match: {
//             "expansionLocationData.expansionLocations.domestic.locations.state":
//               state,
//           },
//         },
//         {
//           $unwind:
//             "$expansionLocationData.expansionLocations.domestic.locations",
//         },
//         {
//           $match: {
//             "expansionLocationData.expansionLocations.domestic.locations.state":
//               state,
//           },
//         },
//         {
//           $unwind:
//             "$expansionLocationData.expansionLocations.domestic.locations.districts",
//         },
//         {
//           $group: {
//             _id: "$expansionLocationData.expansionLocations.domestic.locations.districts.district",
//           },
//         },
//         {
//           $project: {
//             _id: 0,
//             district: "$_id",
//           },
//         },
//         {
//           $sort: {
//             district: 1,
//           },
//         },
//       ]);

//       const districtNames = districtsData.map((item) => item.district);
//       return res.json(
//         new ApiResponse(200, districtNames, "Districts fetched successfully")
//       );
//     }

//     // Handle district filter - return cities for the district
//     if (district) {
//       const citiesData = await BrandExpansionLocationData.aggregate([
//         {
//           $match: {
//             "expansionLocationData.expansionLocations.domestic.locations.districts.district":
//               district,
//           },
//         },
//         {
//           $unwind:
//             "$expansionLocationData.expansionLocations.domestic.locations",
//         },
//         {
//           $unwind:
//             "$expansionLocationData.expansionLocations.domestic.locations.districts",
//         },
//         {
//           $match: {
//             "expansionLocationData.expansionLocations.domestic.locations.districts.district":
//               district,
//           },
//         },
//         {
//           $unwind:
//             "$expansionLocationData.expansionLocations.domestic.locations.districts.cities",
//         },
//         {
//           $group: {
//             _id: "$expansionLocationData.expansionLocations.domestic.locations.districts.cities",
//           },
//         },
//         {
//           $project: {
//             _id: 0,
//             city: "$_id",
//           },
//         },
//         {
//           $sort: {
//             city: 1,
//           },
//         },
//       ]);

//       const cityNames = citiesData.map((item) => item.city);
//       return res.json(
//         new ApiResponse(200, cityNames, "Cities fetched successfully")
//       );
//     }

//     if (main || industry) {
//       const subcatData = await BrandFranchiseDetails.aggregate([
//         {
//           $match: {
//             "franchiseDetails.brandCategories.main": main || industry,
//           },
//         },
//         {
//           $lookup: {
//             from: "brandexpansionlocationdatas",
//             localField: "brandOwnerId",
//             foreignField: "brandOwnerId",
//             as: "brandexpansionlocationdata",
//           },
//         },
//         {
//           $unwind: {
//             path: "$brandexpansionlocationdata",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $lookup: {
//             from: "branddetails",
//             localField: "brandOwnerId",
//             foreignField: "uuid",
//             as: "brandInfo",
//           },
//         },
//         {
//           $unwind: {
//             path: "$brandInfo",
//             preserveNullAndEmptyArrays: false,
//           },
//         },
//         {
//           $match: {
//             $and: [
//               { "brandInfo.brandDetails.isBrandPause": { $ne: true } },
//               { "brandInfo.brandDetails.isApproved": { $ne: false } },
//             ],
//           },
//         },
//         {
//           $project: {
//             subcat: "$franchiseDetails.brandCategories.sub",
//             maincat: "$franchiseDetails.brandCategories.main",
//             childcat: "$franchiseDetails.brandCategories.child",
//             investmentRange: "$franchiseDetails.fico.investmentRange",
//             areaRequired: "$franchiseDetails.fico.areaRequired",
//             franchiseModel: "$franchiseDetails.fico.franchiseModel",
//             states:
//               "$brandexpansionlocationdata.expansionLocationData.expansionLocations.domestic.locations.state",
//           },
//         },
//         {
//           $unwind: {
//             path: "$states",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $unwind: {
//             path: "$maincat",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $unwind: {
//             path: "$franchiseModel",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $unwind: {
//             path: "$investmentRange",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $unwind: {
//             path: "$areaRequired",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $match: {
//             subcat: { $exists: true, $ne: null, $ne: "" },
//             childcat: { $exists: true, $ne: null, $ne: "" },
//             maincat: { $exists: true, $ne: null, $ne: "" },
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             subcat: { $addToSet: "$subcat" },
//             // childcat: { $addToSet: "$childcat" },
//             investmentRange: { $addToSet: "$investmentRange" },
//             areaRequired: { $addToSet: "$areaRequired" },
//             franchiseModel: { $addToSet: "$franchiseModel" },
//             maincat: { $addToSet: "$maincat" },
//             states: { $addToSet: "$states" }, // now flat unique list
//           },
//         },
//         {
//           $project: {
//             _id: 0,
//             subcat: 1,
//             // childcat: 1,
//             investmentRange: 1,
//             areaRequired: 1,
//             franchiseModel: 1,
//             states: 1,
//             // maincat : 1
//           },
//         },
//       ]);

//       const result = subcatData[0] || {
//         subcat: [],
//         childcat: [],
//         investmentRange: [],
//         franchiseModel: [],
//         states: [],
//         maincat: [],
//       };

//       return res.json(
//         new ApiResponse(200, result, "Categories fetched successfully")
//       );
//     }

//     // Main filter aggregation for all data
//     const filters = await BrandFranchiseDetails.aggregate([
//       {
//         $lookup: {
//           from: "brandexpansionlocationdatas",
//           localField: "brandOwnerId",
//           foreignField: "brandOwnerId",
//           as: "brandexpansionlocationdata",
//         },
//       },
//       {
//         $unwind: {
//           path: "$brandexpansionlocationdata",
//           preserveNullAndEmptyArrays: true,
//         },
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
//           $and: [
//             { "brandInfo.brandDetails.isBrandPause": { $ne: true } },
//             { "brandInfo.brandDetails.isApproved": { $ne: false } },
//           ],
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           maincat: "$franchiseDetails.brandCategories.main",
//           subcat: "$franchiseDetails.brandCategories.sub",
//           // childcat: "$franchiseDetails.brandCategories.child",

//           investmentRange: {
//             $arrayElemAt: ["$franchiseDetails.fico.investmentRange", 0],
//           },
//           areaRequired: {
//             $arrayElemAt: ["$franchiseDetails.fico.areaRequired", 0],
//           },
//           franchiseModel: {
//             $arrayElemAt: ["$franchiseDetails.fico.franchiseModel", 0],
//           },

//           states:
//             "$brandexpansionlocationdata.expansionLocationData.expansionLocations.domestic.locations.state",
//           // districts: "$brandexpansionlocationdata.expansionLocationData.expansionLocations.domestic.locations.districts.district",
//           // cities: "$brandexpansionlocationdata.expansionLocationData.expansionLocations.domestic.locations.districts.cities",
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           maincat: { $addToSet: "$maincat" },
//           subcat: { $addToSet: "$subcat" },
//           // childcat: { $addToSet: "$childcat" },
//           investmentRange: { $addToSet: "$investmentRange" },
//           franchiseModel: { $addToSet: "$franchiseModel" },
//           areaRequired: { $addToSet: "$areaRequired" },
//           states: { $addToSet: "$states" },
//           // districts: { $addToSet: "$districts" },
//           // cities: { $addToSet: "$cities" },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           maincat: 1,
//           subcat: 1,
//           // childcat: 1,
//           investmentRange: 1,
//           franchiseModel: 1,
//           states: 1,
//           areaRequired: 1,
//           // districts: 1,
//           // cities: 1,
//         },
//       },
//     ]);

//     //  console.log("Brand filters data:", filters);

//     // Flatten arrays of arrays and remove duplicates
//     const processField = (field) => {
//       if (!field) return [];
//       // Handle nested arrays (like cities which might be arrays within arrays)
//       const flattened = field.flat(Infinity);
//       return [
//         ...new Set(
//           flattened.filter(
//             (item) => item !== undefined && item !== null && item !== ""
//           )
//         ),
//       ];
//     };

//     const result = filters.length > 0 ? filters[0] : {};

//     const processedFilters = {
//       maincat: processField(result.maincat),
//       // subcat: processField(result.subcat),
//       // childcat: processField(result.childcat),
//       investmentRange: processField(result.investmentRange),
//       areaRequired: processField(result.areaRequired),
//       franchiseModel: processField(result.franchiseModel),
//       states: processField(result.states).sort(),
//       // districts: processField(result.districts).sort(),
//       // cities: processField(result.cities).sort(),
//     };

//     return res.json(
//       new ApiResponse(
//         200,
//         processedFilters,
//         "Brand filters fetched successfully"
//       )
//     );
//   } catch (error) {
//     console.error("Error fetching brand filters:", error);
//     return res.json(
//       new ApiResponse(
//         500,
//         null,
//         `Failed to fetch brand filters: ${error.message}`
//       )
//     );
//   }
// };

const AREA_REQUIRED = [
  "No Space Required",
  "100 - 200 Sq. Ft.",
  "200 - 500 Sq. Ft.",
  "500 - 1,000 Sq. Ft.",
  "1,000 - 2,000 Sq. Ft.",
  "2,000 - 3,000 Sq. Ft.",
  "3,000 - 5,000 Sq. Ft.",
  "5,000 - 7,000 Sq. Ft.",
  "7,000 - 10,000 Sq. Ft.",
  "10,000 - 15,000 Sq. Ft."
];

const FRANCHISE_MODEL = [
  "FOFO ",
  "FOCO ",
  "FICO ",
  "COCO ",
  "KIOSK",
  "SHOP IN SHOP",
  "CLOUD KITCHEN",
];

const InvestmentRange = [
  "Below - 50k",
  "Rs. 50k - 2 Lakhs", 
  "Rs. 2 Lakhs - 5 Lakhs",
  "Rs. 5 Lakhs - 10 Lakhs",
  "Rs. 10 Lakhs - 20 Lakhs",
  "Rs. 20 Lakhs - 30 Lakhs",
  "Rs. 30 Lakhs - 50 Lakhs",
  "Rs. 50 Lakhs - 1 Crore",
  "Rs. 1 Crores - 2 Crores",
  "Rs. 2 Crores - 5 Crores",
  "Rs. 5 Crores - above"
];

// Add caching mechanism

import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

export const getAllBrandFiltersdata = async (req, res) => {
  const { main, sub, district, state, industry } = req.query;

  // Generate cache key based on query params
  const cacheKey = JSON.stringify(req.query);
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  console.log("Filter Query Params:", req.query);

  try {
    // Early returns with proper validation
    if (!main && !sub && !district && !state && !industry) {
      // Initial load - get industries and states
      const [industriesData, statesData] = await Promise.all([
        IndustryManagement.find({})
          .select({ _id: 0, industry: 1 })
          .lean()
          .then((industries) =>
            (industries || [])
              .map((i) => i.industry)
              .filter(Boolean)
              .sort()
          ),
        BrandExpansionLocationData.aggregate([
          {
            $unwind:
              "$expansionLocationData.expansionLocations.domestic.locations",
          },
          {
            $group: {
              _id: "$expansionLocationData.expansionLocations.domestic.locations.state",
            },
          },
          {
            $project: {
              _id: 0,
              state: "$_id",
            },
          },
          { $sort: { state: 1 } },
        ]).then((states) => states.map((s) => s.state)),
      ]);

      const response = new ApiResponse(
        200,
        {
          maincat: industriesData,
          investmentRange: InvestmentRange,
          areaRequired: AREA_REQUIRED,
          franchiseModel: FRANCHISE_MODEL,
          states: statesData,
        },
        "Brand filters fetched successfully"
      );

      cache.set(cacheKey, response);
      return res.json(response);
    }

    // Handle sub category child fetch
    if (sub) {
      const childcatData = await BrandFranchiseDetails.aggregate([
        {
          $match: {
            "franchiseDetails.brandCategories.sub": sub,
            ...(main && { "franchiseDetails.brandCategories.main": main }),
          },
        },
        {
          $project: {
            childcat: "$franchiseDetails.brandCategories.child",
          },
        },
        {
          $unwind: {
            path: "$childcat",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            childcat: { $ne: null, $ne: "" },
          },
        },
        {
          $group: {
            _id: "$childcat",
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      const childcatNames = childcatData.map((item) => item._id);
      const response = new ApiResponse(
        200,
        childcatNames,
        "Child categories fetched successfully"
      );

      cache.set(cacheKey, response);
      return res.json(response);
    }

    // Handle state districts
    if (state) {
      const districtsData = await BrandExpansionLocationData.aggregate([
        {
          $match: {
            "expansionLocationData.expansionLocations.domestic.locations.state":
              state,
          },
        },
        {
          $unwind:
            "$expansionLocationData.expansionLocations.domestic.locations",
        },
        {
          $match: {
            "expansionLocationData.expansionLocations.domestic.locations.state":
              state,
          },
        },
        {
          $project: {
            districts:
              "$expansionLocationData.expansionLocations.domestic.locations.districts.district",
          },
        },
        {
          $unwind: "$districts",
        },
        {
          $group: {
            _id: "$districts",
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      const districts = districtsData.map((d) => d._id);
      const response = new ApiResponse(
        200,
        districts,
        "Districts fetched successfully"
      );

      cache.set(cacheKey, response);
      return res.json(response);
    }

    // Handle main/industry category
    if (main || industry) {
      const industryName = main || industry;

      const [industryData, statesData] = await Promise.all([
        IndustryManagement.findOne({
          industry: industryName,
        }).select({
          _id: 0,
          __v: 0,
          "categories.id": 0,
        }),
        BrandExpansionLocationData.aggregate([
          {
            $unwind:
              "$expansionLocationData.expansionLocations.domestic.locations",
          },
          {
            $group: {
              _id: "$expansionLocationData.expansionLocations.domestic.locations.state",
            },
          },
          {
            $project: {
              _id: 0,
              state: "$_id",
            },
          },
          { $sort: { state: 1 } },
        ]).then((states) => states.map((s) => s.state)),
      ]);

      if (!industryData) {
        return res.json(new ApiResponse(404, {}, "Industry does not exist"));
      }

      const response = new ApiResponse(
        200,
        {
          subcat: (industryData.categories || []).map((c) => c.category),
          investmentRange: InvestmentRange,
          areaRequired: AREA_REQUIRED,
          franchiseModel: FRANCHISE_MODEL,
          states: statesData,
        },
        "Categories fetched successfully"
      );

      cache.set(cacheKey, response);
      return res.json(response);
    }

    // Fallback - return empty
    return res.json(new ApiResponse(200, {}, "No data found"));
  } catch (error) {
    console.error("Filter API Error:", error);
    return res.json(
      new ApiResponse(500, null, `Failed to fetch filters: ${error.message}`)
    );
  }
};
