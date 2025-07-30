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






// const getAllBrands = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (10 - 1) * limit;

//     // Get total count for pagination metadata
//     const total = await BrandListing.countDocuments({});

//     const brands = await BrandListing.find({})
//       .select("")
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const totalPages = Math.ceil(total / limit);

//     return res.status(200).json(
//       new ApiResponse(200, {
//         brands,
//         pagination: {
//           totalItems: total,
//           totalPages,
//           currentPage: page,
//           perPage: limit,
//         },
//       }, "✅ Brands fetched successfully")
//     );
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ error: "Failed to fetch brands", details: error.message });
//   }
// };




const getAllBrands = async (req, res) => {
  try {
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

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
      {
        $unwind: {
          path: "$franchiseDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$uploads",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          brandID: 1,
          uuid: 1,
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
            $ifNull: ["$uploads.uploads.franchisePromotionVideo", []]
          },
        }
      },
      { $skip: skip },
      { $limit: limit }
    ];

    // Get paginated results and total count in parallel
    const [results, totalCount] = await Promise.all([
      BrandDetails.aggregate(aggregationPipeline),
      BrandDetails.countDocuments()
    ]);

    if (!results || results.length === 0) {
      return res.json(
        new ApiResponse(404, null, "No brands found")
      );
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return res.json(
      new ApiResponse(200, {
        results,
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

export const getTopFoodFranchise = async (req,res)=>{
   try {
    const topFranchises = await BrandFranchiseDetails.aggregate([
      { $match : { "franchiseDetails.brandCategories.sub" :"Food Franchises"}},
      
      {$lookup: {
        from: "branddetails",
        localField: "brandOwnerId",
        foreignField: "uuid",
        as: "brandInfo"
      }} ,
      {$lookup: {
        from: "branduploads",
        localField: "brandOwnerId",
        foreignField: "brandOwnerId", 
        as: "uploads"
      }},
      {$project:{
        // brandInfo: 1,
        // franchiseDetails: 1,
        // uploads: 1,
        _id: 0,
        brandId : "$brandInfo.brandID",
        brandName : "$brandInfo.brandDetails.brandName",
        brandCategory : "$franchiseDetails.brandCategories",
        fico : "$franchiseDetails.fico",
        logo: {
          $cond: {
            if: { $isArray: "$uploads.uploads.brandLogo" },
            then: { $arrayElemAt: ["$uploads.uploads.brandLogo", 0] },
            else: null
          }
        },
        franchiseVideos: {
          $ifNull: ["$uploads.uploads.franchisePromotionVideo", []]
        },
      }}

    ])
    if (!topFranchises || topFranchises.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, "No top food franchises found"));
    }
    return res.status(200).json(new ApiResponse(200, topFranchises, "Top food franchises fetched successfully"));
   } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
   }
}



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
        const expansionLocations = processLocationUpdates(req.body.expansionLocationData.expansionLocations);
        if (expansionLocations) {
          expansionUpdate.expansionLocations = expansionLocations;
        }
      }
      
      if (Object.keys(expansionUpdate).length > 0) {
        setNestedFields('expansionLocationData', expansionUpdate);
      }
    }

    // Handle file uploads
    const uploadedFiles = {};
    const fileFields = [
      'brandLogo', 'exteriorOutlet', 'franchisePromotionVideo',
      'gstCertificate', 'interiorOutlet', 'pancard', 
      'businessPlan', 'awards'
    ];

    if (req.files) {
      for (const field of fileFields) {
        const files = req.files[field];
        if (files && files.length > 0) {
          const urls = await Promise.all(
            files.map((file) => uploadFileToR2(file.path, file.mimetype))
          );
          // Filter out any empty values
          uploadedFiles[field] = urls.filter(url => url);
        }
      }
    }

    // Handle uploads from request body
    if (req.body.uploads) {
      for (const [field, value] of Object.entries(req.body.uploads)) {
        if (value !== undefined && value !== null) {
          // Clean array fields by removing any empty objects or invalid values
          if (Array.isArray(value)) {
            updateData[`uploads.${field}`] = value.filter(item => 
              item && typeof item === 'string' && item.trim() !== ''
            );
          } else {
            updateData[`uploads.${field}`] = value;
          }
        }
      }
    }

    // Merge uploaded files with update data
    for (const [field, value] of Object.entries(uploadedFiles)) {
      if (value && value.length > 0) {
        updateData[`uploads.${field}`] = value;
      }
    }

    // If no data to update, return early
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update" });
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

  const generateUUID = uuid()
  const id = req.body.id
  try {
    const data = await BrandListing.findById({_id : new mongoose.Types.ObjectId(id)})

  console.log(data)

const exists = await BrandDetails.findOne({
      "brandDetails.brandName": data.brandDetails.brandName
    })

    if (exists) {
      return res.json(
        new ApiResponse(400, {}, "Brand already exists")
      );
    }



  const [newBrand, newBrandFranchiseDetails, newBrandExpansionLocationData, newBrandUploads] = await Promise.all([
      BrandDetails.create({
        brandID : data.brandID,
        uuid:generateUUID,
        brandDetails : data.brandDetails
      }),
      BrandFranchiseDetails.create({
        brandOwnerId: generateUUID,
        franchiseDetails : data.franchiseDetails
      }),
      BrandExpansionLocationData.create({
        brandOwnerId: generateUUID,
        expansionLocationData : data.expansionLocationData
      }),
      BrandUploads.create({
        brandOwnerId: generateUUID,
        uploads: data.uploads
      })
    ]);


    return res.json(
      new ApiResponse(200,{
        newBrand,newBrandExpansionLocationData,newBrandFranchiseDetails,newBrandUploads
      },"reentry successfully")
    )

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const allId = async(req,res) => {
   const data = await BrandListing.find({})

   console.log(data)

   const arr = []
   const id = data.map(d => {
    arr.push(d._id)
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