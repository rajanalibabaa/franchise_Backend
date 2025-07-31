import mongoose from "mongoose";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import {
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
import { FavoriteBrandsLikedBybrand, FavoriteBrandsLikedByInvestor } from "../../model/Investor/favoriteBrandsInvestor.js";
import ShortListed from "../../model/ShortList/shortListedModel.js";


export const likeandshortlist = async(id) => {

  let likedBrands = [];
  let shortListedBrands = [];
  if (id) {
      const investor = await InvsRegister.findOne({ uuid: id });

      if (investor) {
       
        const investorFavorites = await FavoriteBrandsLikedByInvestor.findOne({
          InvestorUserId: investor._id
        });
        likedBrands = investorFavorites?.favoriteBrandByInvestor.map(b => b.brandID.toString()) || [];

       
        const investorShortList = await ShortListed.find({
          "ShortListedBy.investor.userId": investor._id
        });
        shortListedBrands = investorShortList.map(s => s.brandOwnerId.toString());

        

      } else {
        const brand = await BrandDetails.findOne({ uuid: id });

        if (brand) {
          
          const brandFavorites = await FavoriteBrandsLikedBybrand.findOne({
            brandUserId: brand._id
          });
          likedBrands = brandFavorites?.favoriteBrandBybrand.map(b => b.likedBrandID.toString()) || [];

         
          const brandShortList = await ShortListed.find({
            "ShortListedBy.brand.userId": brand._id
          });
          shortListedBrands = brandShortList.map(s => s.brandOwnerId.toString());
        }
      }
    }

    return {likedBrands,shortListedBrands}
}


const createBrandListing = async (req, res) => {
  try {
    
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
      "interiorOutlet"
    ];

    const safeJsonParse = (input, fallback = {}) => {
      try {
        return typeof input === "string" ? JSON.parse(input) : input || fallback;
      } catch (err) {
        console.warn("JSON parse error:", err.message);
        return fallback;
      }
    };

    const brandDetails = safeJsonParse(req.body?.brandDetails);
    const franchiseDetails = safeJsonParse(req.body?.franchiseDetails);
    const expansionLocationData = safeJsonParse(req.body?.expansionLocationData);


console.log("Incoming data:", brandDetails.brandName);

    // Validate required fields
    if (!brandDetails || !franchiseDetails || !expansionLocationData) {
      return res.json(
        new ApiResponse(400, {}, "Required fields (brandDetails, franchiseDetails, expansionLocationData) are missing")
      );
    }

    const exists = await BrandDetails.findOne({
      "brandDetails.brandName": brandDetails.brandName
    })

    if (exists) {
      return res.json(
        new ApiResponse(400, {}, "Brand already exists")
      );
    }

    const normalizeDistrictData = (districtObj, fallbackName) => {
      if (!districtObj.district && fallbackName) districtObj.district = fallbackName;
      if (!Array.isArray(districtObj.cities) || districtObj.cities.length === 0) {
        districtObj.cities = [districtObj.district || fallbackName].filter(Boolean);
      }
      return districtObj;
    };

    const normalizeLocations = (locations, isInternational = false) => {
      if (!Array.isArray(locations)) return [];
      return locations.map(loc => {
        const key = isInternational ? "states" : "state";
        const districtKey = isInternational ? "district" : "districts";
        if (Array.isArray(loc[districtKey])) {
          loc[districtKey] = loc[districtKey].map(d => normalizeDistrictData(d, loc[key]));
        }
        return loc;
      });
    };

    // Normalize location data
    if (expansionLocationData?.expansionLocations?.domestic?.locations) {
      expansionLocationData.expansionLocations.domestic.locations =
        normalizeLocations(expansionLocationData.expansionLocations.domestic.locations);
    }

    if (expansionLocationData?.currentOutletLocations?.domestic?.locations) {
      expansionLocationData.currentOutletLocations.domestic.locations =
        normalizeLocations(expansionLocationData.currentOutletLocations.domestic.locations);
    }

    if (expansionLocationData?.expansionLocations?.international?.country) {
      expansionLocationData.expansionLocations.international.country =
        normalizeLocations(expansionLocationData.expansionLocations.international.country, true);
    }

    if (expansionLocationData?.currentOutletLocations?.international?.country) {
      expansionLocationData.currentOutletLocations.international.country =
        normalizeLocations(expansionLocationData.currentOutletLocations.international.country, true);
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
    const uploadedFiles = {};
    for (const field of fileFields) {
      if (req.files?.[field]?.length > 0) {
        try {
          const isVideo = field.toLowerCase().includes("video");
          const urls = await Promise.all(
            req.files[field].map(async (file) => {
              const contentType = isVideo ? "video/mp4" : file.mimetype;
              return await uploadFileToR2(file.path, contentType);
            })
          );
          uploadedFiles[field] = urls.filter(url => url !== null);
        } catch (error) {
          console.error(`Error uploading ${field} files:`, error);
          uploadedFiles[field] = [];
        }
      }
    }

    // Build structured awards array
    const awardDocs = uploadedFiles.awardDoc || [];
    const awards = awardDocs.map((fileUrl, index) => ({
      awardDescription: awardDescriptions[index] || "",
      awardImage: fileUrl
    }));

    // Create all records in parallel after getting the UUID

    const [newBrand, newBrandFranchiseDetails, newBrandExpansionLocationData, newBrandUploads] = await Promise.all([
      BrandDetails.create({
        brandID,
        uuid:id,
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
      new ApiResponse(500, {}, `Failed to create brand listing: ${error.message}`)
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
        $lookup: {
          from: "brandfranchisedetails",
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "franchiseDetails"
        }
      },
      {
        $lookup: {
          from: "branduploads",
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "uploads"
        }
      },
      { $unwind: { path: "$franchiseDetails", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$uploads", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          isLiked: {
            $in: ["$_id", likedBrands.map(id => new mongoose.Types.ObjectId(id))]
          },
          isShortListed: {
            $in: ["$_id", shortListedBrands.map(id => new mongoose.Types.ObjectId(id))]
          }
        }
      },
      {
        $project: {
          _id: 0,
          brandID: "$brandID",
          uuid: 1,
          isLiked: 1,
          isShortListed: 1,
          brandname: "$brandDetails.brandName",
          brandCategories: {
            $ifNull: ["$franchiseDetails.franchiseDetails.brandCategories", null]
          },
          fico: {
            $ifNull: ["$franchiseDetails.franchiseDetails.fico", []]
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

    const [brands, totalCount] = await Promise.all([
      BrandDetails.aggregate(aggregationPipeline),
      BrandDetails.countDocuments()
    ]);

    if (!brands || brands.length === 0) {
      return res.json(new ApiResponse(404, null, "No brands found"));
    }

    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return res.json(
      new ApiResponse(200, {
        brands,
        pagination: {
          total: totalCount,
          totalPages,
          currentPage: page,
          limit,
          hasNext,
          hasPrevious
        }
      }, "Brand data fetched successfully")
    );

  } catch (error) {
    console.error("Error fetching brands:", error);
    return res.json(
      new ApiResponse(500, null, `Failed to fetch brands: ${error.message}`)
    );
  }
};


const getBrandListingByUUID = async (req, res) => {
  try {
    const { id: uuid } = req.params;
    // const brandData = req.brandUser;

    // if (uuid !== brandData?.uuid) {
    //   return res
    //     .status(403)
    //     .json(new ApiResponse(403, null, "Unauthorized request"));
    // }

    let brand = await BrandListing.findOne({ uuid }).select(
      "-_id -createdAt -updatedAt -__v"
    );

    if (!brand) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Brand not found"));
    }

    const mediaFields = [
      "pancard",
      "gstCertificate",
      "brandLogo",
      "interiorOutlet",
      "franchisePromotionVideo",
      "brandPromotionVideo",
      "exteriorOutlet",
    ];

    brand = brand.toObject();

    for (const field of mediaFields) {
      if (Array.isArray(brand[field])) {
        brand[field] = await Promise.all(
          brand[field].map(async (key) => {
            if (!key) return null;
            try {
              return await generateSignedUrl(key);
            } catch {
              return null;
            }
          })
        );
        brand[field] = brand[field].filter(Boolean);
      }
    }

    return res
      .json(new ApiResponse(200, brand, "✅ Brand fetched successfully"));
  } catch (error) {
    // console.error("getBrandListingByUUID error:", error);
    return res
      .json(new ApiResponse(500, null, "Failed to fetch brand"));
  }
};


const updateBrandListingByUUID = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    // Helper function to set nested fields
    const setNestedFields = (basePath, fields) => {
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && value !== null) {
          updateData[`${basePath}.${key}`] = value;
        }
      }
    };

    // Handle brandDetails updates
    if (req.body.brandDetails) {
      const brandDetailsFields = [
        'fullName', 'email', 'mobileNumber', 'whatsappNumber',
        'companyName', 'brandName', 'tagLine', 'ceoName',
        'ceoEmail', 'ceoMobile', 'officeEmail', 'officeMobile',
        'headOfficeAddress', 'country', 'state', 'district',
        'city', 'pincode', 'website', 'facebook',
        'instagram', 'linkedin', 'gstNumber', 'pancardNumber'
      ];
      
      const brandDetailsUpdate = {};
      for (const field of brandDetailsFields) {
        if (req.body.brandDetails[field] !== undefined) {
          brandDetailsUpdate[field] = req.body.brandDetails[field];
        }
      }
      
      if (Object.keys(brandDetailsUpdate).length > 0) {
        setNestedFields('brandDetails', brandDetailsUpdate);
      }
    }

    // Handle franchiseDetails updates
    if (req.body.franchiseDetails) {
      const franchiseDetailsUpdate = {};
      
      // Handle top-level fields
      const franchiseTopLevelFields = [
        'aidFinancing', 'brandDescription', 'companyOwnedOutlets', 
        'consultationOrAssistance', 'establishedYear', 'franchiseDevelopment',
        'franchiseOutlets', 'franchiseSinceYear', 'totalOutlets', 
        'trainingSupport', 'uniqueSellingPoints'
      ];
      
      for (const field of franchiseTopLevelFields) {
        if (req.body.franchiseDetails[field] !== undefined) {
          franchiseDetailsUpdate[field] = req.body.franchiseDetails[field];
        }
      }
      
      // Handle brandCategories
      if (req.body.franchiseDetails.brandCategories) {
        const brandCategoriesFields = ['main', 'sub', 'groupId', 'child'];
        const brandCategoriesUpdate = {};
        
        for (const field of brandCategoriesFields) {
          if (req.body.franchiseDetails.brandCategories[field] !== undefined) {
            brandCategoriesUpdate[field] = req.body.franchiseDetails.brandCategories[field];
          }
        }
        
        if (Object.keys(brandCategoriesUpdate).length > 0) {
          franchiseDetailsUpdate.brandCategories = brandCategoriesUpdate;
        }
      }
      
      // Handle fico array
      if (req.body.franchiseDetails.fico && Array.isArray(req.body.franchiseDetails.fico)) {
        franchiseDetailsUpdate.fico = req.body.franchiseDetails.fico.map(item => {
          const ficoFields = [
            'investmentRange', 'areaRequired', 'franchiseModel', 
            'franchiseType', 'franchiseFee', 'royaltyFee', 
            'stockInvestment', 'royaltyFeeUnit', 'interiorCost', 
            'otherCost', 'roi', 'payBackPeriod', 'breakEven', 
            'requireWorkingCapital', 'marginOnSales', 'agreementPeriod'
          ];
          
          const ficoItem = {};
          ficoFields.forEach(field => {
            if (item[field] !== undefined) {
              ficoItem[field] = item[field];
            }
          });
          return ficoItem;
        }).filter(item => Object.keys(item).length > 0);
      }
      
      if (Object.keys(franchiseDetailsUpdate).length > 0) {
        setNestedFields('franchiseDetails', franchiseDetailsUpdate);
      }
    }

    // Handle expansionLocationData updates
    if (req.body.expansionLocationData) {
      const expansionUpdate = {};
      
      if (req.body.expansionLocationData.isInternationalExpansion !== undefined) {
        expansionUpdate.isInternationalExpansion = req.body.expansionLocationData.isInternationalExpansion;
      }
      
      // Process location updates
      const processLocationUpdates = (locationsData) => {
        if (!locationsData) return null;
        
        const result = {};
        
        // Handle domestic locations
        if (locationsData.domestic?.locations) {
          result.domestic = { locations: [] };
          locationsData.domestic.locations.forEach(location => {
            const loc = {};
            if (location.state !== undefined) loc.state = location.state;
            
            if (location.districts) {
              loc.districts = location.districts.map(district => {
                const dist = {};
                if (district.district !== undefined) dist.district = district.district;
                if (district.cities !== undefined) dist.cities = district.cities;
                return Object.keys(dist).length > 0 ? dist : null;
              }).filter(Boolean);
            }
            
            if (Object.keys(loc).length > 0) {
              result.domestic.locations.push(loc);
            }
          });
        }
        
        // Handle international locations
        if (locationsData.international?.country) {
          result.international = { country: [] };
          locationsData.international.country.forEach(country => {
            const cntry = {};
            if (country.country !== undefined) cntry.country = country.country;
            if (country.states !== undefined) cntry.states = country.states;
            
            if (country.district) {
              cntry.district = country.district.map(district => {
                const dist = {};
                if (district.district !== undefined) dist.district = district.district;
                if (district.cities !== undefined) dist.cities = district.cities;
                return Object.keys(dist).length > 0 ? dist : null;
              }).filter(Boolean);
            }
            
            if (Object.keys(cntry).length > 0) {
              result.international.country.push(cntry);
            }
          });
        }
        
        return Object.keys(result).length > 0 ? result : null;
      };
      
      // Process current and expansion locations
      if (req.body.expansionLocationData.currentOutletLocations) {
        const currentLocations = processLocationUpdates(req.body.expansionLocationData.currentOutletLocations);
        if (currentLocations) {
          expansionUpdate.currentOutletLocations = currentLocations;
        }
      }
      
      if (req.body.expansionLocationData.expansionLocations) {
        processLocationUpdates(
          'expansionLocationData.expansionLocations',
          req.body.expansionLocationData.expansionLocations
        );
      }
    }
    // Handle file uploads
    const uploadedFiles = {};


console.log("Uploaded files:", uploadedFiles);
console.log("File fields:", fileFields);
console.log("Request files:", req.files);

    for (const field of fileFields) {
      const files = req.files?.[field];
      if (files?.length > 0) {
        const isVideo = field.toLowerCase().includes("video");
        const urls = await Promise.all(
          files.map((file) => {
            const contentType = isVideo ? "video/mp4" : file.mimetype;
            return uploadFileToR2(file.path, contentType);
          })
        );
        uploadedFiles[field] = urls;
      }
    }

    // Handle awards separately (combining awardDoc and awardText)
    if (uploadedFiles.awardDoc || req.body.awardText) {
      let awardDis = [];
      
      if (req.body.awardText) {
        try {
          awardDis = Array.isArray(req.body.awardText) 
            ? req.body.awardText 
            : JSON.parse(req.body.awardText || "[]");
        } catch (e) {
          console.warn("Invalid awardText format:", e);
          awardDis = [];
        }
      }

      const awardDocs = uploadedFiles.awardDoc || [];
      const awards = awardDocs.map((fileUrl, index) => ({
        awardDescription: awardDis[index] || "",
        awardImage: fileUrl
      }));

      if (awards.length > 0) {
        updateData["uploads.awards"] = awards;
      }
    }

    // Add other uploaded files to update data
    for (const [field, urls] of Object.entries(uploadedFiles)) {
      if (field !== "awardDoc") { // awards already handled separately
        updateData[`uploads.${field}`] = urls;
      }
    }

    // If no updates were provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid updates provided"
      });
    }

    // If no files were uploaded, return early
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid file uploads provided"
      });
    }
    const updatedBrand = await BrandListing.findOneAndUpdate(
      { uuid: id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedBrand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    return res.status(200).json(
      new ApiResponse(200, updatedBrand, "✅ Brand updated successfully")
    );
  } catch (error) {
    console.error("Error updating brand:", error);
    return res.status(500).json({ 
      error: "Failed to update brand", 
      details: error.message   
    });
  }
};


const deleteBrandListingByUUID = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BrandListing.findByIdAndDelete(id);
    if (!deleted) return res.json({ error: "Brand not found" });

    return res
      .json(new ApiResponse(200, {}, "✅ Brand deleted successfully"));
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to delete brand", details: error.message });
  }
};

export const db = async (req, res) => {
  try {
    const data = await BrandListing.find({
      "franchiseDetails.fico.investmentRange": "Rs.5 L - 10 L"
    });

    // Loop over each matching document and update
    for (const item of data) {
      await BrandListing.findByIdAndUpdate(
        item._id,
        {
          $set: {
            "franchiseDetails.fico.0.investmentRange": "Rs. 5 L - 10 L"
          }
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

        const [newBrand, newBrandFranchiseDetails, newBrandExpansionLocationData, newBrandUploads] = await Promise.all([
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
      new ApiResponse(200, {
        successCount: successEntries.length,
        skippedCount: skippedEntries.length,
        successEntries,
        skippedEntries,
      }, "Re-entry process completed")
    );

  } catch (outerError) {
    console.error("Outer error:", outerError);
    return res.status(500).json({ message: "Server error" });
  }
};


export const allId = async(req,res) => {
   const data = await BrandListing.find({})

   console.log(data)

   const arr = []
   const id = data.map(d => {
    
    arr.push(d.brandID)
   })

   return res.json(new ApiResponse(200,arr,"fetch successfully"))
}

export {
  createBrandListing,
  getAllBrands,
  getBrandListingByUUID,
  updateBrandListingByUUID,
  deleteBrandListingByUUID,
};