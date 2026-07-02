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
      franchiseType,
      areaRequired,
      serchIndustry,
    } = req.query || {};

    console.log("Received filters:", 
      maincat,
      subcat,
      franchiseType,
      
  );
    let searchterm =
      req.query.searchterm || req.query.searchTerm || req.query.serchterm;
    
    // Ensure searchterm is a string and not empty
    searchterm = searchterm ? String(searchterm).trim() : null;

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
          "franchiseDetails.franchiseDetails.brandCategories.productTags.tags":
            {
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

  // ==================== MODEL TYPE & FRANCHISE TYPE ====================
if (modelType || franchiseType) {
  const ficoMatch = {};

  if (modelType) {
    ficoMatch.franchiseModel = modelType;
  }
  if (franchiseType) {
    ficoMatch.franchiseType = franchiseType;
  }

  match["franchiseDetails.franchiseDetails.fico"] = {
    $elemMatch: ficoMatch,
  };
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
          slug: "$brandDetails.slug",
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
        new ApiResponse(404, null, "No brands found matching the criteria"),
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
        "Brand data fetched successfully",
      ),
    );
  } catch (error) {
    console.error("Error fetching brands:", error);
    return res.json(
      new ApiResponse(500, null, `Failed to fetch brands: ${error.message}`),
    );
  }
};

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
  "10,000 - 15,000 Sq. Ft.",
];

const FRANCHISE_MODEL = [
  "FRANCHISE"
  // "DEALER AND DISTRIBUTOR",
  // "CHANNEL PARTNER"

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
  "Rs. 5 Crores - above",
];

// Add caching mechanism

import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

// below  is a orignal code

// export const getAllBrandFiltersdata = async (req, res) => {
//   const { main, sub, district, state, industry, franchiseModel } = req.query;



//   console.log("query params:", req.query);

//   const cacheKey = JSON.stringify(req.query);
//   const cachedData = cache.get(cacheKey);

//   if (cachedData) {
//     return res.json(cachedData);
//   }

//   // ─── Franchise Types Map ────────────────────────────────────────────────────
//   const franchiseTypes = {
//     "CHANNEL PARTNER": {
//       "CHANNEL PARTNER": [
//         "AUTHORIZED CHANNEL PARTNER",
//         "CHANNEL PARTNERS",
//         "AREA CHANNEL PARTNERS",
//         "CITY CHANNEL PARTNERS",
//         "DISTRICT CHANNEL PARTNERS",
//         "STATE CHANNEL PARTNERS",
//         "IMPLEMENTATION PARTNER",
//         "MASTER CHANNEL PARTNER",
//         "REFERRAL CHANNEL PARTNER",
//         "STRATEGIC ALLIANCE PARTNER",
//         "VALUE-ADDED RESELLER (VAR)",
//       ],
//     },
//     "DEALER AND DISTRIBUTOR": {
//       "C&F Agent": ["C&F Agent"],
//       DEALER: [
//         "AUTHORIZED DEALER",
//         "DEALER",
//         "AREA DEALER",
//         "CITY DEALER",
//         "DISTRICT DEALER",
//         "STATE DEALER",
//       ],
//       DISTRIBUTOR: [
//         "DISTRIBUTOR",
//         "AREA DISTRIBUTOR",
//         "CITY DISTRIBUTOR",
//         "DISTRICT DISTRIBUTOR",
//         "STATE DISTRIBUTOR",
//         "EXCLUSIVE DISTRIBUTOR",
//         "MASTER DISTRIBUTOR",
//         "REGIONAL DISTRIBUTOR",
//         "RETAIL DISTRIBUTOR",
//       ],
//       "IMPORTER / EXPORTER": ["EXPORTER", "IMPORTER"],
//       STOCKIST: [
//         "STOCKIST",
//         "AREA STOCKIST",
//         "CITY STOCKIST",
//         "DISTRICT STOCKIST",
//         "STATE STOCKIST",
//         "SUPER STOCKIST",
//       ],
//       "WHOLESALE SELLER": [
//         "WHOLESALE SELLER",
//         "AREA WHOLESALE SELLER",
//         "CITY WHOLESALE SELLER",
//         "DISTRICT WHOLESALE SELLER",
//         "STATE WHOLESALE SELLER",
//       ],
//     },
//     "FRANCHISE": {
//       "CLOUD KITCHEN": ["CLOUD KITCHEN"],
//       "COMPANY OWNED COMPANY OPERATED (COCO)": [
//         "COCO - Area Franchise",
//         "COCO - City Franchise",
//         "COCO - District Franchise",
//         "COCO - Master Franchise",
//         "COCO - Multi Unit",
//         "COCO - Single Unit",
//         "COCO - State Franchise",
//       ],
//       "COMPANY OWNED FRANCHISE OPERATED (COFO)": [
//         "COFO - Area Franchise",
//         "COFO - City Franchise",
//         "COFO - District Franchise",
//         "COFO - Master Franchise",
//         "COFO - Multi Unit",
//         "COFO - Single Unit",
//         "COFO - State Franchise",
//       ],
//       "FRANCHISE INVESTED COMPANY OPERATED (FICO)": [
//         "FICO - Area Franchise",
//         "FICO - City Franchise",
//         "FICO - District Franchise",
//         "FICO - Master Franchise",
//         "FICO - Multi Unit",
//         "FICO - Single Unit",
//         "FICO - State Franchise",
//       ],
//       "FRANCHISE OWNED COMPANY OPERATED (FOCO)": [
//         "FOCO - Area Franchise",
//         "FOCO - City Franchise",
//         "FOCO - District Franchise",
//         "FOCO - Master Franchise",
//         "FOCO - Multi Unit",
//         "FOCO - Single Unit",
//         "FOCO - State Franchise",
//       ],
//       "FRANCHISE OWNED FRANCHISE OPERATED (FOFO)": [
//         "FOFO - Area Franchise",
//         "FOFO - City Franchise",
//         "FOFO - District Franchise",
//         "FOFO - Master Franchise",
//         "FOFO - Multi Unit",
//         "FOFO - Single Unit",
//         "FOFO - State Franchise",
//       ],
//       KIOSK: ["KIOSK"],
//       "SERVICE PARTNERS": [
//         "SERVICE PARTNERS",
//         "SERVICE PARTNERS - Area Franchise",
//         "SERVICE PARTNERS - City Franchise",
//         "SERVICE PARTNERS - District Franchise",
//         "SERVICE PARTNERS - State Franchise",
//       ],
//       "SHOP IN SHOP": ["SHOP IN SHOP"],
//     },
//   };

//   // ─── Franchise Model Handler ─────────────────────────────────────────────────
//   // Query param: ?franchiseModel=FRANCHISE BUSINESS
//   // Returns: { franchiseModel, subTypes: { "FOFO": [...], "FOCO": [...] }, allTypes: [...] }
//   if (franchiseModel) {
//     const normalizedModel = franchiseModel.trim().toUpperCase();

//     // Find matching top-level key (case-insensitive)
//     const matchedKey = Object.keys(franchiseTypes).find(
//       (key) => key.toUpperCase() === normalizedModel
//     );

//     if (!matchedKey) {
//       return res.json(
//         new ApiResponse(
//           404,
//           {},
//           `Franchise model "${franchiseModel}" not found. Available models: ${Object.keys(franchiseTypes).join(", ")}`
//         )
//       );
//     }

//     const franchiseheading = franchiseTypes[matchedKey]; // { "FOFO": [...], "FOCO": [...], ... }

//     // Flat list of all individual types under this model (useful for dropdowns)
//     const franchiseTypedata = Object.values(franchiseheading).flat();

//     const response = new ApiResponse(
//       200,
//       {
//         franchiseModel: matchedKey,
//         franchiseheading,   // grouped: { subTypeName: [types] }
//         franchiseTypedata,   // flat array of every type string
//       },
//       "Franchise types fetched successfully"
//     );

//     cache.set(cacheKey, response);
//     return res.json(response);
//   }

//   try {
//     if (!main && !sub && !district && !state && !industry) {
//       const [allHeadingsData, statesData] = await Promise.all([
//         IndustryManagement.find({})
//           .select({ _id: 0, "headings.heading": 1, "headings.industries.industry": 1 })
//           .lean()
//           .then((docs) => {
//             const headingMap = {};
//             for (const doc of docs || []) {
//               for (const h of doc.headings || []) {
//                 const headingName = h.heading;
//                 if (!headingName) continue;
//                 if (!headingMap[headingName]) headingMap[headingName] = new Set();
//                 for (const ind of h.industries || []) {
//                   if (ind.industry) headingMap[headingName].add(ind.industry);
//                 }
//               }
//             }
//             return Object.entries(headingMap)
//               .sort(([a], [b]) => a.localeCompare(b))
//               .map(([heading, industriesSet]) => ({
//                 heading,
//                 industries: Array.from(industriesSet).sort(),
//               }));
//           }),
//         BrandExpansionLocationData.aggregate([
//           {
//             $unwind:
//               "$expansionLocationData.expansionLocations.domestic.locations",
//           },
//           {
//             $group: {
//               _id: "$expansionLocationData.expansionLocations.domestic.locations.state",
//             },
//           },
//           {
//             $project: { _id: 0, state: "$_id" },
//           },
//           { $sort: { state: 1 } },
//         ]).then((states) => states.map((s) => s.state)),
//       ]);

//       const response = new ApiResponse(
//         200,
//         {
//           maincat: allHeadingsData,
//           investmentRange: InvestmentRange,
//           areaRequired: AREA_REQUIRED,
//           franchiseModel: FRANCHISE_MODEL,
//           states: statesData,
//         },
//         "Brand filters fetched successfully"
//       );

//       cache.set(cacheKey, response);
//       return res.json(response);
//     }

//     if (sub) {
//       console.log("Fetching tags for sub:", sub);
//       const industryName = main || industry;
//       const normalizedSub = (sub || "").trim().toLowerCase();
//       const tagQuery = (
//         (req.query.tag || req.query.searchTerm || "").trim() || ""
//       ).toLowerCase();

//       if (tagQuery && typeof tagQuery !== "string") {
//         return res.json(new ApiResponse(400, {}, "Invalid search term"));
//       }

//       const allDocs = await IndustryManagement.find({})
//         .select({ _id: 0, "headings.industries": 1 })
//         .lean();

//       const matchedIndustries = [];
//       for (const doc of allDocs || []) {
//         for (const h of doc.headings || []) {
//           for (const ind of h.industries || []) {
//             if (!industryName || ind.industry === industryName) {
//               matchedIndustries.push(ind);
//             }
//           }
//         }
//       }

//       if (!matchedIndustries.length) {
//         return res.json(new ApiResponse(404, {}, "Industry does not exist"));
//       }

//       const productSet = new Set();
//       const serviceSet = new Set();

//       for (const ind of matchedIndustries) {
//         for (const ptItem of ind.productTags || []) {
//           const parent = (ptItem?.parent || "").toLowerCase();
//           if (normalizedSub === "all" || parent === normalizedSub) {
//             for (const tagObj of ptItem.tags || []) {
//               const tagValue =
//                 typeof tagObj === "string" ? tagObj : tagObj?.tag;
//               if (!tagValue) continue;
//               if (!tagQuery || tagValue.toLowerCase().includes(tagQuery)) {
//                 productSet.add(tagValue.trim());
//               }
//             }
//           }
//         }

//         for (const stItem of ind.serviceTags || []) {
//           const parent = (stItem?.parent || "").toLowerCase();
//           if (normalizedSub === "all" || parent === normalizedSub) {
//             for (const tagObj of stItem.tags || []) {
//               const tagValue =
//                 typeof tagObj === "string" ? tagObj : tagObj?.tag;
//               if (!tagValue) continue;
//               if (!tagQuery || tagValue.toLowerCase().includes(tagQuery)) {
//                 serviceSet.add(tagValue.trim());
//               }
//             }
//           }
//         }
//       }

//       const response = new ApiResponse(
//         200,
//         {
//           productTags: Array.from(productSet).sort(),
//           serviceTags: Array.from(serviceSet).sort(),
//         },
//         "Tags fetched successfully"
//       );

//       cache.set(cacheKey, response);
//       return res.json(response);
//     }

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
//           $project: {
//             districts:
//               "$expansionLocationData.expansionLocations.domestic.locations.districts.district",
//           },
//         },
//         { $unwind: "$districts" },
//         { $group: { _id: "$districts" } },
//         { $sort: { _id: 1 } },
//       ]);

//       const districts = districtsData.map((d) => d._id);
//       const response = new ApiResponse(
//         200,
//         districts,
//         "Districts fetched successfully"
//       );

//       cache.set(cacheKey, response);
//       return res.json(response);
//     }

//     if (main || industry) {
//       const industryName = main || industry;

//       const [matchedIndustry, statesData] = await Promise.all([
//         IndustryManagement.find({})
//           .select({ _id: 0, "headings.industries": 1 })
//           .lean()
//           .then((docs) => {
//             for (const doc of docs || []) {
//               for (const h of doc.headings || []) {
//                 const found = (h.industries || []).find(
//                   (ind) => ind.industry === industryName
//                 );
//                 if (found) return found;
//               }
//             }
//             return null;
//           }),
//         BrandExpansionLocationData.aggregate([
//           {
//             $unwind:
//               "$expansionLocationData.expansionLocations.domestic.locations",
//           },
//           {
//             $group: {
//               _id: "$expansionLocationData.expansionLocations.domestic.locations.state",
//             },
//           },
//           {
//             $project: { _id: 0, state: "$_id" },
//           },
//           { $sort: { state: 1 } },
//         ]).then((states) => states.map((s) => s.state)),
//       ]);

//       if (!matchedIndustry) {
//         return res.json(new ApiResponse(404, {}, "Industry does not exist"));
//       }

//       const response = new ApiResponse(
//         200,
//         {
//           subcat: (matchedIndustry.categories || []).map((c) => c.category),
//           investmentRange: InvestmentRange,
//           areaRequired: AREA_REQUIRED,
//           franchiseModel: FRANCHISE_MODEL,
//           states: statesData,
//         },
//         "Categories fetched successfully"
//       );

//       cache.set(cacheKey, response);
//       return res.json(response);
//     }

//     return res.json(new ApiResponse(200, {}, "No data found"));
//   } catch (error) {
//     console.error("Filter API Error:", error);
//     return res.json(
//       new ApiResponse(500, null, `Failed to fetch filters: ${error.message}`)
//     );
//   }
// };

// export const getAllBrandFiltersdata = async (req, res) => {
//   const { main, sub, district, state, industry, franchiseModel } = req.query;

//   console.log("query params:", req.query);

//   const cacheKey = JSON.stringify(req.query);
//   const cachedData = cache.get(cacheKey);

//   if (cachedData) {
//     return res.json(cachedData);
//   }

//   // ─── TEMPORARY BLOCK LISTS ───────────────────────────────────────────────
//   // TODO: REMOVE THESE ARRAYS LATER TO UNBLOCK EVERYTHING.
//   const BLOCKED_HEADINGS = ["Dealer and Distributors"];
//   const BLOCKED_INDUSTRIES = [""];

//   const isHeadingBlocked = (heading) =>
//     BLOCKED_HEADINGS.some(
//       (h) => h.trim().toUpperCase() === (heading || "").trim().toUpperCase()
//     );

//   const isIndustryBlocked = (industry) =>
//     BLOCKED_INDUSTRIES.some(
//       (i) => i.trim().toUpperCase() === (industry || "").trim().toUpperCase()
//     );
//   // ──────────────────────────────────────────────────────────────────────────

//   // ─── Franchise Types Map ────────────────────────────────────────────────────
//   const franchiseTypes = {
//     "CHANNEL PARTNER": {
//       "CHANNEL PARTNER": [
//         "AUTHORIZED CHANNEL PARTNER",
//         "CHANNEL PARTNERS",
//         "AREA CHANNEL PARTNERS",
//         "CITY CHANNEL PARTNERS",
//         "DISTRICT CHANNEL PARTNERS",
//         "STATE CHANNEL PARTNERS",
//         "IMPLEMENTATION PARTNER",
//         "MASTER CHANNEL PARTNER",
//         "REFERRAL CHANNEL PARTNER",
//         "STRATEGIC ALLIANCE PARTNER",
//         "VALUE-ADDED RESELLER (VAR)",
//       ],
//     },
//     "DEALER AND DISTRIBUTOR": {
//       "C&F Agent": ["C&F Agent"],
//       DEALER: [
//         "AUTHORIZED DEALER",
//         "DEALER",
//         "AREA DEALER",
//         "CITY DEALER",
//         "DISTRICT DEALER",
//         "STATE DEALER",
//       ],
//       DISTRIBUTOR: [
//         "DISTRIBUTOR",
//         "AREA DISTRIBUTOR",
//         "CITY DISTRIBUTOR",
//         "DISTRICT DISTRIBUTOR",
//         "STATE DISTRIBUTOR",
//         "EXCLUSIVE DISTRIBUTOR",
//         "MASTER DISTRIBUTOR",
//         "REGIONAL DISTRIBUTOR",
//         "RETAIL DISTRIBUTOR",
//       ],
//       "IMPORTER / EXPORTER": ["EXPORTER", "IMPORTER"],
//       STOCKIST: [
//         "STOCKIST",
//         "AREA STOCKIST",
//         "CITY STOCKIST",
//         "DISTRICT STOCKIST",
//         "STATE STOCKIST",
//         "SUPER STOCKIST",
//       ],
//       "WHOLESALE SELLER": [
//         "WHOLESALE SELLER",
//         "AREA WHOLESALE SELLER",
//         "CITY WHOLESALE SELLER",
//         "DISTRICT WHOLESALE SELLER",
//         "STATE WHOLESALE SELLER",
//       ],
//     },
//     "FRANCHISE": {
//       "CLOUD KITCHEN": ["CLOUD KITCHEN"],
//       "COMPANY OWNED COMPANY OPERATED (COCO)": [
//         "COCO - Area Franchise",
//         "COCO - City Franchise",
//         "COCO - District Franchise",
//         "COCO - Master Franchise",
//         "COCO - Multi Unit",
//         "COCO - Single Unit",
//         "COCO - State Franchise",
//       ],
//       "COMPANY OWNED FRANCHISE OPERATED (COFO)": [
//         "COFO - Area Franchise",
//         "COFO - City Franchise",
//         "COFO - District Franchise",
//         "COFO - Master Franchise",
//         "COFO - Multi Unit",
//         "COFO - Single Unit",
//         "COFO - State Franchise",
//       ],
//       "FRANCHISE INVESTED COMPANY OPERATED (FICO)": [
//         "FICO - Area Franchise",
//         "FICO - City Franchise",
//         "FICO - District Franchise",
//         "FICO - Master Franchise",
//         "FICO - Multi Unit",
//         "FICO - Single Unit",
//         "FICO - State Franchise",
//       ],
//       "FRANCHISE OWNED COMPANY OPERATED (FOCO)": [
//         "FOCO - Area Franchise",
//         "FOCO - City Franchise",
//         "FOCO - District Franchise",
//         "FOCO - Master Franchise",
//         "FOCO - Multi Unit",
//         "FOCO - Single Unit",
//         "FOCO - State Franchise",
//       ],
//       "FRANCHISE OWNED FRANCHISE OPERATED (FOFO)": [
//         "FOFO - Area Franchise",
//         "FOFO - City Franchise",
//         "FOFO - District Franchise",
//         "FOFO - Master Franchise",
//         "FOFO - Multi Unit",
//         "FOFO - Single Unit",
//         "FOFO - State Franchise",
//       ],
//       KIOSK: ["KIOSK"],
//       "SERVICE PARTNERS": [
//         "SERVICE PARTNERS",
//         "SERVICE PARTNERS - Area Franchise",
//         "SERVICE PARTNERS - City Franchise",
//         "SERVICE PARTNERS - District Franchise",
//         "SERVICE PARTNERS - State Franchise",
//       ],
//       "SHOP IN SHOP": ["SHOP IN SHOP"],
//     },
//   };

//   // ─── Franchise Model Handler ─────────────────────────────────────────────────
//   if (franchiseModel) {
//     const normalizedModel = franchiseModel.trim().toUpperCase();

//     const matchedKey = Object.keys(franchiseTypes).find(
//       (key) => key.toUpperCase() === normalizedModel
//     );

//     if (!matchedKey) {
//       return res.json(
//         new ApiResponse(
//           404,
//           {},
//           `Franchise model "${franchiseModel}" not found. Available models: ${Object.keys(franchiseTypes).join(", ")}`
//         )
//       );
//     }

//     const franchiseheading = franchiseTypes[matchedKey];
//     const franchiseTypedata = Object.values(franchiseheading).flat();

//     const response = new ApiResponse(
//       200,
//       {
//         franchiseModel: matchedKey,
//         franchiseheading,
//         franchiseTypedata,
//       },
//       "Franchise types fetched successfully"
//     );

//     cache.set(cacheKey, response);
//     return res.json(response);
//   }

//   try {
//     if (!main && !sub && !district && !state && !industry) {
//       const [allHeadingsData, statesData] = await Promise.all([
//         IndustryManagement.find({})
//           .select({ _id: 0, "headings.heading": 1, "headings.industries.industry": 1 })
//           .lean()
//           .then((docs) => {
//             const headingMap = {};
//             for (const doc of docs || []) {
//               for (const h of doc.headings || []) {
//                 const headingName = h.heading;
//                 if (!headingName) continue;
//                 if (isHeadingBlocked(headingName)) continue; // 🚫 skip blocked heading entirely

//                 if (!headingMap[headingName]) headingMap[headingName] = new Set();
//                 for (const ind of h.industries || []) {
//                   if (ind.industry && !isIndustryBlocked(ind.industry)) {
//                     headingMap[headingName].add(ind.industry);
//                   }
//                 }
//               }
//             }
//             return Object.entries(headingMap)
//               .sort(([a], [b]) => a.localeCompare(b))
//               .map(([heading, industriesSet]) => ({
//                 heading,
//                 industries: Array.from(industriesSet).sort(),
//               }));
//           }),
//         BrandExpansionLocationData.aggregate([
//           {
//             $unwind:
//               "$expansionLocationData.expansionLocations.domestic.locations",
//           },
//           {
//             $group: {
//               _id: "$expansionLocationData.expansionLocations.domestic.locations.state",
//             },
//           },
//           {
//             $project: { _id: 0, state: "$_id" },
//           },
//           { $sort: { state: 1 } },
//         ]).then((states) => states.map((s) => s.state)),
//       ]);

//       const response = new ApiResponse(
//         200,
//         {
//           maincat: allHeadingsData,
//           investmentRange: InvestmentRange,
//           areaRequired: AREA_REQUIRED,
//           franchiseModel: FRANCHISE_MODEL,
//           states: statesData,
//         },
//         "Brand filters fetched successfully"
//       );

//       cache.set(cacheKey, response);
//       return res.json(response);
//     }

//     if (sub) {
//       console.log("Fetching tags for sub:", sub);
//       const industryName = main || industry;
//       const normalizedSub = (sub || "").trim().toLowerCase();
//       const tagQuery = (
//         (req.query.tag || req.query.searchTerm || "").trim() || ""
//       ).toLowerCase();

//       if (tagQuery && typeof tagQuery !== "string") {
//         return res.json(new ApiResponse(400, {}, "Invalid search term"));
//       }

//       const allDocs = await IndustryManagement.find({})
//         .select({ _id: 0, "headings.industries": 1 })
//         .lean();

//       const matchedIndustries = [];
//       for (const doc of allDocs || []) {
//         for (const h of doc.headings || []) {
//           if (isHeadingBlocked(h.heading)) continue; // 🚫 skip blocked heading

//           for (const ind of h.industries || []) {
//             if (isIndustryBlocked(ind.industry)) continue; // 🚫 skip blocked industry

//             if (!industryName || ind.industry === industryName) {
//               matchedIndustries.push(ind);
//             }
//           }
//         }
//       }

//       if (!matchedIndustries.length) {
//         return res.json(new ApiResponse(404, {}, "Industry does not exist"));
//       }

//       const productSet = new Set();
//       const serviceSet = new Set();

//       for (const ind of matchedIndustries) {
//         for (const ptItem of ind.productTags || []) {
//           const parent = (ptItem?.parent || "").toLowerCase();
//           if (normalizedSub === "all" || parent === normalizedSub) {
//             for (const tagObj of ptItem.tags || []) {
//               const tagValue =
//                 typeof tagObj === "string" ? tagObj : tagObj?.tag;
//               if (!tagValue) continue;
//               if (!tagQuery || tagValue.toLowerCase().includes(tagQuery)) {
//                 productSet.add(tagValue.trim());
//               }
//             }
//           }
//         }

//         for (const stItem of ind.serviceTags || []) {
//           const parent = (stItem?.parent || "").toLowerCase();
//           if (normalizedSub === "all" || parent === normalizedSub) {
//             for (const tagObj of stItem.tags || []) {
//               const tagValue =
//                 typeof tagObj === "string" ? tagObj : tagObj?.tag;
//               if (!tagValue) continue;
//               if (!tagQuery || tagValue.toLowerCase().includes(tagQuery)) {
//                 serviceSet.add(tagValue.trim());
//               }
//             }
//           }
//         }
//       }

//       const response = new ApiResponse(
//         200,
//         {
//           productTags: Array.from(productSet).sort(),
//           serviceTags: Array.from(serviceSet).sort(),
//         },
//         "Tags fetched successfully"
//       );

//       cache.set(cacheKey, response);
//       return res.json(response);
//     }

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
//           $project: {
//             districts:
//               "$expansionLocationData.expansionLocations.domestic.locations.districts.district",
//           },
//         },
//         { $unwind: "$districts" },
//         { $group: { _id: "$districts" } },
//         { $sort: { _id: 1 } },
//       ]);

//       const districts = districtsData.map((d) => d._id);
//       const response = new ApiResponse(
//         200,
//         districts,
//         "Districts fetched successfully"
//       );

//       cache.set(cacheKey, response);
//       return res.json(response);
//     }

//     if (main || industry) {
//       const industryName = main || industry;

//       const [matchedIndustry, statesData] = await Promise.all([
//         IndustryManagement.find({})
//           .select({ _id: 0, "headings.industries": 1 })
//           .lean()
//           .then((docs) => {
//             for (const doc of docs || []) {
//               for (const h of doc.headings || []) {
//                 if (isHeadingBlocked(h.heading)) continue; // 🚫 skip blocked heading

//                 const found = (h.industries || []).find(
//                   (ind) =>
//                     ind.industry === industryName &&
//                     !isIndustryBlocked(ind.industry) // 🚫 skip blocked industry
//                 );
//                 if (found) return found;
//               }
//             }
//             return null;
//           }),
//         BrandExpansionLocationData.aggregate([
//           {
//             $unwind:
//               "$expansionLocationData.expansionLocations.domestic.locations",
//           },
//           {
//             $group: {
//               _id: "$expansionLocationData.expansionLocations.domestic.locations.state",
//             },
//           },
//           {
//             $project: { _id: 0, state: "$_id" },
//           },
//           { $sort: { state: 1 } },
//         ]).then((states) => states.map((s) => s.state)),
//       ]);

//       if (!matchedIndustry) {
//         return res.json(new ApiResponse(404, {}, "Industry does not exist"));
//       }

//       const response = new ApiResponse(
//         200,
//         {
//           subcat: (matchedIndustry.categories || []).map((c) => c.category),
//           investmentRange: InvestmentRange,
//           areaRequired: AREA_REQUIRED,
//           franchiseModel: FRANCHISE_MODEL,
//           states: statesData,
//         },
//         "Categories fetched successfully"
//       );

//       cache.set(cacheKey, response);
//       return res.json(response);
//     }

//     return res.json(new ApiResponse(200, {}, "No data found"));
//   } catch (error) {
//     console.error("Filter API Error:", error);
//     return res.json(
//       new ApiResponse(500, null, `Failed to fetch filters: ${error.message}`)
//     );
//   }
// };

// ================= TEMPORARY BLOCK =================
export const BLOCK = {
  headings: [
    // "FRANCHISE"
  ],
  industries: [
    // "FOOD AND BEVERAGES"
  ],
  categories: [
    // "Restaurant"
  ],
  productParents: [
    // "Tea"
  ],
  productTags: [
    // "Green Tea",
    // "Black Tea"
  ],
  serviceParents: [
    // "Installation"
  ],
  serviceTags: [
    // "Home Installation"
  ],
};
// ===================================================

const hasBlock = (array = [], value = "") =>
  array.some(
    (item) => item.trim().toLowerCase() === (value || "").trim().toLowerCase()
  );

const isHeadingBlocked = (heading) => hasBlock(BLOCK.headings, heading);
const isIndustryBlocked = (industry) => hasBlock(BLOCK.industries, industry);
const isCategoryBlocked = (category) => hasBlock(BLOCK.categories, category);
const isProductParentBlocked = (parent) =>
  hasBlock(BLOCK.productParents, parent) || hasBlock(BLOCK.categories, parent); // category block also kills its matching product parent
const isProductTagBlocked = (tag) => hasBlock(BLOCK.productTags, tag);
const isServiceParentBlocked = (parent) => hasBlock(BLOCK.serviceParents, parent);
const isServiceTagBlocked = (tag) => hasBlock(BLOCK.serviceTags, tag);

export const getAllBrandFiltersdata = async (req, res) => {
  const { main, sub, district, state, industry, franchiseModel } = req.query;

  console.log("query params:", req.query);

  const cacheKey = JSON.stringify(req.query);
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  // ─── Franchise Types Map ────────────────────────────────────────────────────
  const franchiseTypes = {
    "CHANNEL PARTNER": {
      "CHANNEL PARTNER": [
        "AUTHORIZED CHANNEL PARTNER",
        "CHANNEL PARTNERS",
        "AREA CHANNEL PARTNERS",
        "CITY CHANNEL PARTNERS",
        "DISTRICT CHANNEL PARTNERS",
        "STATE CHANNEL PARTNERS",
        "IMPLEMENTATION PARTNER",
        "MASTER CHANNEL PARTNER",
        "REFERRAL CHANNEL PARTNER",
        "STRATEGIC ALLIANCE PARTNER",
        "VALUE-ADDED RESELLER (VAR)",
      ],
    },
    "DEALER AND DISTRIBUTOR": {
      "C&F Agent": ["C&F Agent"],
      DEALER: [
        "AUTHORIZED DEALER",
        "DEALER",
        "AREA DEALER",
        "CITY DEALER",
        "DISTRICT DEALER",
        "STATE DEALER",
      ],
      DISTRIBUTOR: [
        "DISTRIBUTOR",
        "AREA DISTRIBUTOR",
        "CITY DISTRIBUTOR",
        "DISTRICT DISTRIBUTOR",
        "STATE DISTRIBUTOR",
        "EXCLUSIVE DISTRIBUTOR",
        "MASTER DISTRIBUTOR",
        "REGIONAL DISTRIBUTOR",
        "RETAIL DISTRIBUTOR",
      ],
      "IMPORTER / EXPORTER": ["EXPORTER", "IMPORTER"],
      STOCKIST: [
        "STOCKIST",
        "AREA STOCKIST",
        "CITY STOCKIST",
        "DISTRICT STOCKIST",
        "STATE STOCKIST",
        "SUPER STOCKIST",
      ],
      "WHOLESALE SELLER": [
        "WHOLESALE SELLER",
        "AREA WHOLESALE SELLER",
        "CITY WHOLESALE SELLER",
        "DISTRICT WHOLESALE SELLER",
        "STATE WHOLESALE SELLER",
      ],
    },
    FRANCHISE: {
      "CLOUD KITCHEN": ["CLOUD KITCHEN"],
      "COMPANY OWNED COMPANY OPERATED (COCO)": [
        "COCO - Area Franchise",
        "COCO - City Franchise",
        "COCO - District Franchise",
        "COCO - Master Franchise",
        "COCO - Multi Unit",
        "COCO - Single Unit",
        "COCO - State Franchise",
      ],
      "COMPANY OWNED FRANCHISE OPERATED (COFO)": [
        "COFO - Area Franchise",
        "COFO - City Franchise",
        "COFO - District Franchise",
        "COFO - Master Franchise",
        "COFO - Multi Unit",
        "COFO - Single Unit",
        "COFO - State Franchise",
      ],
      "FRANCHISE INVESTED COMPANY OPERATED (FICO)": [
        "FICO - Area Franchise",
        "FICO - City Franchise",
        "FICO - District Franchise",
        "FICO - Master Franchise",
        "FICO - Multi Unit",
        "FICO - Single Unit",
        "FICO - State Franchise",
      ],
      "FRANCHISE OWNED COMPANY OPERATED (FOCO)": [
        "FOCO - Area Franchise",
        "FOCO - City Franchise",
        "FOCO - District Franchise",
        "FOCO - Master Franchise",
        "FOCO - Multi Unit",
        "FOCO - Single Unit",
        "FOCO - State Franchise",
      ],
      "FRANCHISE OWNED FRANCHISE OPERATED (FOFO)": [
        "FOFO - Area Franchise",
        "FOFO - City Franchise",
        "FOFO - District Franchise",
        "FOFO - Master Franchise",
        "FOFO - Multi Unit",
        "FOFO - Single Unit",
        "FOFO - State Franchise",
      ],
      KIOSK: ["KIOSK"],
      "SERVICE PARTNERS": [
        "SERVICE PARTNERS",
        "SERVICE PARTNERS - Area Franchise",
        "SERVICE PARTNERS - City Franchise",
        "SERVICE PARTNERS - District Franchise",
        "SERVICE PARTNERS - State Franchise",
      ],
      "SHOP IN SHOP": ["SHOP IN SHOP"],
    },
  };

  // ─── Franchise Model Handler ─────────────────────────────────────────────────
  if (franchiseModel) {
    const normalizedModel = franchiseModel.trim().toUpperCase();

    const matchedKey = Object.keys(franchiseTypes).find(
      (key) => key.toUpperCase() === normalizedModel
    );

    if (!matchedKey) {
      return res.json(
        new ApiResponse(
          404,
          {},
          `Franchise model "${franchiseModel}" not found. Available models: ${Object.keys(
            franchiseTypes
          ).join(", ")}`
        )
      );
    }

    const franchiseheading = franchiseTypes[matchedKey];
    const franchiseTypedata = Object.values(franchiseheading).flat();

    const response = new ApiResponse(
      200,
      {
        franchiseModel: matchedKey,
        franchiseheading,
        franchiseTypedata,
      },
      "Franchise types fetched successfully"
    );

    cache.set(cacheKey, response);
    return res.json(response);
  }

  try {
    // ───────────────────────────────────────────────────────────────────
    // 1) NO PARAMS → main heading/industry listing
    // ───────────────────────────────────────────────────────────────────
    if (!main && !sub && !district && !state && !industry) {
      const [allHeadingsData, statesData] = await Promise.all([
        IndustryManagement.find({})
          .select({
            _id: 0,
            "headings.heading": 1,
            "headings.industries.industry": 1,
          })
          .lean()
          .then((docs) => {
            const headingMap = {};
            for (const doc of docs || []) {
              for (const h of doc.headings || []) {
                const headingName = h.heading;
                if (!headingName) continue;
                if (isHeadingBlocked(headingName)) continue; // 🚫 whole heading gone

                if (!headingMap[headingName]) headingMap[headingName] = new Set();
                for (const ind of h.industries || []) {
                  // Industry block: the industry name itself can still surface here.
                  if (ind.industry) {
                    headingMap[headingName].add(ind.industry);
                  }
                }
              }
            }
            return Object.entries(headingMap)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([heading, industriesSet]) => ({
                heading,
                industries: Array.from(industriesSet).sort(),
              }));
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
          { $project: { _id: 0, state: "$_id" } },
          { $sort: { state: 1 } },
        ]).then((states) => states.map((s) => s.state)),
      ]);

      const response = new ApiResponse(
        200,
        {
          maincat: allHeadingsData,
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

    // ───────────────────────────────────────────────────────────────────
    // 2) sub → productTags / serviceTags
    // ───────────────────────────────────────────────────────────────────
    if (sub) {
      console.log("Fetching tags for sub:", sub);
      const industryName = main || industry;
      const normalizedSub = (sub || "").trim().toLowerCase();
      const tagQuery = (
        (req.query.tag || req.query.searchTerm || "").trim() || ""
      ).toLowerCase();

      if (tagQuery && typeof tagQuery !== "string") {
        return res.json(new ApiResponse(400, {}, "Invalid search term"));
      }

      const allDocs = await IndustryManagement.find({})
        .select({ _id: 0, "headings.heading": 1, "headings.industries": 1 })
        .lean();

      const matchedIndustries = [];
      for (const doc of allDocs || []) {
        for (const h of doc.headings || []) {
          if (isHeadingBlocked(h.heading)) continue; // 🚫 heading gone entirely

          for (const ind of h.industries || []) {
            if (!industryName || ind.industry === industryName) {
              matchedIndustries.push(ind);
            }
          }
        }
      }

      if (!matchedIndustries.length) {
        return res.json(new ApiResponse(404, {}, "Industry does not exist"));
      }

      const productSet = new Set();
      const serviceSet = new Set();

      for (const ind of matchedIndustries) {
        const industryBlocked = isIndustryBlocked(ind.industry);

        // ── Product tags: killed entirely if industry is blocked ──
        if (!industryBlocked) {
          for (const ptItem of ind.productTags || []) {
            const rawParent = ptItem?.parent || "";
            const parent = rawParent.toLowerCase();

            if (isProductParentBlocked(rawParent)) continue; // 🚫 parent (or its matching category) blocked

            if (normalizedSub === "all" || parent === normalizedSub) {
              for (const tagObj of ptItem.tags || []) {
                const tagValue = typeof tagObj === "string" ? tagObj : tagObj?.tag;
                if (!tagValue) continue;
                if (isProductTagBlocked(tagValue)) continue; // 🚫 single tag blocked

                if (!tagQuery || tagValue.toLowerCase().includes(tagQuery)) {
                  productSet.add(tagValue.trim());
                }
              }
            }
          }
        }

        // ── Service tags: NOT affected by industry block ──
        for (const stItem of ind.serviceTags || []) {
          const rawParent = stItem?.parent || "";
          const parent = rawParent.toLowerCase();

          if (isServiceParentBlocked(rawParent)) continue; // 🚫 whole service parent blocked

          if (normalizedSub === "all" || parent === normalizedSub) {
            for (const tagObj of stItem.tags || []) {
              const tagValue = typeof tagObj === "string" ? tagObj : tagObj?.tag;
              if (!tagValue) continue;
              if (isServiceTagBlocked(tagValue)) continue; // 🚫 single service tag blocked

              if (!tagQuery || tagValue.toLowerCase().includes(tagQuery)) {
                serviceSet.add(tagValue.trim());
              }
            }
          }
        }
      }

      const response = new ApiResponse(
        200,
        {
          productTags: Array.from(productSet).sort(),
          serviceTags: Array.from(serviceSet).sort(),
        },
        "Tags fetched successfully"
      );

      cache.set(cacheKey, response);
      return res.json(response);
    }

    // ───────────────────────────────────────────────────────────────────
    // 3) state → districts (unaffected by BLOCK rules)
    // ───────────────────────────────────────────────────────────────────
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
        { $unwind: "$districts" },
        { $group: { _id: "$districts" } },
        { $sort: { _id: 1 } },
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

    // ───────────────────────────────────────────────────────────────────
    // 4) main / industry → categories (subcat)
    // ───────────────────────────────────────────────────────────────────
    if (main || industry) {
      const industryName = main || industry;

      const [matchedIndustry, statesData] = await Promise.all([
        IndustryManagement.find({})
          .select({ _id: 0, "headings.heading": 1, "headings.industries": 1 })
          .lean()
          .then((docs) => {
            for (const doc of docs || []) {
              for (const h of doc.headings || []) {
                if (isHeadingBlocked(h.heading)) continue; // 🚫 heading gone

                const found = (h.industries || []).find(
                  (ind) => ind.industry === industryName
                );
                if (found) return found;
              }
            }
            return null;
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
          { $project: { _id: 0, state: "$_id" } },
          { $sort: { state: 1 } },
        ]).then((states) => states.map((s) => s.state)),
      ]);

      if (!matchedIndustry) {
        return res.json(new ApiResponse(404, {}, "Industry does not exist"));
      }

      const industryBlocked = isIndustryBlocked(matchedIndustry.industry);

      // Industry block ⇒ categories hidden entirely.
      // Otherwise filter out individually-blocked categories.
      const subcat = industryBlocked
        ? []
        : (matchedIndustry.categories || [])
            .filter((c) => !isCategoryBlocked(c.category))
            .map((c) => c.category);

      const response = new ApiResponse(
        200,
        {
          subcat,
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

    return res.json(new ApiResponse(200, {}, "No data found"));
  } catch (error) {
    console.error("Filter API Error:", error);
    return res.json(
      new ApiResponse(500, null, `Failed to fetch filters: ${error.message}`)
    );
  }
};
