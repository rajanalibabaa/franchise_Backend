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

    console.log("Received filters:", {
      maincat,
      subcat,
    });
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
  "Rs. 5 Crores - above",
];

// Add caching mechanism

import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

export const getAllBrandFiltersdata = async (req, res) => {
  const { main, sub, district, state, industry } = req.query;

  console.log("query params:",req.query);

  // Generate cache key based on query params
  const cacheKey = JSON.stringify(req.query);
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

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
              .sort(),
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
        "Brand filters fetched successfully",
      );

      cache.set(cacheKey, response);
      return res.json(response);
    }

    // Handle sub category tags fetch
    if (sub) {

      console.log("Fetching tags for sub:", sub);
      const industryName = main || industry;
      const normalizedSub = (sub || "").trim().toLowerCase();
      const tagQuery = ((req.query.tag || req.query.searchTerm || "").trim() || "").toLowerCase();
      
      // Ensure tagQuery is a string for validation
      if (tagQuery && typeof tagQuery !== "string") {
        return res.json(new ApiResponse(400, {}, "Invalid search term"));
      }

      const industryFilter = industryName
        ? { industry: industryName }
        : {};

      const industryData = await IndustryManagement.find(industryFilter)
        .select({ _id: 0, productTags: 1, serviceTags: 1 })
        .lean();

      if (!industryData || industryData.length === 0) {
        return res.json(new ApiResponse(404, {}, "Industry does not exist"));
      }

      const productSet = new Set();
      const serviceSet = new Set();

      for (const industry of industryData) {
        for (const ptItem of industry.productTags || []) {
          const parent = (ptItem?.parent || "").toLowerCase();
          if (normalizedSub === "all" || parent === normalizedSub) {
            for (const tagObj of ptItem.tags || []) {
              const tagValue = typeof tagObj === "string" ? tagObj : tagObj?.tag;
              if (!tagValue) continue;
              if (!tagQuery || tagValue.toLowerCase().includes(tagQuery)) {
                productSet.add(tagValue.trim());
              }
            }
          }
        }

        for (const stItem of industry.serviceTags || []) {
          const parent = (stItem?.parent || "").toLowerCase();
          if (normalizedSub === "all" || parent === normalizedSub) {
            for (const tagObj of stItem.tags || []) {
              const tagValue = typeof tagObj === "string" ? tagObj : tagObj?.tag;
              if (!tagValue) continue;
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
        "Tags fetched successfully",
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
        "Districts fetched successfully",
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
        "Categories fetched successfully",
      );

      cache.set(cacheKey, response);
      return res.json(response);
    }

    // Fallback - return empty
    return res.json(new ApiResponse(200, {}, "No data found"));
  } catch (error) {
    console.error("Filter API Error:", error);
    return res.json(
      new ApiResponse(500, null, `Failed to fetch filters: ${error.message}`),
    );
  }
};
