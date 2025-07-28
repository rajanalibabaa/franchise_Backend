import mongoose from "mongoose";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import {
  generateSignedUrl,
  uploadFileToR2,
  uploadFileToS3,
} from "../../utils/Uploads/s3Uploader.js";
// import { InvsRegister } from "../../model/Investor/invsRegister.js";
import generateCustomId from "../../helpers/brandIdGenerater.js";

const createBrandListing = async (req, res) => {
  try {
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
// console.log("Available awardDoc files:", req.files?.awardDoc?.length || 0);
    // Parse incoming JSON strings safely
    // const brandDetails = req.body.brandDetails
    // const franchiseDetails = req.body.franchiseDetails 
    // const expansionLocationData = req.body.expansionLocationData 
    const brandDetails = JSON.parse(req.body.brandDetails || "{}");
    const franchiseDetails = JSON.parse(req.body.franchiseDetails || "{}");
    const expansionLocationData = JSON.parse(req.body.expansionLocationData || "{}");

    // ✅ Parse awardText safely as array
    let awardDis = [];



    if (Array.isArray(brandDetails.awardText)) {
      awardDis = brandDetails.awardText;
    } else if (typeof brandDetails.awardText === "string") {
      try {
        awardDis = JSON.parse(brandDetails.awardText);
      } catch (e) {
        console.warn("Invalid awardText JSON:", e);
        awardDis = [];
      }
    }

    // Generate brand ID using groupId if provided
    const group = franchiseDetails?.brandCategories?.groupId || null;
    const customId = await generateCustomId(group);


   

    // Upload files to R2
    const uploadedFiles = {};
    for (const field of fileFields) {
      const files = req.files?.[field];
      // console.log("files :",field)
      if (!field) {
        //  console.log("field not found :",field)
         return
      }
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

    // ✅ Build structured awards array
    const awardDocs = uploadedFiles.awardDoc || [];
    const awards = awardDocs.map((fileUrl, index) => ({
      awardDescription: awardDis[index] || "",
      awardImage: fileUrl
    }));

    // Create the brand listing document
    const newBrand = await BrandListing.create({
      brandID: customId,
      brandDetails,
      franchiseDetails,
      expansionLocationData,
      uploads: {
        brandLogo: uploadedFiles.brandLogo || [],
        gstCertificate: uploadedFiles.gstCertificate || [],
        pancard: uploadedFiles.pancard || [],
        exteriorOutlet: uploadedFiles.exteriorOutlet || [],
        interiorOutlet: uploadedFiles.interiorOutlet || [],
        franchisePromotionVideo: uploadedFiles.franchisePromotionVideo || [],
        brandPromotionVideo: uploadedFiles.brandPromotionVideo || [],
        businessPlan: uploadedFiles.businessPlan || [],
        awards: awards
      }
    });

    if (!newBrand) {
      return res.status(400).json({
        success: false,
        message: "Failed to create brand listing in the database"
      });
    }

    return res.json(
      new ApiResponse(
        200,
      newBrand,
       "Brand listing created successfully",
      
      )
    );

  } catch (error) {
    console.error("❌ Brand Creation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create brand listing",
      error: error.message
    });
  }
};

const getAllBrands = async (req, res) => {
  try {
    const brands = await BrandListing.find().select(
      " -brandDetails?.brandPromotionVideo"
    );
console.log( "fetch brands ",brands);

    // brands.forEach((brand) => {
    //   console.log("brand videos :", {
    //     franchisePromotionVideo: brand.brandDetails?.franchisePromotionVideo,
    //     brandPromotionVideo: brand.brandDetails?.brandPromotionVideo,
    //   });
    // });
    return res
      .status(200)
      .json(new ApiResponse(200, brands, "✅ Brands fetched successfully"));
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch brands", details: error.message });
  }
};

// const getBrandListingByUUID = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const brandData = req.brandUser;

//     if (id !== brandData?.uuid) {
//       return res.status(403).json(
//         new ApiResponse(403, null, "Unauthorized request")
//       );
//     }

//     const brand = await BrandListing.findOne({ uuid: brandData.uuid })
//       .select("-_id -createdAt -updatedAt -__v");

//     if (!brand) {
//       return res.status(404).json(
//         new ApiResponse(404, null, "Brand not found")
//       );
//     }

//     return res.status(200).json(
//       new ApiResponse(200, brand, "✅ Brand fetched successfully")
//     );

//   } catch (error) {
//     console.error("getBrandListingByUUID error:", error);
//     return res.status(500).json(
//       new ApiResponse(500, null, "Failed to fetch brand")
//     );
//   }
// };

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

// const updateBrandListingBssyUUID = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("Updating brand by UUID:", id);


// const updateBrandListingBssyUUID = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("Updating brand by UUID:", id);

//     // Initialize update object
//     const updateData = {};
    
//     // Helper function to set nested fields in MongoDB update syntax
//     const setNestedFields = (basePath, fields) => {
//       for (const [key, value] of Object.entries(fields)) {
//         if (value !== undefined && value !== null) {
//           updateData[`${basePath}.${key}`] = value;
//         }
//       }
//     };

//     // Helper function to set array elements with nested updates
//     const setArrayElement = (basePath, index, fields) => {
//       for (const [key, value] of Object.entries(fields)) {
//         if (value !== undefined && value !== null) {
//           updateData[`${basePath}.${index}.${key}`] = value;
//         }
//       }
//     };

//     // Handle brandDetails updates - only update fields that are provided
//     if (req.body.brandDetails) {
//       const brandDetailsFields = [
//         'fullName', 'email', 'mobileNumber', 'whatsappNumber',
//         'companyName', 'brandName', 'tagLine', 'ceoName',
//         'ceoEmail', 'ceoMobile', 'officeEmail', 'officeMobile',
//         'headOfficeAddress', 'country', 'state', 'district',
//         'city', 'pincode', 'website', 'facebook',
//         'instagram', 'linkedin', 'gstNumber', 'pancardNumber'
//       ];
      
//       const brandDetailsUpdate = {};
//       for (const field of brandDetailsFields) {
//         if (req.body.brandDetails[field] !== undefined) {
//           brandDetailsUpdate[field] = req.body.brandDetails[field];
//         }
//       }
      
//       if (Object.keys(brandDetailsUpdate).length > 0) {
//         setNestedFields('brandDetails', brandDetailsUpdate);
//       }
//     }

//     // Handle franchiseDetails updates
//     if (req.body.franchiseDetails) {
//       // Top-level franchiseDetails fields
//       const franchiseTopLevelFields = [
//         'aidFinancing', 'brandDescription', 'companyOwnedOutlets', 
//         'consultationOrAssistance', 'establishedYear', 'franchiseDevelopment',
//         'franchiseOutlets', 'franchiseSinceYear', 'totalOutlets', 
//         'trainingSupport', 'uniqueSellingPoints'
//       ];
      
//       const franchiseDetailsUpdate = {};
//       for (const field of franchiseTopLevelFields) {
//         if (req.body.franchiseDetails[field] !== undefined) {
//           franchiseDetailsUpdate[field] = req.body.franchiseDetails[field];
//         }
//       }
      
//       // Handle brandCategories updates
//       if (req.body.franchiseDetails.brandCategories) {
//         const brandCategoriesFields = ['main', 'sub', 'groupId', 'child'];
//         const brandCategoriesUpdate = {};
        
//         for (const field of brandCategoriesFields) {
//           if (req.body.franchiseDetails.brandCategories[field] !== undefined) {
//             brandCategoriesUpdate[field] = req.body.franchiseDetails.brandCategories[field];
//           }
//         }
        
//         if (Object.keys(brandCategoriesUpdate).length > 0) {
//           franchiseDetailsUpdate.brandCategories = brandCategoriesUpdate;
//         }
//       }
      
//       // Add top-level updates if any
//       if (Object.keys(franchiseDetailsUpdate).length > 0) {
//         setNestedFields('franchiseDetails', franchiseDetailsUpdate);
//       }

//       // Handle fico array updates - partial updates for specific items and fields
//       if (req.body.franchiseDetails.fico) {
//         if (Array.isArray(req.body.franchiseDetails.fico)) {
//           // Handle updates to specific fico items
//           for (let i = 0; i < req.body.franchiseDetails.fico.length; i++) {
//             const ficoItem = req.body.franchiseDetails.fico[i];
//             if (ficoItem && typeof ficoItem === 'object') {
//               const ficoFields = [
//                 'investmentRange', 'areaRequired', 'franchiseModel', 
//                 'franchiseType', 'franchiseFee', 'royaltyFee', 
//                 'stockInvestment', 'royaltyFeeUnit', 'interiorCost', 
//                 'otherCost', 'roi', 'payBackPeriod', 'breakEven', 
//                 'requireWorkingCapital', 'marginOnSales', 'agreementPeriod'
//               ];
//               const ficoUpdate = {};
//               for (const field of ficoFields) {
//                 if (ficoItem[field] !== undefined) {
//                   ficoUpdate[field] = ficoItem[field];
//                 }
//               }
              
//               if (Object.keys(ficoUpdate).length > 0) {
//                 setArrayElement('franchiseDetails.fico', i, ficoUpdate);
//               }
//             }
//           }
//         }
//       }
//     }

//     // Handle expansionLocationData updates
// if (req.body.expansionLocationData) {
//   // Top-level field
//   if (req.body.expansionLocationData.isInternationalExpansion !== undefined) {
//     updateData['expansionLocationData.isInternationalExpansion'] = 
//       req.body.expansionLocationData.isInternationalExpansion;
//   }

//   // Helper function to process location updates
//   const processLocationUpdates = (basePath, locationsData) => {
//     if (!locationsData) return;

//     // Handle domestic locations updates
//     if (locationsData.domestic) {
//       // Update entire domestic object if provided as a replacement
//       if (locationsData.domestic.replace === true) {
//         updateData[`${basePath}.domestic`] = {
//           locations: locationsData.domestic.locations || []
//         };
//       } 
//       // Handle partial updates to domestic locations
//       else if (locationsData.domestic.locations) {
//         // Handle array replacement
//         if (Array.isArray(locationsData.domestic.locations)) {
//           updateData[`${basePath}.domestic.locations`] = locationsData.domestic.locations;
//         } 
//         // Handle individual location updates by index
//         else if (typeof locationsData.domestic.locations === 'object') {
//           for (const [index, locationUpdate] of Object.entries(locationsData.domestic.locations)) {
//             const numericIndex = parseInt(index);
//             if (!isNaN(numericIndex)) {
//               // Update entire location object if replace flag is set
//               if (locationUpdate.replace === true) {
//                 updateData[`${basePath}.domestic.locations.${numericIndex}`] = {
//                   state: locationUpdate.state || '',
//                   districts: locationUpdate.districts || []
//                 };
//               }
//               // Handle partial updates to location
//               else {
//                 // Update state if provided
//                 if (locationUpdate.state !== undefined) {
//                   updateData[`${basePath}.domestic.locations.${numericIndex}.state`] = locationUpdate.state;
//                 }

//                 // Handle districts updates
//                 if (locationUpdate.districts) {
//                   // Replace entire districts array
//                   if (Array.isArray(locationUpdate.districts)) {
//                     updateData[`${basePath}.domestic.locations.${numericIndex}.districts`] = locationUpdate.districts;
//                   }
//                   // Handle individual district updates
//                   else if (typeof locationUpdate.districts === 'object') {
//                     for (const [districtIndex, districtUpdate] of Object.entries(locationUpdate.districts)) {
//                       const numericDistrictIndex = parseInt(districtIndex);
//                       if (!isNaN(numericDistrictIndex)) {
//                         // Replace entire district object
//                         if (districtUpdate.replace === true) {
//                           updateData[`${basePath}.domestic.locations.${numericIndex}.districts.${numericDistrictIndex}`] = {
//                             district: districtUpdate.district || '',
//                             cities: districtUpdate.cities || []
//                           };
//                         }
//                         // Handle partial district updates
//                         else {
//                           if (districtUpdate.district !== undefined) {
//                             updateData[`${basePath}.domestic.locations.${numericIndex}.districts.${numericDistrictIndex}.district`] = 
//                               districtUpdate.district;
//                           }
//                           if (districtUpdate.cities !== undefined) {
//                             updateData[`${basePath}.domestic.locations.${numericIndex}.districts.${numericDistrictIndex}.cities`] = 
//                               districtUpdate.cities;
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }

//     // Handle international locations updates
//     if (locationsData.international) {
//       // Update entire international object if replace flag is set
//       if (locationsData.international.replace === true) {
//         updateData[`${basePath}.international`] = {
//           country: locationsData.international.country || []
//         };
//       }
//       // Handle partial updates to international locations
//       else if (locationsData.international.country) {
//         // Handle array replacement
//         if (Array.isArray(locationsData.international.country)) {
//           updateData[`${basePath}.international.country`] = locationsData.international.country;
//         }
//         // Handle individual country updates by index
//         else if (typeof locationsData.international.country === 'object') {
//           for (const [index, countryUpdate] of Object.entries(locationsData.international.country)) {
//             const numericIndex = parseInt(index);
//             if (!isNaN(numericIndex)) {
//               // Replace entire country object
//               if (countryUpdate.replace === true) {
//                 updateData[`${basePath}.international.country.${numericIndex}`] = {
//                   country: countryUpdate.country || '',
//                   states: countryUpdate.states || [],
//                   district: countryUpdate.district || []
//                 };
//               }
//               // Handle partial country updates
//               else {
//                 if (countryUpdate.country !== undefined) {
//                   updateData[`${basePath}.international.country.${numericIndex}.country`] = countryUpdate.country;
//                 }
//                 if (countryUpdate.states !== undefined) {
//                   updateData[`${basePath}.international.country.${numericIndex}.states`] = countryUpdate.states;
//                 }

//                 // Handle district updates for international locations
//                 if (countryUpdate.district) {
//                   // Replace entire district array
//                   if (Array.isArray(countryUpdate.district)) {
//                     updateData[`${basePath}.international.country.${numericIndex}.district`] = countryUpdate.district;
//                   }
//                   // Handle individual district updates
//                   else if (typeof countryUpdate.district === 'object') {
//                     for (const [districtIndex, districtUpdate] of Object.entries(countryUpdate.district)) {
//                       const numericDistrictIndex = parseInt(districtIndex);
//                       if (!isNaN(numericDistrictIndex)) {
//                         // Replace entire district object
//                         if (districtUpdate.replace === true) {
//                           updateData[`${basePath}.international.country.${numericIndex}.district.${numericDistrictIndex}`] = {
//                             district: districtUpdate.district || '',
//                             cities: districtUpdate.cities || []
//                           };
//                         }
//                         // Handle partial district updates
//                         else {
//                           if (districtUpdate.district !== undefined) {
//                             updateData[`${basePath}.international.country.${numericIndex}.district.${numericDistrictIndex}.district`] = 
//                               districtUpdate.district;
//                           }
//                           if (districtUpdate.cities !== undefined) {
//                             updateData[`${basePath}.international.country.${numericIndex}.district.${numericDistrictIndex}.cities`] = 
//                               districtUpdate.cities;
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   };

//   // Process currentOutletLocations updates
//   if (req.body.expansionLocationData.currentOutletLocations) {
//     processLocationUpdates(
//       'expansionLocationData.currentOutletLocations',
//       req.body.expansionLocationData.currentOutletLocations
//     );
//   }

//   // Process expansionLocations updates
//   if (req.body.expansionLocationData.expansionLocations) {
//     processLocationUpdates(
//       'expansionLocationData.expansionLocations',
//       req.body.expansionLocationData.expansionLocations
//     );
//   }
// }
//     // Handle file uploads
//     const uploadedFiles = {};
//     const singleFileFields = [
//       'brandLogo',
//       'exteriorOutlet',
//       'franchisePromotionVideo',
//       'gstCertificate',
//       'interiorOutlet',
//       'pancard',
//       'businessPlan',
//       'awards'
//     ];

//     if (req.files) {
//       for (const field of singleFileFields) {
//         const files = req.files[field];
//         if (files && files.length > 0) {
//           const urls = await Promise.all(
//             files.map((file) => uploadFileToS3(file.path, file.mimetype))
//           );
//           uploadedFiles[field] = urls.length === 1 ? urls[0] : urls;
//         }
//       }
//     }

//     // Handle uploads from request body (for URL updates)
//     if (req.body.uploads) {
//       for (const [field, value] of Object.entries(req.body.uploads)) {
//         if (value !== undefined && value !== null) {
//           updateData[`uploads.${field}`] = value;
//         }
//       }
//     }

//     // Merge uploaded files with the update data
//     for (const [field, value] of Object.entries(uploadedFiles)) {
//       updateData[`uploads.${field}`] = value;
//     }

//     // If no data to update, return early
//     if (Object.keys(updateData).length === 0) {
//       return res.status(400).json({ error: "No valid fields provided for update" });
//     }

//     const updatedBrand = await BrandListing.findOneAndUpdate(
//       { uuid: id },
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     if (!updatedBrand) {
//       return res.status(404).json({ error: "Brand not found" });
//     }

//     return res.status(200).json(
//       new ApiResponse(200, updatedBrand, "✅ Brand updated successfully")
//     );
//   } catch (error) {
//     console.error("Error updating brand:", error);
//     return res.status(500).json({ 
//       error: "Failed to update brand", 
//       details: error.message 
//     });
//   }
// };

const updateBrandListingByUUID = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};


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

    // Helper function to safely parse JSON fields
    const parseField = (field) => {
      try {
        return field ? JSON.parse(field) : {};
      } catch (e) {
        console.warn(`Failed to parse field: ${e.message}`);
        return {};
      }
    };

    // Helper function to set nested fields
    const setNestedFields = (basePath, fields) => {
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && value !== null) {
          updateData[`${basePath}.${key}`] = value;
        }
      }
    };
    const setArrayElement = (basePath, index, fields) => {
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && value !== null) {
          updateData[`${basePath}.${index}.${key}`] = value;
        }
      }
    };

    // Helper function to update array elements
    const updateArrayElement = (basePath, index, fields) => {
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && value !== null) {
          updateData[`${basePath}.${index}.${key}`] = value;
        }
      }
    };

     // Handle brandDetails updates - only update fields that are provided
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
    

    if (req.body.franchiseDetails) {
      const franchiseTopLevelFields = [
        'aidFinancing', 'brandDescription', 'companyOwnedOutlets', 
        'consultationOrAssistance', 'establishedYear', 'franchiseDevelopment',
        'franchiseOutlets', 'franchiseSinceYear', 'totalOutlets', 
        'trainingSupport', 'uniqueSellingPoints'
      ];
      
      const franchiseDetailsUpdate = {};
      for (const field of franchiseTopLevelFields) {
        if (req.body.franchiseDetails[field] !== undefined) {
          franchiseDetailsUpdate[field] = req.body.franchiseDetails[field];
        }
      }
      
      // Handle brandCategories updates
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
      
      // Add top-level updates if any
      if (Object.keys(franchiseDetailsUpdate).length > 0) {
        setNestedFields('franchiseDetails', franchiseDetailsUpdate);
      }


    // 1. Handle franchiseDetails.fico updates
    if (req.body.franchiseDetails?.fico) {
      if (Array.isArray(req.body.franchiseDetails.fico)) {
        // Process each fico item in the array
        req.body.franchiseDetails.fico.forEach((ficoItem, index) => {
          if (ficoItem && typeof ficoItem === 'object') {
            const ficoFields = [
              'investmentRange', 'areaRequired', 'franchiseModel', 
              'franchiseType', 'franchiseFee', 'royaltyFee', 
              'stockInvestment', 'royaltyFeeUnit', 'interiorCost', 
              'otherCost', 'roi', 'payBackPeriod', 'breakEven', 
              'requireWorkingCapital', 'marginOnSales', 'agreementPeriod'
            ];
            
            const ficoUpdate = {};
            ficoFields.forEach(field => {
              if (ficoItem[field] !== undefined) {
                ficoUpdate[field] = ficoItem[field];
              }
            });
            
            if (Object.keys(ficoUpdate).length > 0) {
              updateArrayElement('franchiseDetails.fico', index, ficoUpdate);
            }
          }
        });
      }
    }
  }
    // 2. Handle expansionLocationData updates
    if (req.body.expansionLocationData) {
      // Handle isInternationalExpansion update
      if (req.body.expansionLocationData.isInternationalExpansion !== undefined) {
        updateData['expansionLocationData.isInternationalExpansion'] = 
          req.body.expansionLocationData.isInternationalExpansion;
      }

      // Process location updates for both currentOutletLocations and expansionLocations
      const processLocationUpdates = (basePath, locationsData) => {
        if (!locationsData) return;

        // Handle domestic locations
        if (locationsData.domestic?.locations) {
          if (Array.isArray(locationsData.domestic.locations)) {
            locationsData.domestic.locations.forEach((location, locIndex) => {
              if (location.state !== undefined) {
                updateData[`${basePath}.domestic.locations.${locIndex}.state`] = location.state;
              }

              // Handle districts updates
              if (location.districts) {
                if (Array.isArray(location.districts)) {
                  location.districts.forEach((district, distIndex) => {
                    if (district.district !== undefined) {
                      updateData[`${basePath}.domestic.locations.${locIndex}.districts.${distIndex}.district`] = 
                        district.district;
                    }
                    if (district.cities !== undefined) {
                      updateData[`${basePath}.domestic.locations.${locIndex}.districts.${distIndex}.cities`] = 
                        district.cities;
                    }
                  });
                }
              }
            });
          }
        }

        // Handle international locations
        if (locationsData.international?.country) {
          if (Array.isArray(locationsData.international.country)) {
            locationsData.international.country.forEach((country, countryIndex) => {
              if (country.country !== undefined) {
                updateData[`${basePath}.international.country.${countryIndex}.country`] = 
                  country.country;
              }
              if (country.states !== undefined) {
                updateData[`${basePath}.international.country.${countryIndex}.states`] = 
                  country.states;
              }

              // Handle district updates for international
              if (country.district) {
                if (Array.isArray(country.district)) {
                  country.district.forEach((district, distIndex) => {
                    if (district.district !== undefined) {
                      updateData[`${basePath}.international.country.${countryIndex}.district.${distIndex}.district`] = 
                        district.district;
                    }
                    if (district.cities !== undefined) {
                      updateData[`${basePath}.international.country.${countryIndex}.district.${distIndex}.cities`] = 
                        district.cities;
                    }
                  });
                }
              }
            });
          }
        }
      };

      // Process currentOutletLocations
      if (req.body.expansionLocationData.currentOutletLocations) {
        processLocationUpdates(
          'expansionLocationData.currentOutletLocations',
          req.body.expansionLocationData.currentOutletLocations
        );
      }

      // Process expansionLocations
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


export {
  createBrandListing,
  getAllBrands,
  getBrandListingByUUID,
  updateBrandListingByUUID,
  deleteBrandListingByUUID,
};