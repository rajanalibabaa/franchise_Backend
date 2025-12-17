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
      serchterm,
      country,
      state,
      district,
      city,
      investmentRange,
      modelType,
      areaRequired,
    } = req.query || {};

 
    const { likedBrands, shortListedBrands } = await likeandshortlist(id);

    const match = {
      // "brandDetails.isBrandPause": { $ne: true },
      // "brandDetails.isApproved": { $ne: false },
    };

    if (serchterm) {
      match.$or = [
        { "brandDetails.brandName": { $regex: serchterm, $options: "i" } },
        {
          "franchiseDetails.franchiseDetails.brandDescription": {
            $regex: serchterm,
            $options: "i",
          },
        },
        {
          "franchiseDetails.franchiseDetails.brandCategories.productTags.tags":
            {
              $regex: serchterm,
              $options: "i",
            },
        },
        {
          "franchiseDetails.franchiseDetails.brandCategories.serviceTags.tags":
            {
              $regex: serchterm,
              $options: "i",
            },
        },
        {
          "franchiseDetails.franchiseDetails.brandCategories.main": {
            $regex: serchterm,
            $options: "i",
          },
        },
        {
          "franchiseDetails.franchiseDetails.brandCategories.sub": {
            $regex: serchterm,
            $options: "i",
          },
        },
        {
          "franchiseDetails.franchiseDetails.brandCategories.child": {
            $regex: serchterm,
            $options: "i",
          },
        },
        {
          "franchiseDetails.franchiseDetails.fico.areaRequired": {
            $regex: serchterm,
            $options: "i",
          },
        },
        {
          "brandexpansionlocationdata.expansionLocationData.expansionLocations.domestic.locations.state":
            { $regex: serchterm, $options: "i" },
        },
        {
          "brandexpansionlocationdata.expansionLocationData.expansionLocations.international.state":
            { $regex: serchterm, $options: "i" },
        },
        {
          "brandexpansionlocationdata.expansionLocationData.expansionLocations.domestic.locations.districts":
            { $regex: serchterm, $options: "i" },
        },
        {
          "brandexpansionlocationdata.expansionLocationData.expansionLocations.domestic.locations.city":
            { $regex: serchterm, $options: "i" },
        },
        {
          "brandexpansionlocationdata.expansionLocationData.expansionLocations.international.city":
            { $regex: serchterm, $options: "i" },
        },
      ];
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
  "100 - 300 Sq.ft",
  "300 - 600 Sq.ft",
  "600 - 1000 Sq.ft",
  "1000+ Sq.ft",
];

const FRANCHISE_MODEL = [
  "FOFO",
  "FOCO",
  "COCO",
  "Distributor",
];

const InvestmentRange = [
  "Below ₹5 Lakhs",
  "₹5 Lakhs - ₹10 Lakhs", 
  "₹10 Lakhs - ₹25 Lakhs",
  "₹25 Lakhs - ₹50 Lakhs",
  "₹50 Lakhs - ₹1 Crore",
  "Above ₹1 Crore",
];

export const getAllBrandFiltersdata = async (req, res) => {
  const { main, sub, district, state, areaRequired: _, industry } = req.query; // Ignore areaRequired query param as it's not used for filtering here

  try {
    /* =================================================
       CHILD CATEGORY FOR SUB SELECTED
    ================================================== */
    if ((sub && main) || sub) {
      const childcatData = await BrandFranchiseDetails.aggregate([
        {
          $match: {
            "franchiseDetails.brandCategories.sub": sub,
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
            preserveNullAndEmptyArrays: true,
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
          $project: {
            _id: 0,
            child: "$_id",
          },
        },
        {
          $sort: { child: 1 },
        },
      ]);

      const childcatNames = childcatData.map((item) => item.child);
      return res.json(
        new ApiResponse(
          200,
          childcatNames,
          "Child categories fetched successfully"
        )
      );
    }

    /* =================================================
       1️⃣ STATE SELECTED → RETURN ONLY DISTRICTS (ARRAY)
    ================================================== */
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
          $unwind:
            "$expansionLocationData.expansionLocations.domestic.locations.districts",
        },
        {
          $group: {
            _id:
              "$expansionLocationData.expansionLocations.domestic.locations.districts.district",
          },
        },
        {
          $project: {
            _id: 0,
            district: "$_id",
          },
        },
        { $sort: { district: 1 } },
      ]);

      return res.json(
        new ApiResponse(
          200,
          districtsData.map(d => d.district),
          "Districts fetched successfully"
        )
      );
    }

    /* =================================================
       DISTRICT SELECTED → RETURN ONLY CITIES (ARRAY)
    ================================================== */
    if (district) {
      const citiesData = await BrandExpansionLocationData.aggregate([
        {
          $match: {
            "expansionLocationData.expansionLocations.domestic.locations.districts.district":
              district,
          },
        },
        {
          $unwind:
            "$expansionLocationData.expansionLocations.domestic.locations",
        },
        {
          $unwind:
            "$expansionLocationData.expansionLocations.domestic.locations.districts",
        },
        {
          $match: {
            "expansionLocationData.expansionLocations.domestic.locations.districts.district":
              district,
          },
        },
        {
          $unwind:
            "$expansionLocationData.expansionLocations.domestic.locations.districts.cities",
        },
        {
          $group: {
            _id: "$expansionLocationData.expansionLocations.domestic.locations.districts.cities",
          },
        },
        {
          $project: {
            _id: 0,
            city: "$_id",
          },
        },
        {
          $sort: {
            city: 1,
          },
        },
      ]);

      const cityNames = citiesData.map((item) => item.city);
      return res.json(
        new ApiResponse(200, cityNames, "Cities fetched successfully")
      );
    }

    /* =================================================
       FETCH STATES (USED IN 2️⃣ & 3️⃣)
    ================================================== */
    const statesData = await BrandExpansionLocationData.aggregate([
      {
        $unwind:
          "$expansionLocationData.expansionLocations.domestic.locations",
      },
      {
        $group: {
          _id:
            "$expansionLocationData.expansionLocations.domestic.locations.state",
        },
      },
      {
        $project: {
          _id: 0,
          state: "$_id",
        },
      },
      { $sort: { state: 1 } },
    ]);

    const states = statesData.map(s => s.state);

    /* =================================================
       2️⃣ MAIN CATEGORY SELECTED
    ================================================== */
    if (main || industry) {
      const industryName = main || industry;
      const industryData = await IndustryManagement.findOne({
        industry: industryName,
      }).select({
        _id: 0,
        __v: 0,
        "categories.id": 0,
      });

      if (!industryData) {
        return res.json(
          new ApiResponse(404, {}, "Industry does not exist")
        );
      }

      return res.json(
        new ApiResponse(
          200,
          {
            subcat: industryData.categories.map(c => c.category),
            investmentRange: InvestmentRange,
            areaRequired: AREA_REQUIRED,
            franchiseModel: FRANCHISE_MODEL,
            states,
          },
          "Categories fetched successfully"
        )
      );
    }

    /* =================================================
       3️⃣ INITIAL LOAD (NO QUERY)
    ================================================== */
    return res.json(
      new ApiResponse(
        200,
        {
          maincat: ["Food & Beverages"], // default main
          investmentRange: InvestmentRange,
          areaRequired: AREA_REQUIRED,
          franchiseModel: FRANCHISE_MODEL,
          states,
        },
        "Brand filters fetched successfully"
      )
    );
  } catch (error) {
    console.error("Filter API Error:", error);
    return res.json(
      new ApiResponse(
        500,
        null,
        `Failed to fetch filters: ${error.message}`
      )
    );
  }
};