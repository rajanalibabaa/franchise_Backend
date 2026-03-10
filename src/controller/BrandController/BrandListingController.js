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
// import NewIncomingBrands from "../../model/Brand/newIncomigBrands.js";
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
          b.brandID.toString(),
        ) || [];

      const investorShortList = await ShortListed.find({
        "ShortListedBy.investor.userId": investor._id,
      });
      shortListedBrands = investorShortList.map((s) =>
        s.brandOwnerId.toString(),
      );
    } else {
      const brand = await BrandDetails.findOne({ uuid: id });

      if (brand) {
        const brandFavorites = await FavoriteBrandsLikedBybrand.findOne({
          brandUserId: brand._id,
        });
        likedBrands =
          brandFavorites?.favoriteBrandBybrand.map((b) =>
            b.brandID.toString(),
          ) || [];

        const brandShortList = await ShortListed.find({
          "ShortListedBy.brand.userId": brand._id,
        });
        shortListedBrands = brandShortList.map((s) =>
          s.brandOwnerId.toString(),
        );
      }
    }
  }

  // console.log("shortListedBrands :",shortListedBrands)

  return { likedBrands, shortListedBrands };
};

const slugify = (text) => {
  if (!text || typeof text !== "string") return null;

  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};




const createBrandListing = async (req, res) => {
  try {
    const { admin } = req.body;
    const id = uuid();
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
    const expansionLocationData = safeJsonParse(
      req.body?.expansionLocationData,
    );
    const brandName = brandDetails?.brandName;

    console.log("brandDetails :", brandDetails)
    console.log("brandDetails.paymentPackage :", brandDetails.paymentPackage)

    if (!brandName) {
      return res.json(
        new ApiResponse(400, {}, "brandDetails.brandName is required")
      );
    }

    let baseSlug = slugify(brandName);

    if (!baseSlug) {
      return res.json(
        new ApiResponse(400, {}, "Invalid brand name for slug generation")
      );
    }

    let slug = baseSlug;
    let count = 1;


    // IMPORTANT: check nested slug
    while (
      await BrandDetails.exists({
        "brandDetails.slug": slug,
      })
    ) {
      slug = `${baseSlug}-${count++}`;
    }

    // Inject slug into brandDetails
    brandDetails.slug = slug;


    if (brandDetails?.paymentPackage) {
      // brandDetails.paymentPackage = "basic" or "premium"

      const PaymentPackagesData = await PaymentPackages.findOne({}).lean();

      const selectedPackageName = brandDetails.paymentPackage;

      // Find matching package from packages[]
      const matched = PaymentPackagesData?.packages.find(
        (pkg) => pkg.packageName === selectedPackageName,
      );
      console.log("matched", matched);

      if (matched) {
        const packageStartDate = new Date();
        const packageEndDate = new Date(packageStartDate);
        packageEndDate.setMonth(packageEndDate.getMonth() + matched.totalMonths);

        const matchedPackage = {
          ...matched,
          packageType: matched.packageName,
          isActive: true,
          packageUpdatedTime: packageStartDate,
          packageEndDate: packageEndDate,
        };

        // Save FULL OBJECT into brandDetails.paymentPackage
        brandDetails.paymentPackage = matchedPackage;
      } else {
        console.log("No matching package found for:", selectedPackageName);
      }
    }

    // console.log("updated data:", brandDetails);

    // Validate required fields
    if (!brandDetails || !franchiseDetails || !expansionLocationData) {
      return res.json(
        new ApiResponse(
          400,
          {},
          "Required fields (brandDetails, franchiseDetails, expansionLocationData) are missing",
        ),
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
          Boolean,
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
            normalizeDistrictData(d, loc[key]),
          );
        }
        return loc;
      });
    };

    // Normalize location data
    if (expansionLocationData?.expansionLocations?.domestic?.locations) {
      expansionLocationData.expansionLocations.domestic.locations =
        normalizeLocations(
          expansionLocationData.expansionLocations.domestic.locations,
        );
    }

    if (expansionLocationData?.currentOutletLocations?.domestic?.locations) {
      expansionLocationData.currentOutletLocations.domestic.locations =
        normalizeLocations(
          expansionLocationData.currentOutletLocations.domestic.locations,
        );
    }

    if (expansionLocationData?.expansionLocations?.international?.country) {
      expansionLocationData.expansionLocations.international.country =
        normalizeLocations(
          expansionLocationData.expansionLocations.international.country,
          true,
        );
    }

    if (expansionLocationData?.currentOutletLocations?.international?.country) {
      expansionLocationData.currentOutletLocations.international.country =
        normalizeLocations(
          expansionLocationData.currentOutletLocations.international.country,
          true,
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
            const uploadedUrl = await uploadFileToR2(file.path, file.mimetype, {
              convertToHLS: isVideo,
            });
            // console.log(`✅ Uploaded ${field}:`, uploadedUrl);
            return uploadedUrl;
          }),
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

    if (admin) {
      // Create all records in parallel after getting the UUID

      const [
        newBrand,
        newBrandFranchiseDetails,
        newBrandExpansionLocationData,
        newBrandUploads,
      ] = await Promise.all([
        BrandDetails.create({
          brandID,
          uuid: id,
          brandDetails,
        }),
        BrandFranchiseDetails.create({
          brandOwnerId: id,
          franchiseDetails,
        }),
        BrandExpansionLocationData.create({
          brandOwnerId: id,
          expansionLocationData,
        }),
        BrandUploads.create({
          brandOwnerId: id,
          uploads: {
            brandLogo: uploadedFiles.brandLogo || [],
            gstCertificate: uploadedFiles.gstCertificate || [],
            pancard: uploadedFiles.pancard || [],
            exteriorOutlet: uploadedFiles.exteriorOutlet || [],
            interiorOutlet: uploadedFiles.interiorOutlet || [],
            franchisePromotionVideo:
              uploadedFiles.franchisePromotionVideo || [],
            brandPromotionVideo: uploadedFiles.brandPromotionVideo || [],
            businessPlan: uploadedFiles.businessPlan || [],
            awards,
          },
        }),
      ]);

      // Check if all records were created successfully
      if (
        !newBrand ||
        !newBrandFranchiseDetails ||
        !newBrandExpansionLocationData ||
        !newBrandUploads
      ) {
        return res.json(
          new ApiResponse(
            500,
            {},
            "Failed to create one or more brand records",
          ),
        );
      }

      return res.json(
        new ApiResponse(
          201,
          {
            brand: newBrand,
            franchise: newBrandFranchiseDetails,
            locations: newBrandExpansionLocationData,
            uploads: newBrandUploads,
          },
          "Brand listing created successfully",
        ),
      );
    }

    const [
      newBrand,
      newBrandFranchiseDetails,
      newBrandExpansionLocationData,
      newBrandUploads,
    ] = await Promise.all([
      BrandDetails.create({
        brandID,
        uuid: id,
        brandDetails,
      }),
      BrandFranchiseDetails.create({
        brandOwnerId: id,
        franchiseDetails,
      }),
      BrandExpansionLocationData.create({
        brandOwnerId: id,
        expansionLocationData,
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
          awards,
        },
      }),
    ]);

    // Check if all records were created successfully
    if (
      !newBrand ||
      !newBrandFranchiseDetails ||
      !newBrandExpansionLocationData ||
      !newBrandUploads
    ) {
      return res.json(
        new ApiResponse(500, {}, "Failed to create one or more brand records"),
      );
    }

    return res.json(
      new ApiResponse(
        201,
        {
          brand: newBrand,
          franchise: newBrandFranchiseDetails,
          locations: newBrandExpansionLocationData,
          uploads: newBrandUploads,
        },
        "Brand listing created successfully",
      ),
    );
  } catch (error) {
    console.error("❌ Error in createBrandListing:", error);
    return res.json(
      new ApiResponse(
        500,
        {},
        `Failed to create brand listing: ${error.message}`,
      ),
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
          slug: "$brandDetails.slug",
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

// const getBrandListingByUUID = async (req, res) => {
//   const { id } = req.params;
//   const userId = req.query.userId || null;
//   const paymentHistory = req.query.paymentHistory || null;

//   try {
//       const brandIdentifier = id.replace(/-/g, " ");

//     const { likedBrands, shortListedBrands } = await likeandshortlist(userId);
//     const aggregationPipeline = [
//       {
//       $match: {
//       $or: [
//       { uuid: id },
//       { "brandDetails.brandName": {
//         $regex: `^${brandIdentifier}$`,
//         $options: "i",
//       } }
//       ]
//       }
//       },
//       {
//         $lookup: {
//           from: "brandfranchisedetails",
//           localField: "uuid",
//           foreignField: "brandOwnerId",
//           as: "brandfranchisedetails",
//         },
//       },
//       {
//         $lookup: {
//           from: "branduploads",
//           localField: "uuid",
//           foreignField: "brandOwnerId",
//           as: "uploads",
//         },
//       },
//       {
//         $lookup: {
//           from: "brandexpansionlocationdatas",
//           localField: "uuid",
//           foreignField: "brandOwnerId",
//           as: "brandexpansionlocationdatas",
//         },
//       },
//       {
//         $addFields: {
//           isLiked: {
//             $in: [
//               "$_id",
//               likedBrands.map((id) => new mongoose.Types.ObjectId(id)),
//             ],
//           },
//           isShortListed: {
//             $in: [
//               "$_id",
//               shortListedBrands.map((id) => new mongoose.Types.ObjectId(id)),
//             ],
//           },
//         },
//       },
//     ];

//     let projectStage = {
//       _id: 0,
//       uuid: 1,
//       isLiked: 1,
//       isShortListed: 1,
//       brandDetails: {
//         companyName: "$brandDetails.companyName",
//         brandName: "$brandDetails.brandName",
//         tagLine: "$brandDetails.tagLine",
//         brandID: "$brandID",
//         state: "$brandDetails.state",
//         city: "$brandDetails.city",
//         paymentPackage: "$brandDetails.paymentPackage",
//         listingPackages: "$brandDetails.listingPackages",
//       },
//       brandfranchisedetails: {
//         $let: {
//           vars: {
//             firstFranchise: { $arrayElemAt: ["$brandfranchisedetails", 0] },
//           },
//           in: {
//             franchiseDetails: "$$firstFranchise.franchiseDetails",
//           },
//         },
//       },
//       uploads: {
//         $let: {
//           vars: {
//             firstUpload: { $arrayElemAt: ["$uploads", 0] } || null,
//           },
//           in: {
//             logo: {
//               $ifNull: [
//                 { $arrayElemAt: ["$$firstUpload.uploads.brandLogo", 0] },
//                 null,
//               ],
//             },
//             franchiseVideos: {
//               $ifNull: [
//                 {
//                   $arrayElemAt: [
//                     "$$firstUpload.uploads.franchisePromotionVideo",
//                     0,
//                   ],
//                 },
//                 null,
//               ],
//             },
//             exteriorOutlet: {
//               $ifNull: ["$$firstUpload.uploads.exteriorOutlet", 0],
//             },
//             interiorOutlet: {
//               $ifNull: ["$$firstUpload.uploads.interiorOutlet", 0],
//             },
//             awards: {
//               $cond: {
//                 if: {
//                   $and: [
//                     { $isArray: "$$firstUpload.uploads.awards" },
//                     { $gt: [{ $size: "$$firstUpload.uploads.awards" }, 0] },
//                   ],
//                 },
//                 then: {
//                   $map: {
//                     input: "$$firstUpload.uploads.awards",
//                     as: "award",
//                     in: {
//                       awardDescription: "$$award.awardDescription",
//                       awardImage: "$$award.awardImage",
//                     },
//                   },
//                 },
//                 else: [],
//               },
//             },
//           },
//         },
//       },
//       brandexpansionlocationdatas: {
//         $let: {
//           vars: {
//             data: { $arrayElemAt: ["$brandexpansionlocationdatas", 0] },
//           },
//           in: {
//             currentOutletLocations:
//               "$$data.expansionLocationData.currentOutletLocations",
//             expansionLocations:
//               "$$data.expansionLocationData.expansionLocations",
//           },
//         },
//       },
//     };
//     aggregationPipeline.push({ $project: projectStage });

//     if (paymentHistory === "true") {
//       aggregationPipeline.push(
//         {
//           $lookup: {
//             from: "paymentpackagehistories",
//             localField: "uuid",
//             foreignField: "uuid",
//             as: "oldPackageHistory",
//           },
//         },
//         {
//           $unwind: {
//             path: "$oldPackageHistory",
//             preserveNullAndEmptyArrays: true,
//           },
//         }
//       );
//       projectStage.oldPackageHistory = "$oldPackageHistory.paymentPackage";
//     }
//     const data = await BrandDetails.aggregate(aggregationPipeline);

//     return res.json(
//       new ApiResponse(200, data, "✅ Brand fetched successfully")
//     );
//   } catch (error) {
//     console.error("Error fetching top food franchises:", error);
//     return res.json(
//       new ApiResponse(
//         500,
//         null,
//         `Failed to fetch top food franchises: ${error.message}`
//       )
//     );
//   }
// };

const getBrandListingSlug = async (req, res) => {
  const { identifier } = req.params; // slug OR uuid
  const userId = req.query.userId || null;
  const paymentHistory = req.query.paymentHistory === "true";

  try {
    const { likedBrands, shortListedBrands } =
      await likeandshortlist(userId);


    const slugifyForRegex = (text) => {
      if (!text) return "";

      // Lowercase and remove any leading/trailing spaces
      const cleanText = text.toLowerCase().trim();

      // Split the text into characters ignoring non-alphanumeric chars
      const letters = cleanText.replace(/[^a-z0-9]/g, "").split("");

      // Join letters with optional [-\s]* so gaps, hyphens, or no gaps all match
      return letters.join("[-\\s]*");
    };



    const aggregationPipeline = [
      {
        $match: {
          $or: [
            // 1️⃣ Primary: SLUG (SEO route)
            {
              "brandDetails.slug": {
                $regex: `^${slugifyForRegex(identifier)}$`,
                $options: "i",
              }
            },

            // 2️⃣ Fallback: UUID (old URLs / internal use)
            { uuid: identifier },
          ],
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
    ];

    let projectStage = {
      _id: 0,
      uuid: 1,
      isLiked: 1,
      isShortListed: 1,
      brandDetails: {
        companyName: "$brandDetails.companyName",
        brandName: "$brandDetails.brandName",
        whatsappNumber: "$brandDetails?.whatsappNumber",
        slug: "$brandDetails.slug", // ✅ include slug
        tagLine: "$brandDetails.tagLine",
        state: "$brandDetails.state",
        city: "$brandDetails.city",
        whatsappnumber: "$brandDetails.whatsappNumber",
        paymentPackage: "$brandDetails.paymentPackage",
        listingPackages: "$brandDetails.listingPackages",
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
            firstUpload: { $arrayElemAt: ["$uploads", 0] },
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
    };

    aggregationPipeline.push({ $project: projectStage });

    if (paymentHistory) {
      aggregationPipeline.push(
        {
          $lookup: {
            from: "paymentpackagehistories",
            localField: "uuid",
            foreignField: "uuid",
            as: "oldPackageHistory",
          },
        },
        {
          $unwind: {
            path: "$oldPackageHistory",
            preserveNullAndEmptyArrays: true,
          },
        },
      );
      projectStage.oldPackageHistory =
        "$oldPackageHistory.paymentPackage";
    }

    const data = await BrandDetails.aggregate(aggregationPipeline);
    if (!data || data.length === 0) {
      return res.status(404).json(
        new ApiResponse(404, [], "❌ Brand not found")
      );
    }
    return res.json(
      new ApiResponse(200, data, "✅ Brand fetched successfully"),
    );
  } catch (error) {
    console.error("Error fetching brand:", error);
    return res.status(500).json(
      new ApiResponse(500, null, error.message)
    );
  }
};



const updateBrandListingByUUID = async (req, res) => {
  try {
    const { id } = req.params;

    // console.log("id :", id);

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

    const isInternationalExpansion = safeParse(req.body.isInternationalExpansion) || req.body.isInternationalExpansion;
    // console.log("isInternationalExpansion :", isInternationalExpansion)

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
        removeExpansionLocationData,
        isInternationalExpansion
      );
    }

    // ---------- Updates Container ----------
    const updates = { $set: {} };





    // ---------- Parse brand & franchise ----------
    const ParseBrandDetails = safeParse(req.body.brandDetails);
    const ParseFranchiseDetails = safeParse(req.body.franchiseDetails);

    // console.log("BrandDetails:", ParseBrandDetails);
    // console.log("FranchiseDetails", ParseFranchiseDetails);

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
        const brandCategoriesFields = [
          "main",
          "sub",
          "groupId",
          "productTags",
          "serviceTags",
        ];
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

        console.log(
          "ParseFranchiseDetails.uniqueSellingPoints:",
          ParseFranchiseDetails.uniqueSellingPoints
        );
        console.log("type:", typeof ParseFranchiseDetails.uniqueSellingPoints);

        if (ParseFranchiseDetails.uniqueSellingPoints.length === 0) {
          updates.$set["franchiseDetails.uniqueSellingPoints"] = [];
        } else {
          updates.$set["franchiseDetails.uniqueSellingPoints"] =
            ParseFranchiseDetails.uniqueSellingPoints;
        }
      }
      if (Array.isArray(ParseFranchiseDetails.trainingSupport)) {

        if (ParseFranchiseDetails.trainingSupport.length === 0) {
          updates.$set[`franchiseDetails.trainingSupport`] = [];
        } else {
          ParseFranchiseDetails.trainingSupport.forEach((item, index) => {
            updates.$set[`franchiseDetails.trainingSupport.${index}`] = item;
          });
        }
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
          { new: true, runValidators: true, session },
        );
      }

      if (
        Object.keys(updates.$set).some((f) => f.startsWith("franchiseDetails."))
      ) {
        updatedBrands.franchiseDetails =
          await BrandFranchiseDetails.findOneAndUpdate(
            { brandOwnerId: id },
            { $set: updates.$set },
            { new: true, runValidators: true, session },
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
      // console.log("resposnse data", responseData);

      return res
        .status(200)
        .json(
          new ApiResponse(200, responseData, "✅ Brand updated successfully"),
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

const expansionLocationData = async (id, add, remove, isInternationalExpansion) => {
  //  return add
  const oldExpansionLocationData = await BrandExpansionLocationData.findOne({
    brandOwnerId: id,
  });

  // Clone old data safely
  let updatedLocations = JSON.parse(
    JSON.stringify(
      oldExpansionLocationData.expansionLocationData?.currentOutletLocations
        ?.domestic?.locations || [],
    ),
  );
  let updatedInternationalLocations = JSON.parse(
    JSON.stringify(
      oldExpansionLocationData.expansionLocationData?.currentOutletLocations
        ?.international?.locations || [],
    ),
  );
  let updatedExpansionLocations = JSON.parse(
    JSON.stringify(
      oldExpansionLocationData.expansionLocationData?.expansionLocations
        ?.domestic?.locations || [],
    ),
  );
  let updatedInternationalExpansionLocations = JSON.parse(
    JSON.stringify(
      oldExpansionLocationData.expansionLocationData?.expansionLocations
        ?.international?.locations || [],
    ),
  );

  // ---------- CurrentOutletLocations ----------
  // ---------- REMOVE Logic ----------
  if (remove?.currentOutletLocations?.domestic) {
    // 1. Remove States
    if (remove.currentOutletLocations.domestic.state) {
      updatedLocations = updatedLocations.filter(
        (loc) =>
          !remove.currentOutletLocations.domestic.state.includes(loc.state),
      );
    }

    // 2. Remove Districts
    if (remove.currentOutletLocations.domestic.districts) {
      for (const [stateName, districts] of Object.entries(
        remove.currentOutletLocations.domestic.districts,
      )) {
        const stateEntry = updatedLocations.find((l) => l.state === stateName);
        if (stateEntry) {
          stateEntry.districts = (stateEntry.districts || []).filter(
            (d) => !districts.includes(d.district),
          );

          // cleanup empty states
          if (stateEntry.districts.length === 0) {
            updatedLocations = updatedLocations.filter(
              (l) => l.state !== stateName,
            );
          }
        }
      }
    }

    // 3. Remove Cities
    if (remove.currentOutletLocations.domestic.city) {
      for (const [stateName, districtsObj] of Object.entries(
        remove.currentOutletLocations.domestic.city,
      )) {
        const stateEntry = updatedLocations.find((l) => l.state === stateName);
        if (stateEntry) {
          for (const [districtName, districtData] of Object.entries(
            districtsObj,
          )) {
            const districtEntry = stateEntry.districts?.find(
              (d) => d.district === districtName,
            );
            if (districtEntry) {
              districtEntry.cities = (districtEntry.cities || []).filter(
                (c) => !(districtData.city || []).includes(c),
              );

              // cleanup empty districts
              if (districtEntry.cities.length === 0) {
                stateEntry.districts = stateEntry.districts.filter(
                  (d) => d.district !== districtName,
                );
              }
            }
          }

          // cleanup empty states
          if (!stateEntry.districts || stateEntry.districts.length === 0) {
            updatedLocations = updatedLocations.filter(
              (l) => l.state !== stateName,
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
          (l) => l.state === locationObj.state,
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
        add.currentOutletLocations.domestic.districts,
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
            (d) => d.district === districtName,
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
        add.currentOutletLocations.domestic.city,
      )) {
        let stateEntry = updatedLocations.find((l) => l.state === stateName);
        if (!stateEntry) {
          const newState = { state: stateName, districts: [] };
          for (const [districtName, districtData] of Object.entries(
            districtsObj,
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
          districtsObj,
        )) {
          let districtEntry = stateEntry.districts.find(
            (d) => d.district === districtName,
          );
          if (!districtEntry) {
            districtEntry = { district: districtName, cities: [] };
            stateEntry.districts.push(districtEntry);
          }
          districtEntry.cities = Array.from(
            new Set([
              ...(districtEntry.cities || []),
              ...(districtData.city || []),
            ]),
          );
        }
      }
    }
  }

  // ---------- REMOVE international Logic ----------
  if (remove?.currentOutletLocations?.international) {
    // console.log("International REMOVE Entry:", remove.currentOutletLocations);

    // 1. Remove Countries
    if (remove.currentOutletLocations.international.country) {
      for (const countryName of remove.currentOutletLocations.international
        .country) {
        updatedInternationalLocations = updatedInternationalLocations.filter(
          (l) => l.country !== countryName,
        );
      }
    }

    // 2. Remove States
    if (remove.currentOutletLocations.international.states) {
      for (const [countryName, states] of Object.entries(
        remove.currentOutletLocations.international.states,
      )) {
        let countryEntry = updatedInternationalLocations.find(
          (l) => l.country === countryName,
        );
        if (!countryEntry) continue;

        countryEntry.states = (countryEntry.states || []).filter(
          (s) => !states.includes(s.state),
        );
      }
    }

    // 3. Remove Cities
    if (remove.currentOutletLocations.international.city) {
      for (const [countryName, statesObj] of Object.entries(
        remove.currentOutletLocations.international.city,
      )) {
        let countryEntry = updatedInternationalLocations.find(
          (l) => l.country === countryName,
        );
        if (!countryEntry) continue;

        for (const [stateName, stateData] of Object.entries(statesObj)) {
          let stateEntry = countryEntry.states?.find(
            (s) => s.state === stateName,
          );
          if (!stateEntry) continue;

          stateEntry.cities = (stateEntry.cities || []).filter(
            (c) => !(stateData.city || []).includes(c),
          );
        }
      }
    }
  }

  // ---------- ADD international Logic ----------
  if (add?.currentOutletLocations?.international) {
    // console.log("International Entry:", add.currentOutletLocations);

    // 1. Add Countries
    if (add.currentOutletLocations.international.country) {
      for (const loc of add.currentOutletLocations.international.country) {
        const locationObj =
          typeof loc === "string" ? { country: loc, states: [] } : loc;
        let countryEntry = updatedInternationalLocations.find(
          (l) => l.country === locationObj.country,
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
      // console.log(
      //   "States Entry:",
      //   add.currentOutletLocations.international.states,
      // );

      for (const [countryName, states] of Object.entries(
        add.currentOutletLocations.international.states,
      )) {
        let countryEntry = updatedInternationalLocations.find(
          (l) => l.country === countryName,
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
            (s) => s.state === stateName,
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
        add.currentOutletLocations.international.city,
      )) {
        let countryEntry = updatedInternationalLocations.find(
          (l) => l.country === countryName,
        );
        if (!countryEntry) {
          const newCountry = { country: countryName, states: [] };
          for (const [stateName, stateData] of Object.entries(statesObj)) {
            newCountry.states.push({
              state: stateName,
              cities: Array.from(
                new Set(stateData.city || stateData.cities || []),
              ),
            });
          }
          updatedInternationalLocations.push(newCountry);
          continue;
        }

        countryEntry.states = countryEntry.states || [];
        for (const [stateName, stateData] of Object.entries(statesObj)) {
          let stateEntry = countryEntry.states.find(
            (s) => s.state === stateName,
          );
          if (!stateEntry) {
            stateEntry = { state: stateName, cities: [] };
            countryEntry.states.push(stateEntry);
          }
          stateEntry.cities = Array.from(
            new Set([...(stateEntry.cities || []), ...(stateData.city || [])]),
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
        (loc) => !remove.expansionLocations.domestic.state.includes(loc.state),
      );
    }

    // 2. Remove Districts
    if (remove.expansionLocations.domestic.districts) {
      for (const [stateName, districts] of Object.entries(
        remove.expansionLocations.domestic.districts,
      )) {
        const stateEntry = updatedExpansionLocations.find(
          (l) => l.state === stateName,
        );
        if (stateEntry) {
          stateEntry.districts = (stateEntry.districts || []).filter(
            (d) => !districts.includes(d.district),
          );

          // cleanup empty states
          if (stateEntry.districts.length === 0) {
            updatedExpansionLocations = updatedExpansionLocations.filter(
              (l) => l.state !== stateName,
            );
          }
        }
      }
    }

    // 3. Remove Cities
    if (remove.expansionLocations.domestic.city) {
      for (const [stateName, districtsObj] of Object.entries(
        remove.expansionLocations.domestic.city,
      )) {
        const stateEntry = updatedExpansionLocations.find(
          (l) => l.state === stateName,
        );
        if (stateEntry) {
          for (const [districtName, districtData] of Object.entries(
            districtsObj,
          )) {
            const districtEntry = stateEntry.districts?.find(
              (d) => d.district === districtName,
            );
            if (districtEntry) {
              districtEntry.cities = (districtEntry.cities || []).filter(
                (c) => !(districtData.city || []).includes(c),
              );

              // cleanup empty districts
              if (districtEntry.cities.length === 0) {
                stateEntry.districts = stateEntry.districts.filter(
                  (d) => d.district !== districtName,
                );
              }
            }
          }

          // cleanup empty states
          if (!stateEntry.districts || stateEntry.districts.length === 0) {
            updatedExpansionLocations = updatedExpansionLocations.filter(
              (l) => l.state !== stateName,
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
          (l) => l.state === locationObj.state,
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
        add.expansionLocations.domestic.districts,
      )) {
        let stateEntry = updatedExpansionLocations.find(
          (l) => l.state === stateName,
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
            (d) => d.district === districtName,
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
        add.expansionLocations.domestic.city,
      )) {
        let stateEntry = updatedExpansionLocations.find(
          (l) => l.state === stateName,
        );
        if (!stateEntry) {
          const newState = { state: stateName, districts: [] };
          for (const [districtName, districtData] of Object.entries(
            districtsObj,
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
          districtsObj,
        )) {
          let districtEntry = stateEntry.districts.find(
            (d) => d.district === districtName,
          );
          if (!districtEntry) {
            districtEntry = { district: districtName, cities: [] };
            stateEntry.districts.push(districtEntry);
          }
          districtEntry.cities = Array.from(
            new Set([
              ...(districtEntry.cities || []),
              ...(districtData.city || []),
            ]),
          );
        }
      }
    }
  }

  // ---------- REMOVE International Logic ----------
  if (remove?.expansionLocations?.international) {
    // console.log("International REMOVE Entry:", remove.expansionLocations);

    // 1. Remove Countries
    if (remove.expansionLocations.international.country) {
      for (const countryName of remove.expansionLocations.international
        .country) {
        updatedInternationalExpansionLocations =
          updatedInternationalExpansionLocations.filter(
            (l) => l.country !== countryName,
          );
      }
    }

    // 2. Remove States
    if (remove.expansionLocations.international.states) {
      for (const [countryName, states] of Object.entries(
        remove.expansionLocations.international.states,
      )) {
        let countryEntry = updatedInternationalExpansionLocations.find(
          (l) => l.country === countryName,
        );
        if (!countryEntry) continue;

        countryEntry.states = (countryEntry.states || []).filter(
          (s) => !states.includes(s.state),
        );
      }
    }

    // 3. Remove Cities
    if (remove.expansionLocations.international.city) {
      for (const [countryName, statesObj] of Object.entries(
        remove.expansionLocations.international.city,
      )) {
        let countryEntry = updatedInternationalExpansionLocations.find(
          (l) => l.country === countryName,
        );
        if (!countryEntry) continue;

        for (const [stateName, stateData] of Object.entries(statesObj)) {
          let stateEntry = countryEntry.states?.find(
            (s) => s.state === stateName,
          );
          if (!stateEntry) continue;

          stateEntry.cities = (stateEntry.cities || []).filter(
            (c) => !(stateData.city || []).includes(c),
          );
        }
      }
    }
  }

  // ---------- ADD International Logic ----------
  if (add?.expansionLocations?.international) {
    // console.log("International Entry:", add.expansionLocations);

    // 1. Add Countries
    if (add.expansionLocations.international.country) {
      for (const loc of add.expansionLocations.international.country) {
        const locationObj =
          typeof loc === "string" ? { country: loc, states: [] } : loc;
        let countryEntry = updatedInternationalExpansionLocations.find(
          (l) => l.country === locationObj.country,
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
      // console.log("States Entry:", add.expansionLocations.international.states);

      for (const [countryName, states] of Object.entries(
        add.expansionLocations.international.states,
      )) {
        let countryEntry = updatedInternationalExpansionLocations.find(
          (l) => l.country === countryName,
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
            (s) => s.state === stateName,
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
        add.expansionLocations.international.city,
      )) {
        let countryEntry = updatedInternationalExpansionLocations.find(
          (l) => l.country === countryName,
        );
        if (!countryEntry) {
          const newCountry = { country: countryName, states: [] };
          for (const [stateName, stateData] of Object.entries(statesObj)) {
            newCountry.states.push({
              state: stateName,
              cities: Array.from(
                new Set(stateData.city || stateData.cities || []),
              ),
            });
          }
          updatedInternationalExpansionLocations.push(newCountry);
          continue;
        }

        countryEntry.states = countryEntry.states || [];
        for (const [stateName, stateData] of Object.entries(statesObj)) {
          let stateEntry = countryEntry.states.find(
            (s) => s.state === stateName,
          );
          if (!stateEntry) {
            stateEntry = { state: stateName, cities: [] };
            countryEntry.states.push(stateEntry);
          }
          stateEntry.cities = Array.from(
            new Set([...(stateEntry.cities || []), ...(stateData.city || [])]),
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
        "expansionLocationData.isInternationalExpansion": String(isInternationalExpansion)

      },
    },
    { new: true, runValidators: true },
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
        // console.log(`Field to delete from: ${key}`);
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
            { new: true, runValidators: true },
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
          new ApiResponse(404, {}, "No uploads found for this brand owner"),
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
          uploadedFile.mimetype,
        );

        data = await BrandUploads.findOneAndUpdate(
          { brandOwnerId: req.params.id },
          { $set: { [`uploads.${field}`]: [newFileUrl] } },
          { new: true, runValidators: true },
        );
      }
    }

    for (const field of multiFileFields) {
      const uploadedFiles = req.files?.[field];
      if (uploadedFiles && uploadedFiles.length > 0) {
        const newFileUrls = await Promise.all(
          uploadedFiles.map((file) => uploadFileToR2(file.path, file.mimetype)),
        );

        data = await BrandUploads.findOneAndUpdate(
          { brandOwnerId: req.params.id },
          { $push: { [`uploads.${field}`]: { $each: newFileUrls } } },
          { new: true, runValidators: true },
        );
      }
    }

    return res.json(
      new ApiResponse(200, data, "Brand images updated successfully"),
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          {},
          "Something went wrong while updating brand images",
        ),
      );
  }
};

export const deleteBrandListingByUUID = async (req, res) => {
  try {
    // Get the UUID from params
    const { uuid } = req.params;
    // console.log("Deletion request received for UUID:", uuid);

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

    // Check if at least one document was found and deleted
    if (
      !brandDetails &&
      !brandFranchiseDetails &&
      !brandExpansionLocationData &&
      !brandUploads
    ) {
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
        "Brand listing deleted successfully",
      ),
    );
  } catch (error) {
    console.error("Delete operation failed:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(500, null, `Internal Server Error: ${error.message}`),
      );
  }
};

// ------------------ DATABASE MIGRATION SCRIPTS ------------------
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
        { new: true },
      );
    }

    return res.status(200).json({ updatedCount: data.length, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Re-entry script to migrate data from BrandListing to new collections
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
        "Re-entry process completed",
      ),
    );
  } catch (outerError) {
    console.error("Outer error:", outerError);
    return res.status(500).json({ message: "Server error" });
  }
};
// Fetch all brand IDs
export const allId = async (req, res) => {
  const data = await BrandListing.find({});

  const arr = [];
  const id = data.map((d) => {
    arr.push(d.brandID);
  });

  return res.json(new ApiResponse(200, arr, "fetch successfully"));
};

// ------------------ NEW FEATURES ------------------
// Get brands by category with pagination and like/shortlist status
export const getBrandsByCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;
    const id = req.query.id || null; // This is only used for likeandshortlist
    const subCategory = req.query.subCategory || null;

    if (!subCategory) {
      return res.json(new ApiResponse(400, null, "subCategory is required"));
    }

    const { likedBrands, shortListedBrands } = id
      ? await likeandshortlist(id)
      : { likedBrands: [], shortListedBrands: [] };

    let mainCategory;
    let relatedCategories = [];
    let matchCondition = {};

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

    // Match only by subCategory, not by id
    matchCondition = {
      "franchiseDetails.brandCategories.sub": subCategory,
    };

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
      {
        $unwind: {
          path: "$brandInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Remove the $match on brandInfo to include all brands even if no brandInfo
      // Only filter out paused brands if brandInfo exists
      {
        $match: {
          $or: [
            { brandInfo: null },
            { brandInfo: { $exists: false } },
            {
              $and: [
                { "brandInfo.brandDetails.isBrandPause": { $ne: true } },
                { "brandInfo.brandDetails.isApproved": { $ne: false } },
              ],
            },
          ],
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
      {
        $addFields: {
          // Only check isLiked/isShortListed if id was provided
          isLiked: id
            ? {
              $in: [
                "$brandInfo._id",
                likedBrands.map((id) => new mongoose.Types.ObjectId(id)),
              ],
            }
            : false,
          isShortListed: id
            ? {
              $in: [
                "$brandInfo._id",
                shortListedBrands.map(
                  (id) => new mongoose.Types.ObjectId(id),
                ),
              ],
            }
            : false,
          // Get first uploads document if exists
          uploadsData: {
            $cond: {
              if: { $gt: [{ $size: "$uploads" }, 0] },
              then: { $arrayElemAt: ["$uploads", 0] },
              else: null,
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 0,
          brandID: { $ifNull: ["$brandInfo.brandID", null] },
          uuid: "$brandOwnerId",
          isLiked: 1,
          isShortListed: 1,
          brandname: { $ifNull: ["$brandInfo.brandDetails.brandName", null] },
          slug: { $ifNull: ["$brandInfo.brandDetails.slug", null] },
          brandCategories: {
            $ifNull: ["$franchiseDetails.brandCategories", null],
          },
          fico: {
            $let: {
              vars: {
                firstFico: { $arrayElemAt: ["$franchiseDetails.fico", 0] },
              },
              in: {
                investmentRange: {
                  $ifNull: ["$$firstFico.investmentRange", "Not specified"],
                },
                areaRequired: {
                  $ifNull: ["$$firstFico.areaRequired", "Not specified"],
                },
                franchiseModel: {
                  $ifNull: ["$$firstFico.franchiseModel", "Not specified"],
                },
              },
            },
          },
          // Handle logo - check if uploadsData exists and has brandLogo array
          logo: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$uploadsData", null] },
                  { $ne: ["$uploadsData.uploads", null] },
                  { $isArray: "$uploadsData.uploads.brandLogo" },
                  { $gt: [{ $size: "$uploadsData.uploads.brandLogo" }, 0] },
                ],
              },
              then: { $arrayElemAt: ["$uploadsData.uploads.brandLogo", 0] },
              else: null,
            },
          },
          // Handle franchiseVideos - check if uploadsData exists and has franchisePromotionVideo array
          franchiseVideos: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$uploadsData", null] },
                  { $ne: ["$uploadsData.uploads", null] },
                  { $isArray: "$uploadsData.uploads.franchisePromotionVideo" },
                  {
                    $gt: [
                      { $size: "$uploadsData.uploads.franchisePromotionVideo" },
                      0,
                    ],
                  },
                ],
              },
              then: {
                $arrayElemAt: [
                  "$uploadsData.uploads.franchisePromotionVideo",
                  0,
                ],
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
        new ApiResponse(404, null, "No brands found for this category"),
      );
    }

    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return res.json(
      new ApiResponse(
        200,
        {
          mainCategory,
          relatedCategories,
          currentCategory: subCategory,
          brands: brandsData,
          pagination: {
            total: totalCount,
            totalPages,
            currentPage: page,
            limit,
            hasNext,
            hasPrevious,
          },
        },
        "Brands fetched successfully by category",
      ),
    );
  } catch (error) {
    console.error("Error fetching brands by category:", error);
    return res.json(
      new ApiResponse(500, null, `Failed to fetch brands: ${error.message}`),
    );
  }
};

export const getBrandById = async (req, res) => {
  const { id } = req.params;
  const paymentHistory = req.query.paymentHistory || null;

  const brand = req.brandUser;

  try {
    const aggregationPipeline = [
      {
        $match: {
          uuid: id,
        },
      },
    ];
    let projectStage = {};

    if (paymentHistory === "true") {
      aggregationPipeline.push(
        {
          $lookup: {
            from: "paymentpackagehistories",
            localField: "uuid",
            foreignField: "uuid",
            as: "oldPackageHistory",
          },
        },
        {
          $project: {
            _id: 0,
            brandDetails: 1,
            oldPackageHistory: {
              $reverseArray: {
                $first: "$oldPackageHistory.paymentPackage",
              },
            },
          },
        },
      );

      projectStage = {
        _id: 0,
        activePackage: "$brandDetails.paymentPackage",
        oldPackageHistory: 1,
      };
    } else {
      aggregationPipeline.push(
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
                {
                  $size: { $arrayElemAt: ["$totalViewData.viewedByBrands", 0] },
                },
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
      );
      projectStage = {
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
      };
    }

    aggregationPipeline.push({ $project: projectStage });
    const data = await BrandDetails.aggregate(aggregationPipeline);

    const length = data[0]?.oldPackageHistory?.length || 0;

    if (length <= 0) {
      return res.json(
        new ApiResponse(200, data[0], "package history not updated yet"),
      );
    }

    return res.json(
      new ApiResponse(200, data[0], "✅ Brand fetched successfully"),
    );
  } catch (error) {
    console.error("getBrandListingByUUID error:", error);
    return res.json(new ApiResponse(500, null, "Failed to fetch brand"));
  }
};

export {
  createBrandListing,
  getAllBrands,
  // getBrandListingByUUID,
  getBrandListingSlug,
  updateBrandListingByUUID,
};
