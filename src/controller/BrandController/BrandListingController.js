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
import {
  FavoriteBrandsLikedBybrand,
  FavoriteBrandsLikedByInvestor,
} from "../../model/Investor/favoriteBrandsInvestor.js";
import ShortListed from "../../model/ShortList/shortListedModel.js";
import { shuffleArray } from "../../utils/HelperFunction/shuffle.js";
import NewIncomingBrands from "../../model/Brand/newIncomigBrands.js";
import PaymentPackages from "../../model/Brand/AdvertigeHandlingModel.js";

export const likeandshortlist = async (id) => {
  let likedBrands = [];
  let shortListedBrands = [];
  if (id) {
    const investor = await InvsRegister.findOne({ uuid: id });

    if (investor) {
      const investorFavorites = await FavoriteBrandsLikedByInvestor.findOne({
        InvestorUserId: investor._id,
      });
      likedBrands =
        investorFavorites?.favoriteBrandByInvestor.map((b) =>
          b.brandID.toString()
        ) || [];

      const investorShortList = await ShortListed.find({
        "ShortListedBy.investor.userId": investor._id,
      });
      shortListedBrands = investorShortList.map((s) =>
        s.brandOwnerId.toString()
      );
    } else {
      const brand = await BrandDetails.findOne({ uuid: id });
      console.log("brand :", brand);
      if (brand) {
        const brandFavorites = await FavoriteBrandsLikedBybrand.findOne({
          brandUserId: brand._id,
        });
        console.log("brandFavorites id :", brandFavorites);
        likedBrands =
          brandFavorites?.favoriteBrandBybrand.map((b) =>
            b.brandID.toString()
          ) || [];

        const brandShortList = await ShortListed.find({
          "ShortListedBy.brand.userId": brand._id,
        });
        shortListedBrands = brandShortList.map((s) =>
          s.brandOwnerId.toString()
        );
      }
    }
  }

  // console.log("shortListedBrands :",shortListedBrands)

  return { likedBrands, shortListedBrands };
};
const createBrandListing = async (req, res) => {
  try {
    const { admin } = req.body;
    const id = uuid(); // Make sure this is properly imported/defined
console.log("Incoming data:", req.body);
    const fileFields = [
      "awardDoc",
      "brandLogo",
      "pancard",
      "businessPlan",
      "exteriorOutlet",
      "franchisePromotionVideo",
      "brandPromotionVideo",
      "gstCertificate",
      "interiorOutlet",
    ];

    const safeJsonParse = (input, fallback = {}) => {
      try {
        return typeof input === "string"
          ? JSON.parse(input)
          : input || fallback;
      } catch (err) {
        console.warn("JSON parse error:", err.message);
        return fallback;
      }
    };

    const brandDetails = safeJsonParse(req.body?.brandDetails);
    const franchiseDetails = safeJsonParse(req.body?.franchiseDetails);
    const expansionLocationData = safeJsonParse(req.body?.expansionLocationData);

  console.log("Parsed brandDetails:", brandDetails);

if (brandDetails.paymentPackage) {
        const PaymentPackagesData = await PaymentPackages.findOne({}).lean();
        const selectedPackage = brandDetails.paymentPackage; 

        for (const key in PaymentPackagesData) {
          if (key === selectedPackage) {
            const matchedPackage = { ...PaymentPackagesData[key],  packageType: key,isActive: true,packageUpdatedTime: new Date()};

            console.log("Matched Package:", matchedPackage);
            brandDetails.paymentPackage = matchedPackage

          }
        }
      }

// console.log("updated data:", brandDetails);


    // Validate required fields
    if (!brandDetails || !franchiseDetails || !expansionLocationData) {
      return res.json(
        new ApiResponse(
          400,
          {},
          "Required fields (brandDetails, franchiseDetails, expansionLocationData) are missing"
        )
      );
    }

    // const exists = await BrandDetails.findOne({
    //   "brandDetails.brandName": brandDetails.brandName
    // })

    // if (exists) {
    //   return res.json(
    //     new ApiResponse(400, {}, "Brand already exists")
    //   );
    // }

    const normalizeDistrictData = (districtObj, fallbackName) => {
      if (!districtObj.district && fallbackName)
        districtObj.district = fallbackName;
      if (
        !Array.isArray(districtObj.cities) ||
        districtObj.cities.length === 0
      ) {
        districtObj.cities = [districtObj.district || fallbackName].filter(
          Boolean
        );
      }
      return districtObj;
    };

    const normalizeLocations = (locations, isInternational = false) => {
      if (!Array.isArray(locations)) return [];
      return locations.map((loc) => {
        const key = isInternational ? "states" : "state";
        const districtKey = isInternational ? "district" : "districts";
        if (Array.isArray(loc[districtKey])) {
          loc[districtKey] = loc[districtKey].map((d) =>
            normalizeDistrictData(d, loc[key])
          );
        }
        return loc;
      });
    };

    // Normalize location data
    if (expansionLocationData?.expansionLocations?.domestic?.locations) {
      expansionLocationData.expansionLocations.domestic.locations =
        normalizeLocations(
          expansionLocationData.expansionLocations.domestic.locations
        );
    }

    if (expansionLocationData?.currentOutletLocations?.domestic?.locations) {
      expansionLocationData.currentOutletLocations.domestic.locations =
        normalizeLocations(
          expansionLocationData.currentOutletLocations.domestic.locations
        );
    }

    if (expansionLocationData?.expansionLocations?.international?.country) {
      expansionLocationData.expansionLocations.international.country =
        normalizeLocations(
          expansionLocationData.expansionLocations.international.country,
          true
        );
    }

    if (expansionLocationData?.currentOutletLocations?.international?.country) {
      expansionLocationData.currentOutletLocations.international.country =
        normalizeLocations(
          expansionLocationData.currentOutletLocations.international.country,
          true
        );
    }

    // Parse award descriptions
    let awardDescriptions = [];
    if (brandDetails.awardText) {
      if (Array.isArray(brandDetails.awardText)) {
        awardDescriptions = brandDetails.awardText;
      } else if (typeof brandDetails.awardText === "string") {
        try {
          awardDescriptions = JSON.parse(brandDetails.awardText);
        } catch (e) {
          console.warn("Invalid awardText JSON:", e);
        }
      }
    }

    // Generate brandID
    const groupId = franchiseDetails?.brandCategories?.groupId || null;
    const brandID = await generateCustomId(groupId);

    // Upload files to R2
    // Upload files to R2 - videos will be converted to HLS, others direct upload
    const uploadedFiles = {};
    for (const field of fileFields) {
      if (req.files?.[field]?.length > 0) {
        const urls = await Promise.all(
          req.files[field].map(async (file) => {
            // Convert videos to HLS, others direct upload
            const isVideo = field.toLowerCase().includes("video");
            const uploadedUrl = await uploadFileToR2(
              file.path, 
              file.mimetype, 
              { convertToHLS: isVideo }
            );
            console.log(`✅ Uploaded ${field}:`, uploadedUrl);
            return uploadedUrl;
          })
        );
        uploadedFiles[field] = urls;
      }
    }

    // Build structured awards array
    const awardDocs = uploadedFiles.awardDoc || [];
    const awards = awardDocs.map((fileUrl, index) => ({
      awardDescription: awardDescriptions[index] || "",
      awardImage: fileUrl,
    }));



    if(admin){
       // Create all records in parallel after getting the UUID

    const [newBrand, newBrandFranchiseDetails, newBrandExpansionLocationData, newBrandUploads] = await Promise.all([
      BrandDetails.create({
        brandID,
        uuid: id,
        brandDetails
      }),
      BrandFranchiseDetails.create({
        brandOwnerId: id,
        franchiseDetails
      }),
      BrandExpansionLocationData.create({
        brandOwnerId: id,
        expansionLocationData
      }),
      BrandUploads.create({
        brandOwnerId: id,
        uploads: {
          brandLogo: uploadedFiles.brandLogo || [],
          gstCertificate: uploadedFiles.gstCertificate || [],
          pancard: uploadedFiles.pancard || [],
          exteriorOutlet: uploadedFiles.exteriorOutlet || [],
          interiorOutlet: uploadedFiles.interiorOutlet || [],
          franchisePromotionVideo: uploadedFiles.franchisePromotionVideo || [],
          brandPromotionVideo: uploadedFiles.brandPromotionVideo || [],
          businessPlan: uploadedFiles.businessPlan || [],
          awards
        }
      })
    ]);

    // Check if all records were created successfully
    if (!newBrand || !newBrandFranchiseDetails || !newBrandExpansionLocationData || !newBrandUploads) {
      return res.json(
        new ApiResponse(500, {}, "Failed to create one or more brand records")
      );
    }

    return res.json(
      new ApiResponse(201, {
        brand: newBrand,
        franchise: newBrandFranchiseDetails,
        locations: newBrandExpansionLocationData,
        uploads: newBrandUploads
      }, "Brand listing created successfully")
    );

    }
   

     const [newBrand, newBrandFranchiseDetails, newBrandExpansionLocationData, newBrandUploads] = await Promise.all([
      BrandDetails.create({
        brandID,
        uuid: id,
        brandDetails
      }),
      BrandFranchiseDetails.create({
        brandOwnerId: id,
        franchiseDetails
      }),
      BrandExpansionLocationData.create({
        brandOwnerId: id,
        expansionLocationData
      }),
      BrandUploads.create({
        brandOwnerId: id,
        uploads: {
          brandLogo: uploadedFiles.brandLogo || [],
          gstCertificate: uploadedFiles.gstCertificate || [],
          pancard: uploadedFiles.pancard || [],
          exteriorOutlet: uploadedFiles.exteriorOutlet || [],
          interiorOutlet: uploadedFiles.interiorOutlet || [],
          franchisePromotionVideo: uploadedFiles.franchisePromotionVideo || [],
          brandPromotionVideo: uploadedFiles.brandPromotionVideo || [],
          businessPlan: uploadedFiles.businessPlan || [],
          awards
        }
      })
    ]);

    // Check if all records were created successfully
    if (!newBrand || !newBrandFranchiseDetails || !newBrandExpansionLocationData || !newBrandUploads) {
      return res.json(
        new ApiResponse(500, {}, "Failed to create one or more brand records")
      );
    }

    return res.json(
      new ApiResponse(201, {
        brand: newBrand,
        franchise: newBrandFranchiseDetails,
        locations: newBrandExpansionLocationData,
        uploads: newBrandUploads
      }, "Brand listing created successfully")
    );


  } catch (error) {
    console.error("❌ Error in createBrandListing:", error);
    return res.json(
      new ApiResponse(
        500,
        {},
        `Failed to create brand listing: ${error.message}`
      )
    );
  }
};

const getAllBrands = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const id = req.query.id || null;

    const { likedBrands, shortListedBrands } = await likeandshortlist(id);

    const aggregationPipeline = [
      {
        $match: {
          "brandDetails.isBrandPause": { $ne: true },
          "brandDetails.isApproved": { $ne: true },
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
        $unwind: {
          path: "$franchiseDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $unwind: { path: "$uploads", preserveNullAndEmptyArrays: true } },
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
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 0,
          brandID: 1,
          uuid: 1,
          isLiked: 1,
          isShortListed: 1,
          brandname: "$brandDetails.brandName",
          isBrandPause: "$brandDetails.isBrandPause",
          isFreeLeadPaused: "$brandDetails.isFreeLeadPaused",
          brandCategories: {
            $ifNull: [
              "$franchiseDetails.franchiseDetails.brandCategories",
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

    const [brandsData, totalCountResult] = await Promise.all([
      BrandDetails.aggregate(aggregationPipeline),
      BrandDetails.aggregate([
        {
          $match: {
            "brandDetails.isBrandPause": { $ne: true },
            "brandDetails.isApproved": { $ne: true },
          },
        },
        {
          $count: "totalCount",
        },
      ]),
    ]);

    const totalCount = totalCountResult[0]?.totalCount || 0;

    if (!brandsData || brandsData.length === 0) {
      return res.json(new ApiResponse(404, null, "No active brands found"));
    }

    const brands = shuffleArray(brandsData);
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

const getBrandListingByUUID = async (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId || null;

  try {
    const { likedBrands, shortListedBrands } = await likeandshortlist(userId);
    const data = await BrandDetails.aggregate([
      {
        $match: {
          uuid: id,
        },
      },
      {
        $lookup: {
          from: "brandfranchisedetails",
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "brandfranchisedetails",
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
          as: "brandexpansionlocationdatas",
        },
      },
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
          uuid: 1,
          isLiked: 1,
          isShortListed: 1,
          brandDetails: {
            companyName: "$brandDetails.companyName",
            brandName: "$brandDetails.brandName",
            tagLine: "$brandDetails.tagLine",
            brandID: "$brandID",
            state: "$brandDetails.state",
            city: "$brandDetails.city",
            paymentPackage:"$brandDetails.paymentPackage",
            listingPackages:"$brandDetails.listingPackages",
          },
          brandfranchisedetails: {
            $let: {
              vars: {
                firstFranchise: { $arrayElemAt: ["$brandfranchisedetails", 0] },
              },
              in: {
                franchiseDetails: "$$firstFranchise.franchiseDetails",
              },
            },
          },
          uploads: {
            $let: {
              vars: {
                firstUpload: { $arrayElemAt: ["$uploads", 0] } || null,
              },
              in: {
                logo: {
                  $ifNull: [
                    { $arrayElemAt: ["$$firstUpload.uploads.brandLogo", 0] },
                    null,
                  ],
                },
                franchiseVideos: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        "$$firstUpload.uploads.franchisePromotionVideo",
                        0,
                      ],
                    },
                    null,
                  ],
                },
                exteriorOutlet: {
                  $ifNull: ["$$firstUpload.uploads.exteriorOutlet", 0],
                },
                interiorOutlet: {
                  $ifNull: ["$$firstUpload.uploads.interiorOutlet", 0],
                },
                awards: {
                  $cond: {
                    if: {
                      $and: [
                        { $isArray: "$$firstUpload.uploads.awards" },
                        { $gt: [{ $size: "$$firstUpload.uploads.awards" }, 0] },
                      ],
                    },
                    then: {
                      $map: {
                        input: "$$firstUpload.uploads.awards",
                        as: "award",
                        in: {
                          awardDescription: "$$award.awardDescription",
                          awardImage: "$$award.awardImage",
                        },
                      },
                    },
                    else: [],
                  },
                },
              },
            },
          },
          brandexpansionlocationdatas: {
            $let: {
              vars: {
                data: { $arrayElemAt: ["$brandexpansionlocationdatas", 0] },
              },
              in: {
                currentOutletLocations:
                  "$$data.expansionLocationData.currentOutletLocations",
                expansionLocations:
                  "$$data.expansionLocationData.expansionLocations",
              },
            },
          },
        },
      },
    ]);

    return res.json(
      new ApiResponse(200, data, "✅ Brand fetched successfully")
    );
  } catch (error) {
    console.error("Error fetching top food franchises:", error);
    return res.json(
      new ApiResponse(
        500,
        null,
        `Failed to fetch top food franchises: ${error.message}`
      )
    );
  }
};

// export const getTopBeverageFranchise = async (req,res)=>{
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 30;
//     const skip = (page - 1) * limit;
//     const id = req.query.id || null;

//     const { likedBrands, shortListedBrands } = await likeandshortlist(id);

//     const aggregationPipeline = [
//       {
//         $match: {
//           "franchiseDetails.brandCategories.sub": "Beverage Franchises",
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
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $match: {
//           "brandInfo.brandDetails.isBrandPause": { $ne: true },
//           "brandInfo.brandDetails.isApproved": { $ne: true },
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
//           logo: { $arrayElemAt: ["$uploads.uploads.brandLogo", 0] },
//           franchiseVideos: {
//             $arrayElemAt: ["$uploads.uploads.franchisePromotionVideo", 0],
//           },
//         },
//       },
//       { $skip: skip },
//       { $limit: limit },
//     ];

//     //   const [brandsData, totalCount] = await Promise.all([
//     //   BrandFranchiseDetails.aggregate(aggregationPipeline),
//     //   BrandFranchiseDetails.countDocuments({
//     //     "franchiseDetails.brandCategories.sub":"Beverage Franchises"
//     //   })
//     // ])

//     const [brandsData, totalCountResult] = await Promise.all([
//       BrandFranchiseDetails.aggregate(aggregationPipeline),
//       BrandFranchiseDetails.aggregate([
//         {
//           $lookup: {
//             from: "branddetails",
//             localField: "brandOwnerId",
//             foreignField: "uuid",
//             as: "brandInfo",
//           },
//         },
//         { $unwind: "$brandInfo" },
//         {
//           $match: {
//             "franchiseDetails.brandCategories.sub": "Beverage Franchises",
//             "brandInfo.brandDetails.isBrandPause": { $ne: true },
//             "brandInfo.brandDetails.isApproved": { $ne: true },
//           },
//         },
//         { $count: "totalCount" },
//       ]),
//     ]);

//     const totalCount = totalCountResult[0]?.totalCount || 0;

//     if (!brandsData || brandsData.length === 0) {
//       return res.json(
//         new ApiResponse(404, null, "No top beverage franchises found")
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
//         "Top food franchises fetched successfully"
//       )
//     );
//   } catch (error) {
//     console.error("Error fetching brands:", error);
//     return res.json(
//       new ApiResponse(500, null, `Failed to fetch brands: ${error.message}`)
//     );
//   }
// };

// export const getTopLeadingFranchise = async (req, res) => {
//   try {
//     res.json(
//       new ApiResponse(
//         200,
//         null,
//         "Top leading franchise data is not implemented yet"
//       )
//     );
//   } catch (error) {
//     console.error("Error fetching brands:", error);
//     return res.json(
//       new ApiResponse(500, null, `Failed to fetch brands: ${error.message}`)
//     );
//   }
// };

const updateBrandListingByUUID = async (req, res) => {
  try {
    const { id } = req.params;
    

    console.log("id :",id)

    // ---------- Safe Parse Helper ----------
    const safeParse = (data) => {
      if (!data) return null;
      if (typeof data === "string") {
        try {
          return JSON.parse(data);
        } catch {
          return null;
        }
      }
      return data; // already object
    };

    // ---------- Parse Expansion Location ----------
    const addExpansionLocationData =
      safeParse(req.body.addExpansionLocationData) ||
      req.body.addExpansionLocationData;
    const removeExpansionLocationData =
      safeParse(req.body.removeExpansionLocationData) ||
      req.body.removeExpansionLocationData;
    // console.log("Add Expansion Location Data:", addExpansionLocationData);
    // console.log("Remove Expansion Location Data:", removeExpansionLocationData);
    // console.log("Brand ID:", removeExpansionLocationData);

    let expensionLocationData = null;
    if (id && (addExpansionLocationData || removeExpansionLocationData)) {
      expensionLocationData = await expansionLocationData(
        id,
        addExpansionLocationData,
        removeExpansionLocationData
      );
    }

    // ---------- Updates Container ----------
    const updates = { $set: {} };

    // ---------- Parse brand & franchise ----------
    const ParseBrandDetails = safeParse(req.body.brandDetails);
    const ParseFranchiseDetails = safeParse(req.body.franchiseDetails);

    console.log("ParseBrandDetails:",ParseBrandDetails)
    console.log("parseFranchiseDetails",ParseFranchiseDetails);
    

    // ---------- BrandDetails ----------
    if (ParseBrandDetails) {
      const brandDetailsFields = [
        "fullName",
        "email",
        "mobileNumber",
        "whatsappNumber",
        "companyName",
        "brandName",
        "tagLine",
        "ceoName",
        "ceoEmail",
        "ceoMobile",
        "officeEmail",
        "officeMobile",
        "headOfficeAddress",
        "country",
        "state",
        "district",
        "city",
        "pincode",
        "website",
        "facebook",
        "instagram",
        "linkedin",
        "gstNumber",
        "pancardNumber",
      ];

      for (const field of brandDetailsFields) {
        if (ParseBrandDetails[field] !== undefined) {
          updates.$set[`brandDetails.${field}`] = ParseBrandDetails[field];
        }
      }

    
    
    }

    // ---------- FranchiseDetails ----------
    if (ParseFranchiseDetails) {
      const franchiseTopLevelFields = [
        "aidFinancing",
        "brandDescription",
        "companyOwnedOutlets",
        "consultationOrAssistance",
        "establishedYear",
        "franchiseDevelopment",
        "franchiseOutlets",
        "franchiseSinceYear",
        "totalOutlets",
      ];

      for (const field of franchiseTopLevelFields) {
        if (ParseFranchiseDetails[field] !== undefined) {
          updates.$set[`franchiseDetails.${field}`] =
            ParseFranchiseDetails[field];
        }
      }

      if (ParseFranchiseDetails.brandCategories) {
        const brandCategoriesFields = ["main", "sub", "groupId", "child"];
        for (const field of brandCategoriesFields) {
          if (ParseFranchiseDetails.brandCategories[field] !== undefined) {
            updates.$set[`franchiseDetails.brandCategories.${field}`] =
              ParseFranchiseDetails.brandCategories[field];
          }
        }
      }

      if (Array.isArray(ParseFranchiseDetails.trainingSupport)) {
        ParseFranchiseDetails.trainingSupport.forEach((item, index) => {
          updates.$set[`franchiseDetails.trainingSupport.${index}`] = item;
        });
      }

      if (Array.isArray(ParseFranchiseDetails.uniqueSellingPoints)) {
        ParseFranchiseDetails.uniqueSellingPoints.forEach((item, index) => {
          updates.$set[`franchiseDetails.uniqueSellingPoints.${index}`] = item;
        });
      }

      if (Array.isArray(ParseFranchiseDetails.fico)) {
        ParseFranchiseDetails.fico.forEach((ficoItem, index) => {
          const ficoFields = [
            "investmentRange",
            "areaRequired",
            "franchiseModel",
            "franchiseType",
            "franchiseFee",
            "royaltyFee",
            "stockInvestment",
            "royaltyFeeUnit",
            "interiorCost",
            "otherCost",
            "roi",
            "payBackPeriod",
            "breakEven",
            "requireWorkingCapital",
            "marginOnSales",
            "agreementPeriod",
          ];
          ficoFields.forEach((field) => {
            if (ficoItem[field] !== undefined) {
              updates.$set[`franchiseDetails.fico.${index}.${field}`] =
                ficoItem[field];
            }
          });
        });
      }

      // const arrayFields = [
      //   "PrimaryClassification",
      //   "ProductServiceType",
      //   "TargetAudience",
      //   "ServiceModel",
      //   "PricingAndValue",
      //   "AmbienceAndExperience",
      //   "FeaturesAndAmenities",
      //   "TechnologyIntegration",
      //   "SustainabilityAndEthics",
      //   "BusinessOperation"
      // ];

      // console.log("ParseFranchiseDetails?.franchiseTags:",ParseFranchiseDetails?.franchiseTags)

      // if (ParseFranchiseDetails?.franchiseTags) {
      //     for (const field of arrayFields) {
      //       const value = ParseFranchiseDetails.franchiseTags[field];
      //       if (value !== undefined && value !== null) {
      //         updates.$set[`franchiseDetails.franchiseTags.${field}`] =
      //           Array.isArray(value) ? value : [value];
      //       }
      //     }
      //   }

      if (ParseFranchiseDetails?.franchiseTags) {
        const franchiseTagsFields = {
          PrimaryClassifications: "PrimaryClassifications",
          ProductServiceTypes: "ProductServiceTypes",
          TargetAudience: "TargetAudience",
          ServiceModel: "ServiceModel",
          PricingValue: "PricingValue",
          AmbienceExperience: "AmbienceExperience",
          FeaturesAmenities: "FeaturesAmenities",
          TechnologyIntegration: "TechnologyIntegration",
          SustainabilityEthics: "SustainabilityEthics",
          BusinessOperations: "BusinessOperations",
        };

        for (const [key, field] of Object.entries(franchiseTagsFields)) {
          const value = ParseFranchiseDetails.franchiseTags[key];
          if (value !== undefined && value !== null) {
            updates.$set[`franchiseDetails.franchiseTags.${field}`] =
              Array.isArray(value) ? value : [value];
          }
        }
      }
    }

    // ---------- Check if updates exist ----------
    // if (Object.keys(updates.$set).length === 0 && !expensionLocationData) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "No valid updates provided",
    //   });
    // }

    // ---------- Run Transaction ----------
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const updatedBrands = {};

      if (
        Object.keys(updates.$set).some((f) => f.startsWith("brandDetails."))
      ) {
        updatedBrands.brandDetails = await BrandDetails.findOneAndUpdate(
          { uuid: id },
          { $set: updates.$set },
          { new: true, runValidators: true, session }
        );
      }

      if (
        Object.keys(updates.$set).some((f) => f.startsWith("franchiseDetails."))
      ) {
        updatedBrands.franchiseDetails =
          await BrandFranchiseDetails.findOneAndUpdate(
            { brandOwnerId: id },
            { $set: updates.$set },
            { new: true, runValidators: true, session }
          );
      }

      await session.commitTransaction();
      session.endSession();

      const responseData = {
        brandDetails:
          updatedBrands.brandDetails ||
          (await BrandDetails.findOne({ uuid: id })),
        franchiseDetails:
          updatedBrands.franchiseDetails ||
          (await BrandFranchiseDetails.findOne({ brandOwnerId: id })),
        expensionLocationData: expensionLocationData || null,
      };
console.log("resposnse data",responseData);

      return res
        .status(200)
        .json(
          new ApiResponse(200, responseData, "✅ Brand updated successfully")
        );
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error updating brand:", error);
    return res.status(500).json({
      error: "Failed to update brand",
      details: error.message,
    });
  }
};

const expansionLocationData = async (id, add, remove) => {
  //  return add
  const oldExpansionLocationData = await BrandExpansionLocationData.findOne({
    brandOwnerId: id,
  });

  // Clone old data safely
  let updatedLocations = JSON.parse(
    JSON.stringify(
      oldExpansionLocationData.expansionLocationData?.currentOutletLocations
        ?.domestic?.locations || []
    )
  );
  let updatedInternationalLocations = JSON.parse(
    JSON.stringify(
      oldExpansionLocationData.expansionLocationData?.currentOutletLocations
        ?.international?.locations || []
    )
  );
  let updatedExpansionLocations = JSON.parse(
    JSON.stringify(
      oldExpansionLocationData.expansionLocationData?.expansionLocations
        ?.domestic?.locations || []
    )
  );
  let updatedInternationalExpansionLocations = JSON.parse(
    JSON.stringify(
      oldExpansionLocationData.expansionLocationData?.expansionLocations
        ?.international?.locations || []
    )
  );

  // ---------- CurrentOutletLocations ----------
  // ---------- REMOVE Logic ----------
  if (remove?.currentOutletLocations?.domestic) {
    // 1. Remove States
    if (remove.currentOutletLocations.domestic.state) {
      updatedLocations = updatedLocations.filter(
        (loc) =>
          !remove.currentOutletLocations.domestic.state.includes(loc.state)
      );
    }

    // 2. Remove Districts
    if (remove.currentOutletLocations.domestic.districts) {
      for (const [stateName, districts] of Object.entries(
        remove.currentOutletLocations.domestic.districts
      )) {
        const stateEntry = updatedLocations.find((l) => l.state === stateName);
        if (stateEntry) {
          stateEntry.districts = (stateEntry.districts || []).filter(
            (d) => !districts.includes(d.district)
          );

          // cleanup empty states
          if (stateEntry.districts.length === 0) {
            updatedLocations = updatedLocations.filter(
              (l) => l.state !== stateName
            );
          }
        }
      }
    }

    // 3. Remove Cities
    if (remove.currentOutletLocations.domestic.city) {
      for (const [stateName, districtsObj] of Object.entries(
        remove.currentOutletLocations.domestic.city
      )) {
        const stateEntry = updatedLocations.find((l) => l.state === stateName);
        if (stateEntry) {
          for (const [districtName, districtData] of Object.entries(
            districtsObj
          )) {
            const districtEntry = stateEntry.districts?.find(
              (d) => d.district === districtName
            );
            if (districtEntry) {
              districtEntry.cities = (districtEntry.cities || []).filter(
                (c) => !(districtData.city || []).includes(c)
              );

              // cleanup empty districts
              if (districtEntry.cities.length === 0) {
                stateEntry.districts = stateEntry.districts.filter(
                  (d) => d.district !== districtName
                );
              }
            }
          }

          // cleanup empty states
          if (!stateEntry.districts || stateEntry.districts.length === 0) {
            updatedLocations = updatedLocations.filter(
              (l) => l.state !== stateName
            );
          }
        }
      }
    }
  }

  // ---------- ADD Logic ----------
  if (add?.currentOutletLocations?.domestic) {
    // 1. Add States
    if (add.currentOutletLocations.domestic.state) {
      for (const loc of add.currentOutletLocations.domestic.state) {
        const locationObj =
          typeof loc === "string" ? { state: loc, districts: [] } : loc;
        let stateEntry = updatedLocations.find(
          (l) => l.state === locationObj.state
        );
        if (!stateEntry) {
          updatedLocations.push({
            ...locationObj,
            districts: locationObj.districts || [],
          });
        }
      }
    }

    // 2. Add Districts
    if (add.currentOutletLocations.domestic.districts) {
      for (const [stateName, districts] of Object.entries(
        add.currentOutletLocations.domestic.districts
      )) {
        let stateEntry = updatedLocations.find((l) => l.state === stateName);
        if (!stateEntry) {
          updatedLocations.push({
            state: stateName,
            districts: districts.map((d) => ({ district: d, cities: [] })),
          });
          continue;
        }

        stateEntry.districts = stateEntry.districts || [];
        for (const districtName of districts) {
          const existingDistrict = stateEntry.districts.find(
            (d) => d.district === districtName
          );
          if (!existingDistrict) {
            stateEntry.districts.push({ district: districtName, cities: [] });
          }
        }
      }
    }

    // 3. Add Cities
    if (add.currentOutletLocations.domestic.city) {
      for (const [stateName, districtsObj] of Object.entries(
        add.currentOutletLocations.domestic.city
      )) {
        let stateEntry = updatedLocations.find((l) => l.state === stateName);
        if (!stateEntry) {
          const newState = { state: stateName, districts: [] };
          for (const [districtName, districtData] of Object.entries(
            districtsObj
          )) {
            newState.districts.push({
              district: districtName,
              cities: Array.from(new Set(districtData.city || [])),
            });
          }
          updatedLocations.push(newState);
          continue;
        }

        stateEntry.districts = stateEntry.districts || [];
        for (const [districtName, districtData] of Object.entries(
          districtsObj
        )) {
          let districtEntry = stateEntry.districts.find(
            (d) => d.district === districtName
          );
          if (!districtEntry) {
            districtEntry = { district: districtName, cities: [] };
            stateEntry.districts.push(districtEntry);
          }
          districtEntry.cities = Array.from(
            new Set([
              ...(districtEntry.cities || []),
              ...(districtData.city || []),
            ])
          );
        }
      }
    }
  }

  // ---------- REMOVE international Logic ----------
  if (remove?.currentOutletLocations?.international) {
    console.log("International REMOVE Entry:", remove.currentOutletLocations);

    // 1. Remove Countries
    if (remove.currentOutletLocations.international.country) {
      for (const countryName of remove.currentOutletLocations.international
        .country) {
        updatedInternationalLocations = updatedInternationalLocations.filter(
          (l) => l.country !== countryName
        );
      }
    }

    // 2. Remove States
    if (remove.currentOutletLocations.international.states) {
      for (const [countryName, states] of Object.entries(
        remove.currentOutletLocations.international.states
      )) {
        let countryEntry = updatedInternationalLocations.find(
          (l) => l.country === countryName
        );
        if (!countryEntry) continue;

        countryEntry.states = (countryEntry.states || []).filter(
          (s) => !states.includes(s.state)
        );
      }
    }

    // 3. Remove Cities
    if (remove.currentOutletLocations.international.city) {
      for (const [countryName, statesObj] of Object.entries(
        remove.currentOutletLocations.international.city
      )) {
        let countryEntry = updatedInternationalLocations.find(
          (l) => l.country === countryName
        );
        if (!countryEntry) continue;

        for (const [stateName, stateData] of Object.entries(statesObj)) {
          let stateEntry = countryEntry.states?.find(
            (s) => s.state === stateName
          );
          if (!stateEntry) continue;

          stateEntry.cities = (stateEntry.cities || []).filter(
            (c) => !(stateData.city || []).includes(c)
          );
        }
      }
    }
  }

  // ---------- ADD international Logic ----------
  if (add?.currentOutletLocations?.international) {
    console.log("International Entry:", add.currentOutletLocations);

    // 1. Add Countries
    if (add.currentOutletLocations.international.country) {
      for (const loc of add.currentOutletLocations.international.country) {
        const locationObj =
          typeof loc === "string" ? { country: loc, states: [] } : loc;
        let countryEntry = updatedInternationalLocations.find(
          (l) => l.country === locationObj.country
        );
        if (!countryEntry) {
          updatedInternationalLocations.push({
            ...locationObj,
            states: locationObj.states || [],
          });
        }
      }
    }

    // 2. Add States (FIX: use .states instead of .state)
    if (add.currentOutletLocations.international.states) {
      console.log(
        "States Entry:",
        add.currentOutletLocations.international.states
      );

      for (const [countryName, states] of Object.entries(
        add.currentOutletLocations.international.states
      )) {
        let countryEntry = updatedInternationalLocations.find(
          (l) => l.country === countryName
        );

        // if country not present, create it
        if (!countryEntry) {
          updatedInternationalLocations.push({
            country: countryName,
            states: states.map((s) => ({ state: s, cities: [] })),
          });
          continue;
        }

        // merge states into existing country
        countryEntry.states = countryEntry.states || [];
        for (const stateName of states) {
          const existingState = countryEntry.states.find(
            (s) => s.state === stateName
          );
          if (!existingState) {
            countryEntry.states.push({ state: stateName, cities: [] });
          }
        }
      }
    }

    // 3. Add Cities
    if (add.currentOutletLocations.international.city) {
      for (const [countryName, statesObj] of Object.entries(
        add.currentOutletLocations.international.city
      )) {
        let countryEntry = updatedInternationalLocations.find(
          (l) => l.country === countryName
        );
        if (!countryEntry) {
          const newCountry = { country: countryName, states: [] };
          for (const [stateName, stateData] of Object.entries(statesObj)) {
            newCountry.states.push({
              state: stateName,
              cities: Array.from(
                new Set(stateData.city || stateData.cities || [])
              ),
            });
          }
          updatedInternationalLocations.push(newCountry);
          continue;
        }

        countryEntry.states = countryEntry.states || [];
        for (const [stateName, stateData] of Object.entries(statesObj)) {
          let stateEntry = countryEntry.states.find(
            (s) => s.state === stateName
          );
          if (!stateEntry) {
            stateEntry = { state: stateName, cities: [] };
            countryEntry.states.push(stateEntry);
          }
          stateEntry.cities = Array.from(
            new Set([...(stateEntry.cities || []), ...(stateData.city || [])])
          );
        }
      }
    }
  }

  // ---------- expansionLocations ----------
  // ---------- REMOVE Domestic Logic ----------
  if (remove?.expansionLocations?.domestic) {
    // 1. Remove States
    if (remove.expansionLocations.domestic.state) {
      updatedExpansionLocations = updatedExpansionLocations.filter(
        (loc) => !remove.expansionLocations.domestic.state.includes(loc.state)
      );
    }

    // 2. Remove Districts
    if (remove.expansionLocations.domestic.districts) {
      for (const [stateName, districts] of Object.entries(
        remove.expansionLocations.domestic.districts
      )) {
        const stateEntry = updatedExpansionLocations.find(
          (l) => l.state === stateName
        );
        if (stateEntry) {
          stateEntry.districts = (stateEntry.districts || []).filter(
            (d) => !districts.includes(d.district)
          );

          // cleanup empty states
          if (stateEntry.districts.length === 0) {
            updatedExpansionLocations = updatedExpansionLocations.filter(
              (l) => l.state !== stateName
            );
          }
        }
      }
    }

    // 3. Remove Cities
    if (remove.expansionLocations.domestic.city) {
      for (const [stateName, districtsObj] of Object.entries(
        remove.expansionLocations.domestic.city
      )) {
        const stateEntry = updatedExpansionLocations.find(
          (l) => l.state === stateName
        );
        if (stateEntry) {
          for (const [districtName, districtData] of Object.entries(
            districtsObj
          )) {
            const districtEntry = stateEntry.districts?.find(
              (d) => d.district === districtName
            );
            if (districtEntry) {
              districtEntry.cities = (districtEntry.cities || []).filter(
                (c) => !(districtData.city || []).includes(c)
              );

              // cleanup empty districts
              if (districtEntry.cities.length === 0) {
                stateEntry.districts = stateEntry.districts.filter(
                  (d) => d.district !== districtName
                );
              }
            }
          }

          // cleanup empty states
          if (!stateEntry.districts || stateEntry.districts.length === 0) {
            updatedExpansionLocations = updatedExpansionLocations.filter(
              (l) => l.state !== stateName
            );
          }
        }
      }
    }
  }

  // ---------- ADD Domestic Logic ----------
  if (add?.expansionLocations?.domestic) {
    // 1. Add States
    if (add.expansionLocations.domestic.state) {
      for (const loc of add.expansionLocations.domestic.state) {
        const locationObj =
          typeof loc === "string" ? { state: loc, districts: [] } : loc;
        let stateEntry = updatedExpansionLocations.find(
          (l) => l.state === locationObj.state
        );
        if (!stateEntry) {
          updatedExpansionLocations.push({
            ...locationObj,
            districts: locationObj.districts || [],
          });
        }
      }
    }

    // 2. Add Districts
    if (add.expansionLocations.domestic.districts) {
      for (const [stateName, districts] of Object.entries(
        add.expansionLocations.domestic.districts
      )) {
        let stateEntry = updatedExpansionLocations.find(
          (l) => l.state === stateName
        );
        if (!stateEntry) {
          updatedExpansionLocations.push({
            state: stateName,
            districts: districts.map((d) => ({ district: d, cities: [] })),
          });
          continue;
        }

        stateEntry.districts = stateEntry.districts || [];
        for (const districtName of districts) {
          const existingDistrict = stateEntry.districts.find(
            (d) => d.district === districtName
          );
          if (!existingDistrict) {
            stateEntry.districts.push({ district: districtName, cities: [] });
          }
        }
      }
    }

    // 3. Add Cities
    if (add.expansionLocations.domestic.city) {
      for (const [stateName, districtsObj] of Object.entries(
        add.expansionLocations.domestic.city
      )) {
        let stateEntry = updatedExpansionLocations.find(
          (l) => l.state === stateName
        );
        if (!stateEntry) {
          const newState = { state: stateName, districts: [] };
          for (const [districtName, districtData] of Object.entries(
            districtsObj
          )) {
            newState.districts.push({
              district: districtName,
              cities: Array.from(new Set(districtData.city || [])),
            });
          }
          updatedExpansionLocations.push(newState);
          continue;
        }

        stateEntry.districts = stateEntry.districts || [];
        for (const [districtName, districtData] of Object.entries(
          districtsObj
        )) {
          let districtEntry = stateEntry.districts.find(
            (d) => d.district === districtName
          );
          if (!districtEntry) {
            districtEntry = { district: districtName, cities: [] };
            stateEntry.districts.push(districtEntry);
          }
          districtEntry.cities = Array.from(
            new Set([
              ...(districtEntry.cities || []),
              ...(districtData.city || []),
            ])
          );
        }
      }
    }
  }

  // ---------- REMOVE International Logic ----------
  if (remove?.expansionLocations?.international) {
    console.log("International REMOVE Entry:", remove.expansionLocations);

    // 1. Remove Countries
    if (remove.expansionLocations.international.country) {
      for (const countryName of remove.expansionLocations.international
        .country) {
        updatedInternationalExpansionLocations =
          updatedInternationalExpansionLocations.filter(
            (l) => l.country !== countryName
          );
      }
    }

    // 2. Remove States
    if (remove.expansionLocations.international.states) {
      for (const [countryName, states] of Object.entries(
        remove.expansionLocations.international.states
      )) {
        let countryEntry = updatedInternationalExpansionLocations.find(
          (l) => l.country === countryName
        );
        if (!countryEntry) continue;

        countryEntry.states = (countryEntry.states || []).filter(
          (s) => !states.includes(s.state)
        );
      }
    }

    // 3. Remove Cities
    if (remove.expansionLocations.international.city) {
      for (const [countryName, statesObj] of Object.entries(
        remove.expansionLocations.international.city
      )) {
        let countryEntry = updatedInternationalExpansionLocations.find(
          (l) => l.country === countryName
        );
        if (!countryEntry) continue;

        for (const [stateName, stateData] of Object.entries(statesObj)) {
          let stateEntry = countryEntry.states?.find(
            (s) => s.state === stateName
          );
          if (!stateEntry) continue;

          stateEntry.cities = (stateEntry.cities || []).filter(
            (c) => !(stateData.city || []).includes(c)
          );
        }
      }
    }
  }

  // ---------- ADD International Logic ----------
  if (add?.expansionLocations?.international) {
    console.log("International Entry:", add.expansionLocations);

    // 1. Add Countries
    if (add.expansionLocations.international.country) {
      for (const loc of add.expansionLocations.international.country) {
        const locationObj =
          typeof loc === "string" ? { country: loc, states: [] } : loc;
        let countryEntry = updatedInternationalExpansionLocations.find(
          (l) => l.country === locationObj.country
        );
        if (!countryEntry) {
          updatedInternationalExpansionLocations.push({
            ...locationObj,
            states: locationObj.states || [],
          });
        }
      }
    }

    // 2. Add States
    if (add.expansionLocations.international.states) {
      console.log("States Entry:", add.expansionLocations.international.states);

      for (const [countryName, states] of Object.entries(
        add.expansionLocations.international.states
      )) {
        let countryEntry = updatedInternationalExpansionLocations.find(
          (l) => l.country === countryName
        );

        // if country not present, create it
        if (!countryEntry) {
          updatedInternationalExpansionLocations.push({
            country: countryName,
            states: states.map((s) => ({ state: s, cities: [] })),
          });
          continue;
        }

        // merge states into existing country
        countryEntry.states = countryEntry.states || [];
        for (const stateName of states) {
          const existingState = countryEntry.states.find(
            (s) => s.state === stateName
          );
          if (!existingState) {
            countryEntry.states.push({ state: stateName, cities: [] });
          }
        }
      }
    }

    // 3. Add Cities
    if (add.expansionLocations.international.city) {
      for (const [countryName, statesObj] of Object.entries(
        add.expansionLocations.international.city
      )) {
        let countryEntry = updatedInternationalExpansionLocations.find(
          (l) => l.country === countryName
        );
        if (!countryEntry) {
          const newCountry = { country: countryName, states: [] };
          for (const [stateName, stateData] of Object.entries(statesObj)) {
            newCountry.states.push({
              state: stateName,
              cities: Array.from(
                new Set(stateData.city || stateData.cities || [])
              ),
            });
          }
          updatedInternationalExpansionLocations.push(newCountry);
          continue;
        }

        countryEntry.states = countryEntry.states || [];
        for (const [stateName, stateData] of Object.entries(statesObj)) {
          let stateEntry = countryEntry.states.find(
            (s) => s.state === stateName
          );
          if (!stateEntry) {
            stateEntry = { state: stateName, cities: [] };
            countryEntry.states.push(stateEntry);
          }
          stateEntry.cities = Array.from(
            new Set([...(stateEntry.cities || []), ...(stateData.city || [])])
          );
        }
      }
    }
  }

  // ---------- Final Update ----------
  await BrandExpansionLocationData.findOneAndUpdate(
    { brandOwnerId: id },
    {
      $set: {
        "expansionLocationData.currentOutletLocations.domestic.locations":
          updatedLocations,
        "expansionLocationData.currentOutletLocations.international.locations":
          updatedInternationalLocations,
        "expansionLocationData.expansionLocations.domestic.locations":
          updatedExpansionLocations,
        "expansionLocationData.expansionLocations.international.locations":
          updatedInternationalExpansionLocations,
      },
    },
    { new: true, runValidators: true }
  );

  // Return updated data
  return await BrandExpansionLocationData.findOne({ brandOwnerId: id });
};

export const updateBrandImageById = async (req, res) => {
  try {
    const { imageDeleteData } = req.body;
    let data = null;

    if (imageDeleteData) {
      for (const [key, value] of Object.entries(imageDeleteData)) {
        console.log(`Field to delete from: ${key}`);
        for (const img of value) {
          await deleteFileFromR2(img);
          data = await BrandUploads.findOneAndUpdate(
            {
              $and: [
                { brandOwnerId: req.params.id },
                { [`uploads.${key}`]: { $in: [img] } },
              ],
            },
            { $pull: { [`uploads.${key}`]: img } },
            { new: true, runValidators: true }
          );
        }
      }
    }

    const fileFields = [
      "brandLogo",
      "franchisePromotionVideo",
      "gstCertificate",
      "pancard",
      "businessPlan",
    ];
    const multiFileFields = ["exteriorOutlet", "interiorOutlet"];

    const oldUploads = await BrandUploads.findOne({
      brandOwnerId: req.params.id,
    });

    if (!oldUploads) {
      return res
        .status(404)
        .json(
          new ApiResponse(404, {}, "No uploads found for this brand owner")
        );
    }

    for (const field of fileFields) {
      const uploadedFile = req.files?.[field]?.[0];
      if (uploadedFile) {
        if (oldUploads.uploads?.[field]?.length > 0) {
          await deleteFileFromR2(oldUploads.uploads[field][0]);
        }

        const newFileUrl = await uploadFileToR2(
          uploadedFile.path,
          uploadedFile.mimetype
        );

        data = await BrandUploads.findOneAndUpdate(
          { brandOwnerId: req.params.id },
          { $set: { [`uploads.${field}`]: [newFileUrl] } },
          { new: true, runValidators: true }
        );
      }
    }

    for (const field of multiFileFields) {
      const uploadedFiles = req.files?.[field];
      if (uploadedFiles && uploadedFiles.length > 0) {
        const newFileUrls = await Promise.all(
          uploadedFiles.map((file) => uploadFileToR2(file.path, file.mimetype))
        );

        data = await BrandUploads.findOneAndUpdate(
          { brandOwnerId: req.params.id },
          { $push: { [`uploads.${field}`]: { $each: newFileUrls } } },
          { new: true, runValidators: true }
        );
      }
    }

    return res.json(
      new ApiResponse(200, data, "Brand images updated successfully")
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          {},
          "Something went wrong while updating brand images"
        )
      );
  }
};

export const deleteBrandListingByUUID = async (req, res) => {
  try {
    // Get the UUID from params
    const { uuid } = req.params;
    console.log("Deletion request received for UUID:", uuid);

    if (!uuid) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "UUID parameter is required"));
    }

    // Delete documents from all related collections
    const [
      brandDetails,
      brandFranchiseDetails,
      brandExpansionLocationData,
      brandUploads,
    ] = await Promise.all([
      BrandDetails.findOneAndDelete({ uuid }),
      BrandFranchiseDetails.findOneAndDelete({ brandOwnerId: uuid }),
      BrandExpansionLocationData.findOneAndDelete({ brandOwnerId: uuid }),
      BrandUploads.findOneAndDelete({ brandOwnerId: uuid }),
    ]);

    // Log deletion results
    console.log("Delete results:", {
      brandDetails: brandDetails ? "found and deleted" : "not found",
      brandFranchiseDetails: brandFranchiseDetails
        ? "found and deleted"
        : "not found",
      brandExpansionLocationData: brandExpansionLocationData
        ? "found and deleted"
        : "not found",
      brandUploads: brandUploads ? "found and deleted" : "not found",
    });

    // Check if at least one document was found and deleted
    if (
      !brandDetails &&
      !brandFranchiseDetails &&
      !brandExpansionLocationData &&
      !brandUploads
    ) {
      console.log("No documents found with UUID:", uuid);
      return res
        .status(404)
        .json(new ApiResponse(404, null, "No brand found with the given ID"));
    }

    // Return success response with deleted documents
    return res.json(
      new ApiResponse(
        200,
        {
          brand: brandDetails,
          franchise: brandFranchiseDetails,
          locations: brandExpansionLocationData,
          uploads: brandUploads,
        },
        "Brand listing deleted successfully"
      )
    );
  } catch (error) {
    console.error("Delete operation failed:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(500, null, `Internal Server Error: ${error.message}`)
      );
  }
};

export const db = async (req, res) => {
  try {
    const data = await BrandListing.find({
      "franchiseDetails.fico.investmentRange": "Rs.5 L - 10 L",
    });

    // Loop over each matching document and update
    for (const item of data) {
      await BrandListing.findByIdAndUpdate(
        item._id,
        {
          $set: {
            "franchiseDetails.fico.0.investmentRange": "Rs. 5 L - 10 L",
          },
        },
        { new: true }
      );
    }

    console.log(data);
    return res.status(200).json({ updatedCount: data.length, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const reEntry = async (req, res) => {
  try {
    const data = await BrandListing.find({});
    const arr = data.map((d) => d._id);

    const successEntries = [];
    const skippedEntries = [];

    for (let index = 0; index < arr.length; index++) {
      try {
        const current = await BrandListing.findById({
          _id: new mongoose.Types.ObjectId(arr[index]),
        });

        const exists = await BrandDetails.findOne({
          "brandDetails.brandName": current.brandDetails.brandName,
        });

        if (exists) {
          skippedEntries.push({
            brandName: current.brandDetails.brandName,
            reason: "Brand already exists",
          });
          continue;
        }

        const generateUUID = uuid();

        const [
          newBrand,
          newBrandFranchiseDetails,
          newBrandExpansionLocationData,
          newBrandUploads,
        ] = await Promise.all([
          BrandDetails.create({
            brandID: current.brandID,
            uuid: generateUUID,
            brandDetails: current.brandDetails,
          }),
          BrandFranchiseDetails.create({
            brandOwnerId: generateUUID,
            franchiseDetails: current.franchiseDetails,
          }),
          BrandExpansionLocationData.create({
            brandOwnerId: generateUUID,
            expansionLocationData: current.expansionLocationData,
          }),
          BrandUploads.create({
            brandOwnerId: generateUUID,
            uploads: current.uploads,
          }),
        ]);

        successEntries.push({
          brandName: current.brandDetails.brandName,
          uuid: generateUUID,
        });
      } catch (innerErr) {
        console.error(`Error processing index ${index}:`, innerErr.message);
        skippedEntries.push({
          brandIndex: index,
          error: innerErr.message,
        });
        continue;
      }
    }

    return res.json(
      new ApiResponse(
        200,
        {
          successCount: successEntries.length,
          skippedCount: skippedEntries.length,
          successEntries,
          skippedEntries,
        },
        "Re-entry process completed"
      )
    );
  } catch (outerError) {
    console.error("Outer error:", outerError);
    return res.status(500).json({ message: "Server error" });
  }
};

export const allId = async (req, res) => {
  const data = await BrandListing.find({});

  console.log(data);

  const arr = [];
  const id = data.map((d) => {
    arr.push(d.brandID);
  });

  return res.json(new ApiResponse(200, arr, "fetch successfully"));
};

// export const getTopCafes = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 30;
//     const skip = (page - 1) * limit;
//     const id = req.query.id || null;
//     const { main, sub, child } = req.query;

//     const { likedBrands, shortListedBrands } = await likeandshortlist(id);

//     // Base match condition
//     const baseMatch = {
//       "franchiseDetails.brandCategories.child": "Coffee & Tea Cafes",
//       // "franchiseDetails.brandCategories.main": main,
//       // "franchiseDetails.brandCategories.child": child,
//     };

//     const aggregationPipeline = [
//       { $match: baseMatch },
//       {
//         $lookup: {
//           from: "branddetails",
//           localField: "brandOwnerId",
//           foreignField: "uuid",
//           as: "brandInfo",
//         },
//       },
//       {
//         $unwind: { path: "$brandInfo", preserveNullAndEmptyArrays: true },
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
//         $unwind: { path: "$uploads", preserveNullAndEmptyArrays: true },
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
//           isLiked: 1,
//           isShortListed: 1,
//           uuid: "$brandInfo.uuid",
//           brandId: "$brandInfo.brandID",
//           brandname: "$brandInfo.brandDetails.brandName",
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
//           logo: { $arrayElemAt: ["$uploads.uploads.brandLogo", 0] },
//           franchiseVideos: {
//             $arrayElemAt: ["$uploads.uploads.franchisePromotionVideo", 0],
//           },
//         },
//       },
//       { $skip: skip },
//       { $limit: limit },
//     ];

//     // 👇 Fix total count with the same filters (including isBrandPause)
//     const [brandsData, totalCountResult] = await Promise.all([
//       BrandFranchiseDetails.aggregate(aggregationPipeline),
//       BrandFranchiseDetails.aggregate([
//         { $match: baseMatch },
//         {
//           $lookup: {
//             from: "branddetails",
//             localField: "brandOwnerId",
//             foreignField: "uuid",
//             as: "brandInfo",
//           },
//         },
//         { $unwind: "$brandInfo" },
//         {
//           $match: {
//             "brandInfo.brandDetails.isBrandPause": { $ne: true },
//             "brandInfo.brandDetails.isApproved": { $ne: true },
//           },
//         },
//         { $count: "totalCount" },
//       ]),
//     ]);

//     const totalCount = totalCountResult[0]?.totalCount || 0;

//     if (!brandsData || brandsData.length === 0) {
//       return res.json(new ApiResponse(404, null, "No brands found"));
//     }

//     const brands = shuffleArray(brandsData);

//     const totalPages = Math.ceil(totalCount / limit);
//     const hasNext = page < totalPages;
//     const hasPrevious = page > 1;

//     return res.json(
//       new ApiResponse(
//         200,
//         {
//           brands,
//           pagination: {
//             total: totalCount,
//             totalPages,
//             currentPage: page,
//             limit,
//             hasNext,
//             hasPrevious,
//           },
//         },
//         "Brands fetched successfully"
//       )
//     );
//   } catch (error) {
//     console.error("Error fetching top cafes:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// export const getTopDesertAndBakery = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 30;
//     const skip = (page - 1) * limit;
//     const id = req.query.id || null;

//     // get liked & shortlisted brand IDs
//     const { likedBrands, shortListedBrands } = await likeandshortlist(id);

//     const aggregationPipeline = [
//       {
//         $match: {
//           "franchiseDetails.brandCategories.sub": "Dessert & Bakery",
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
//         $lookup: {
//           from: "branduploads",
//           localField: "brandOwnerId",
//           foreignField: "brandOwnerId",
//           as: "uploads",
//         },
//       },
//       { $unwind: { path: "$brandInfo", preserveNullAndEmptyArrays: true } },
//       {
//         $match: {
//           "brandInfo.brandDetails.isBrandPause": { $ne: true },
//           "brandInfo.brandDetails.isApproved": { $ne: true },
//         },
//       },
//       { $unwind: { path: "$uploads", preserveNullAndEmptyArrays: true } },
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
//           isLiked: 1,
//           isShortListed: 1,
//           uuid: "$brandInfo.uuid",
//           brandID: "$brandInfo.brandID",
//           brandname: "$brandInfo.brandDetails.brandName",
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
//           logo: { $arrayElemAt: ["$uploads.uploads.brandLogo", 0] },
//           franchiseVideos: {
//             $arrayElemAt: ["$uploads.uploads.franchisePromotionVideo", 0],
//           },
//         },
//       },
//       { $skip: skip },
//       { $limit: limit },
//     ];

//     // Fetch paginated data & total count
//     const [brandsData, totalCountResult] = await Promise.all([
//       BrandFranchiseDetails.aggregate(aggregationPipeline),
//       BrandFranchiseDetails.aggregate([
//         {
//           $lookup: {
//             from: "branddetails",
//             localField: "brandOwnerId",
//             foreignField: "uuid",
//             as: "brandInfo",
//           },
//         },
//         { $unwind: "$brandInfo" },
//         {
//           $match: {
//             "franchiseDetails.brandCategories.sub": "Dessert & Bakery",
//             "brandInfo.brandDetails.isBrandPause": { $ne: true },
//             "brandInfo.brandDetails.isApproved": { $ne: true },
//           },
//         },
//         { $count: "totalCount" },
//       ]),
//     ]);

//     const totalCount = totalCountResult[0]?.totalCount || 0;

//     if (!brandsData || brandsData.length === 0) {
//       return res.json(new ApiResponse(404, null, "No brands found"));
//     }

//     const brands = shuffleArray(brandsData);

//     const totalPages = Math.ceil(totalCount / limit);
//     const hasNext = page < totalPages;
//     const hasPrevious = page > 1;

//     return res.json(
//       new ApiResponse(
//         200,
//         {
//           brands,
//           pagination: {
//             total: totalCount,
//             totalPages,
//             currentPage: page,
//             limit,
//             hasNext,
//             hasPrevious,
//           },
//         },
//         "Brand fetched successfully"
//       )
//     );
//   } catch (error) {
//     console.error("Error fetching Dessert & Bakery brands::", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// export const getTopTrucksAndKiosks = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 30;
//     const skip = (page - 1) * limit;
//     const id = req.query.id || null;

//     const { likedBrands, shortListedBrands } = await likeandshortlist(id);

//     const aggregationPipeline = [
//       {
//         $match: {
//           "franchiseDetails.brandCategories.sub":
//             "Food Trucks & Kiosks Franchises",
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
//         $lookup: {
//           from: "branduploads",
//           localField: "brandOwnerId",
//           foreignField: "brandOwnerId",
//           as: "uploads",
//         },
//       },
//       { $unwind: { path: "$brandInfo", preserveNullAndEmptyArrays: true } },
//       {
//         $match: {
//           "brandInfo.brandDetails.isBrandPause": { $ne: true },
//           "brandInfo.brandDetails.isApproved": { $ne: true },
//         },
//       },
//       { $unwind: { path: "$uploads", preserveNullAndEmptyArrays: true } },
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
//           isLiked: 1,
//           isShortListed: 1,
//           uuid: "$brandInfo.uuid",
//           brandID: "$brandInfo.brandID",
//           brandname: "$brandInfo.brandDetails.brandName",
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
//           logo: { $arrayElemAt: ["$uploads.uploads.brandLogo", 0] },
//           franchiseVideos: {
//             $arrayElemAt: ["$uploads.uploads.franchisePromotionVideo", 0],
//           },
//         },
//       },
//       { $skip: skip },
//       { $limit: limit },
//     ];

//     const [brandsData, totalCountResult] = await Promise.all([
//       BrandFranchiseDetails.aggregate(aggregationPipeline),
//       BrandFranchiseDetails.aggregate([
//         {
//           $lookup: {
//             from: "branddetails",
//             localField: "brandOwnerId",
//             foreignField: "uuid",
//             as: "brandInfo",
//           },
//         },
//         { $unwind: "$brandInfo" },
//         {
//           $match: {
//             "franchiseDetails.brandCategories.sub":
//               "Food Trucks & Kiosks Franchises",
//             "brandInfo.brandDetails.isBrandPause": { $ne: true },
//             "brandInfo.brandDetails.isApproved": { $ne: true },
//           },
//         },
//         { $count: "totalCount" },
//       ]),
//     ]);

//     const totalCount = totalCountResult[0]?.totalCount || 0;

//     if (!brandsData || brandsData.length === 0) {
//       return res.json(new ApiResponse(404, null, "No brands found"));
//     }
//     const brands = shuffleArray(brandsData);

//     const totalPages = Math.ceil(totalCount / limit);
//     const hasNext = page < totalPages;
//     const hasPrevious = page > 1;

//     return res.json(
//       new ApiResponse(
//         200,
//         {
//           brands,
//           pagination: {
//             total: totalCount,
//             totalPages,
//             currentPage: page,
//             limit,
//             hasNext,
//             hasPrevious,
//           },
//         },
//         "Brand fetched successfully"
//       )
//     );
//   } catch (error) {
//     console.error("Error fetching Dessert & Bakery brands::", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// export const getTopRestaurants = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 30;
//     const skip = (page - 1) * limit;
//     const id = req.query.id || null;

//     const { likedBrands, shortListedBrands } = await likeandshortlist(id);

//     const aggregationPipeline = [
//       {
//         $match: {
//           $or: [
//             {
//               "franchiseDetails.brandCategories.child":
//                 "QSR (Quick Service Restaurants)",
//             },
//             {
//               "franchiseDetails.brandCategories.child":
//                 "Multi Cuisine Restaurants",
//             },
//             {
//               "franchiseDetails.brandCategories.child":
//                 "Seafood-Based Restaurants",
//             },
//             {
//               "franchiseDetails.brandCategories.child":
//                 "Vegetarian-Only Restaurants",
//             },
//             { "franchiseDetails.brandCategories.child": "Vegan Restaurants" },
//             {
//               "franchiseDetails.brandCategories.child":
//                 "Health-Focused Restaurants",
//             },
//           ],
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
//         $lookup: {
//           from: "branduploads",
//           localField: "brandOwnerId",
//           foreignField: "brandOwnerId",
//           as: "uploads",
//         },
//       },
//       {
//         $unwind: { path: "$brandInfo", preserveNullAndEmptyArrays: true },
//       },
//       {
//         $match: {
//           "brandInfo.brandDetails.isBrandPause": { $ne: true },
//           "brandInfo.brandDetails.isApproved": { $ne: true },
//         },
//       },
//       {
//         $unwind: { path: "$uploads", preserveNullAndEmptyArrays: true },
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
//           isLiked: 1,
//           isShortListed: 1,
//           uuid: "$brandInfo.uuid",
//           brandId: "$brandInfo.brandID",
//           brandname: "$brandInfo.brandDetails.brandName",
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
//           logo: { $arrayElemAt: ["$uploads.uploads.brandLogo", 0] },
//           franchiseVideos: {
//             $arrayElemAt: ["$uploads.uploads.franchisePromotionVideo", 0],
//           },
//         },
//       },
//       { $skip: skip },
//       { $limit: limit },
//     ];

//     // Fetch paginated data & total count
//     const [brandsData, totalCountResult] = await Promise.all([
//       BrandFranchiseDetails.aggregate(aggregationPipeline),
//       BrandFranchiseDetails.aggregate([
//         {
//           $lookup: {
//             from: "branddetails",
//             localField: "brandOwnerId",
//             foreignField: "uuid",
//             as: "brandInfo",
//           },
//         },
//         { $unwind: "$brandInfo" },
//         {
//           $match: {
//             $or: [
//               {
//                 "franchiseDetails.brandCategories.child":
//                   "QSR (Quick Service Restaurants)",
//               },
//               {
//                 "franchiseDetails.brandCategories.child":
//                   "Multi Cuisine Restaurants",
//               },
//               {
//                 "franchiseDetails.brandCategories.child":
//                   "Seafood-Based Restaurants",
//               },
//               {
//                 "franchiseDetails.brandCategories.child":
//                   "Vegetarian-Only Restaurants",
//               },
//               { "franchiseDetails.brandCategories.child": "Vegan Restaurants" },
//               {
//                 "franchiseDetails.brandCategories.child":
//                   "Health-Focused Restaurants",
//               },
//             ],
//             "brandInfo.brandDetails.isBrandPause": { $ne: true },
//             "brandInfo.brandDetails.isApproved": { $ne: true },
//           },
//         },
//         { $count: "totalCount" },
//       ]),
//     ]);

//     const totalCount = totalCountResult[0]?.totalCount || 0;

//     if (!brandsData || brandsData.length === 0) {
//       return res.json(new ApiResponse(404, null, "No brands found"));
//     }

//     const brands = shuffleArray(brandsData);

//     const totalPages = Math.ceil(totalCount / limit);
//     const hasNext = page < totalPages;
//     const hasPrevious = page > 1;

//     return res.json(
//       new ApiResponse(
//         200,
//         {
//           brands,
//           pagination: {
//             total: totalCount,
//             totalPages,
//             currentPage: page,
//             limit,
//             hasNext,
//             hasPrevious,
//           },
//         },
//         "Brands fetched successfully"
//       )
//     );
//   } catch (error) {
//     console.error("Error fetching top cafes:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

export const getBrandsByCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;
    const id = req.query.id || null;
    const childCategory = req.query.childCategory || null;
    const subCategory = req.query.subCategory || null;

    if (!childCategory && !subCategory) {
      return res.json(
        new ApiResponse(
          400,
          null,
          "Either childCategory or subCategory is required"
        )
      );
    }

    const { likedBrands, shortListedBrands } = await likeandshortlist(id);

    let mainCategory;
    let relatedCategories = [];
    let matchCondition = {};

    if (childCategory) {
      // When childCategory is provided
      const categoryInfo = await BrandFranchiseDetails.aggregate([
        {
          $match: {
            "franchiseDetails.brandCategories.child": childCategory,
          },
        },
        {
          $group: {
            _id: "$franchiseDetails.brandCategories.main",
            subCategories: {
              $addToSet: "$franchiseDetails.brandCategories.sub",
            },
          },
        },
        {
          $project: {
            _id: 0,
            mainCategory: "$_id",
            subCategories: 1,
          },
        },
      ]);

      if (!categoryInfo || categoryInfo.length === 0) {
        return res.json(new ApiResponse(404, null, "Child category not found"));
      }

      mainCategory = categoryInfo[0].mainCategory;
      relatedCategories = [childCategory]; // Only filter by specific child
      matchCondition = {
        "franchiseDetails.brandCategories.main": mainCategory,
        "franchiseDetails.brandCategories.child": childCategory,
      };
    } else if (subCategory) {
      // When subCategory is provided
      const categoryInfo = await BrandFranchiseDetails.aggregate([
        {
          $match: {
            "franchiseDetails.brandCategories.sub": subCategory,
          },
        },
        {
          $group: {
            _id: "$franchiseDetails.brandCategories.main",
            subCategories: {
              $addToSet: "$franchiseDetails.brandCategories.sub",
            },
          },
        },
        {
          $project: {
            _id: 0,
            mainCategory: "$_id",
            subCategories: 1,
          },
        },
      ]);

      if (!categoryInfo || categoryInfo.length === 0) {
        return res.json(new ApiResponse(404, null, "Sub category not found"));
      }

      mainCategory = categoryInfo[0].mainCategory;
      relatedCategories = categoryInfo[0].subCategories;
      matchCondition = {
        "franchiseDetails.brandCategories.main": mainCategory,
        "franchiseDetails.brandCategories.sub": { $in: relatedCategories },
      };
    }

    const aggregationPipeline = [
      { $match: matchCondition },
      {
        $lookup: {
          from: "branddetails",
          localField: "brandOwnerId",
          foreignField: "uuid",
          as: "brandInfo",
        },
      },
      { $unwind: { path: "$brandInfo", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          "brandInfo.brandDetails.isBrandPause": { $ne: true },
          "brandInfo.brandDetails.isApproved": { $ne: true },
        },
      },
      {
        $lookup: {
          from: "branduploads",
          localField: "brandOwnerId",
          foreignField: "brandOwnerId",
          as: "uploads",
        },
      },
      { $unwind: { path: "$uploads", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          isLiked: {
            $in: [
              "$brandInfo._id",
              likedBrands.map((id) => new mongoose.Types.ObjectId(id)),
            ],
          },
          isShortListed: {
            $in: [
              "$brandInfo._id",
              shortListedBrands.map((id) => new mongoose.Types.ObjectId(id)),
            ],
          },
        },
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
            $ifNull: ["$franchiseDetails.brandCategories", null],
          },
          fico: {
            $let: {
              vars: {
                data: { $arrayElemAt: ["$franchiseDetails.fico", 0] },
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

    const [brandsData, totalCount] = await Promise.all([
      BrandFranchiseDetails.aggregate(aggregationPipeline),
      BrandFranchiseDetails.countDocuments(matchCondition),
    ]);

    if (!brandsData || brandsData.length === 0) {
      return res.json(
        new ApiResponse(404, null, "No brands found for this category")
      );
    }

    // Remove the shuffleArray function call and just use brandsData directly
    const brands = brandsData;

    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return res.json(
      new ApiResponse(
        200,
        {
          mainCategory,
          relatedCategories,
          currentCategory: childCategory || subCategory,
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
        "Brands fetched successfully by category"
      )
    );
  } catch (error) {
    console.error("Error fetching brands by category:", error);
    return res.json(
      new ApiResponse(500, null, `Failed to fetch brands: ${error.message}`)
    );
  }
};

export const getBrandById = async (req, res) => {
  const { id } = req.params;
  console.log("Brand ID requested:", id);

  const brand = req.brandUser;
  // if (id !== brand?.uuid) {
  //   return res.json(
  //     new ApiResponse(401,null,"Unathorize request")
  //   )
  // }
  try {
    const data = await BrandDetails.aggregate([
      {
        $match: {
          uuid: id,
        },
      },
      {
        $lookup: {
          from: "brandfranchisedetails",
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "brandfranchisedetails",
        },
      },
      {
        $unwind: {
          path: "$brandfranchisedetails",
          preserveNullAndEmptyArrays: true,
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
          as: "brandexpansionlocationdatas",
        },
      },
      {
        $lookup: {
          from: "viewedtobrands",
          localField: "_id",
          foreignField: "brandUserID",
          as: "totalViewData",
        },
      },
      {
        $addFields: {
          totalInvestorViews: {
            $cond: [
              { $gt: [{ $size: "$totalViewData" }, 0] },
              {
                $size: {
                  $arrayElemAt: ["$totalViewData.viewedByInvestors", 0],
                },
              },
              0,
            ],
          },
          totalBrandViews: {
            $cond: [
              { $gt: [{ $size: "$totalViewData" }, 0] },
              { $size: { $arrayElemAt: ["$totalViewData.viewedByBrands", 0] } },
              0,
            ],
          },
        },
      },
      {
        $lookup: {
          from: "shortlisteds",
          localField: "_id",
          foreignField: "brandOwnerId",
          as: "shortlisteds",
        },
      },
      {
        $addFields: {
          totalSortlistCount: {
            $cond: [
              { $isArray: "$shortlisteds" },
              { $size: "$shortlisteds" },
              0,
            ],
          },
        },
      },
      {
        $lookup: {
          from: "favoritebrands",
          localField: "_id",
          foreignField: "brandOwnerId",
          as: "favoritebrands",
        },
      },
      {
        $addFields: {
          totalLikedCount: {
            $sum: {
              $map: {
                input: "$favoritebrands",
                in: { $size: { $ifNull: ["$$this.favoriteBy", []] } },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          uuid: 1,
          brandDetails: 1,
          brandID: 1,
          franchiseDetails: "$brandfranchisedetails.franchiseDetails",
          uploads: {
            $let: {
              vars: {
                firstUpload: { $arrayElemAt: ["$uploads", 0] } || null,
              },
              in: {
                logo: {
                  $ifNull: [
                    { $arrayElemAt: ["$$firstUpload.uploads.brandLogo", 0] },
                    null,
                  ],
                },
                franchiseVideos: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        "$$firstUpload.uploads.franchisePromotionVideo",
                        0,
                      ],
                    },
                    null,
                  ],
                },
                exteriorOutlet: {
                  $ifNull: ["$$firstUpload.uploads.exteriorOutlet", 0],
                },
                interiorOutlet: {
                  $ifNull: ["$$firstUpload.uploads.interiorOutlet", 0],
                },
                businessPlan: {
                  $ifNull: [
                    { $arrayElemAt: ["$$firstUpload.uploads.businessPlan", 0] },
                    null,
                  ],
                },
                gstCertificate: {
                  $ifNull: [
                    {
                      $arrayElemAt: ["$$firstUpload.uploads.gstCertificate", 0],
                    },
                    null,
                  ],
                },
                pancard: {
                  $ifNull: [
                    { $arrayElemAt: ["$$firstUpload.uploads.pancard", 0] },
                    null,
                  ],
                },
                awards: {
                  $cond: {
                    if: {
                      $and: [
                        { $isArray: "$$firstUpload.uploads.awards" },
                        { $gt: [{ $size: "$$firstUpload.uploads.awards" }, 0] },
                      ],
                    },
                    then: {
                      $map: {
                        input: "$$firstUpload.uploads.awards",
                        as: "award",
                        in: {
                          awardDescription: "$$award.awardDescription",
                          awardImage: "$$award.awardImage",
                        },
                      },
                    },
                    else: [],
                  },
                },
              },
            },
          },
          expansionlocationdata: {
            $let: {
              vars: {
                data: { $arrayElemAt: ["$brandexpansionlocationdatas", 0] },
              },
              in: {
                currentOutletLocations:
                  "$$data.expansionLocationData.currentOutletLocations",
                expansionLocations:
                  "$$data.expansionLocationData.expansionLocations",
                isInternationalExpansion:
                  "$$data.expansionLocationData.isInternationalExpansion",
              },
            },
          },
          totalViewCount: {
            $add: ["$totalInvestorViews", "$totalBrandViews"],
          },
          totalSortlistCount: 1,
          totalLikedCount: 1,
        },
      },
    ]);

    return res.json(
      new ApiResponse(200, data[0], "✅ Brand fetched successfully")
    );
  } catch (error) {
    console.error("getBrandListingByUUID error:", error);
    return res.json(new ApiResponse(500, null, "Failed to fetch brand"));
  }
};

export {
  createBrandListing,
  getAllBrands,
  getBrandListingByUUID,
  updateBrandListingByUUID,
  // deleteBrandListingByUUID,
};
