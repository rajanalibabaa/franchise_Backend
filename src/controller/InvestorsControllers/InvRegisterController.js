import { InvsRegister } from "../../model/Investor/invsRegister.js";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import uuid from "../../utils/uuid.js";
import { FavoriteBrands, FavoriteBrandsLikedByInvestor } from "../../model/Investor/favoriteBrandsInvestor.js";
import mongoose from "mongoose";
import { newIncomerInvestorController } from "../Admin/investorRegisterLeadController.js";
import { json } from "express";
import { deleteFileFromR2, uploadFileToR2 } from "../../utils/Uploads/s3Uploader.js";


export const createInvestor = async (req, res) => {
  // console.log("Incoming request to create investor:", req.body);

  try {
    const {
      firstName,
      email,
      mobileNumber,
      whatsappNumber,
      address,
      pincode,
      country,
      state,
      city,
      occupation,
      specifyOccupation,
      preferences
    } = req.body;

    // 🛡 Validate & format preferences
    const prefData = preferences?.map((pref, index) => {
      if (!pref.locationType || !["domestic", "international"].includes(pref.locationType)) {
        throw new Error(`Invalid or missing 'locationType' in preference ${index + 1}`);
      }

      if (!pref.category || !Array.isArray(pref.category) || pref.category.length === 0) {
        throw new Error(`At least one category is required in preference ${index + 1}`);
      }

      const category = pref.category.map(cat => ({
        main: cat.main || "",
        sub: cat.sub || "",
        child: cat.child || ""
      }));

      const propertyPreferred = (pref.propertyPreferred || []).map(prop => ({
        propertyType: prop.propertyType || "",
        propertySize: prop.propertySize || "",
        propertyCountry: prop.propertyCountry || "",
        propertyState: prop.propertyState || "",
        propertyCity: prop.propertyCity || ""
      }));

      return { 
        category,
        investmentRange: pref.investmentRange || "",
        investmentAmount: pref.investmentAmount || "",
        locationType: pref.locationType,
        preferredCountry: pref.preferredCountry || pref.preferredCuntry || "",
        preferredState: pref.preferredState || "",
        preferredDistrict: pref.preferredDistrict || pref.district || "",
        preferredCity: pref.preferredCity || "",
        propertyPreferred
      };
    }) || [];

    // 🔍 Check for existing investor
    const existingInvestor = await InvsRegister.findOne({ email });

    if (existingInvestor) {
      return res.status(409).json(new ApiResponse(409, null, "Investor already exists"));
    }

    // 🆔 Generate unique investor ID
    const lastEntry = await InvsRegister.findOne({}).sort({ updatedAt: -1 });
    const lastId = lastEntry?.inveterID?.split("-")[2] || "000";
    const nextId = String(parseInt(lastId, 10) + 1).padStart(3, "0");
    const inveterID = `MrF-INV-${nextId}`;

    // 🏗 Create investor record
    const investor = new InvsRegister({
      firstName,
      email,
      mobileNumber,
      whatsappNumber,
      address,
      pincode,
      country,
      state,
      city,
      occupation,
      specifyOccupation: occupation === "Other" ? specifyOccupation : undefined,
      preferences: prefData,
      uuid: uuid(),
      inveterID
    });

    await investor.save();

    // 📤 Send response
    res.status(201).json(new ApiResponse(201, investor, "Investor created successfully"));

    // 🔔 Optional: trigger additional action (like email, notification)
    if (Array.isArray(preferences) && preferences.length > 0) {
      preferences.forEach(pref => {
        const category = pref.category?.map(data => ({
          main: data.main,
          sub: data.sub,
          child: data.child
        })) || [];

        newIncomerInvestorController(
          email,
          firstName,
          category,
          pref.locationType || "",
          pref.preferredCountry || pref.preferredCuntry || "",
          pref.preferredState || "",
          pref.preferredDistrict || "",
          pref.preferredCity || "",
          pref.investmentAmount || "",
          
        );
      });
    }

    return

  } catch (err) {
    console.error("Create Investor Error:", err);
    return res.status(400).json({
      error: "Failed to create investor",
      details: err.message
    });
  }
};


export const getAllInvestors = async (req, res) => {
    try {
      const investors = await InvsRegister.find({});
      res.status(200).json(investors);
    } catch (err) {
      res.status(500).json({ error: err.message });  
    }
  };
  

export const getInvestorByUUID = async (req, res) => {
  try {

    // console.log(req.investorUser.uuid)
    const { uuid } = req.params;


  

    // console.log(uuid)

    if (req.investorUser?.uuid !== uuid) {
      return res.json(
        new ApiResponse(
          403,
          null,
          "Unauthorized access to this resource"
        )
      )
    }

    const investor = await InvsRegister.findOne({ uuid: req.investorUser?.uuid }).select("-__v -_id -createdAt -updatedAt -oldData");


    if (!investor) {
      return res.status(404).json(
        new ApiResponse(404, null, "Investor not found")
      );
    }

    return res.status(200).json(
      new ApiResponse(200, investor, "Investor retrieved successfully")
    );
  } catch (err) {
    console.error("Error fetching investor:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
};

  
// export const updateInvestor = async (req, res) => {
  
//    const { uuid } = req.params;
//     const {
//       firstName,
//       email,
//       mobileNumber,
//       whatsappNumber,
//       address,
//       pincode,
//       country,
//       state,
//       city,
//       occupation,
//       specifyOccupation,
      
//     } = req.body;

//     console.log(req.body)
// };

// Backend: investorController.js


// export const updateInvestor = async (req, res) => {
//     try {
//         const { uuid } = req.params;
//         const {
//             firstName,
//             email,
//             mobileNumber,
//             whatsappNumber,
//             address,
//             pincode,
//             country,
//             state,
//             city,
//             occupation,
//             specifyOccupation,
//             removeProfileImage,
//             preferences: rawPreferences
//         } = req.body;

//         console.log(req.body);

//         if (req?.investorUser?.uuid !== uuid) {
//             return res.status(403).json(
//                 new ApiResponse(403, null, "Unauthorized access to this resource")
//             );
//         }

//         const oldData = await InvsRegister.findOne({ uuid: req.investorUser?.uuid });
//         if (!oldData) {
//             return res.status(404).json(
//                 new ApiResponse(404, null, "Investor not found")
//             );
//         }

//         let processedPreferences = [];
//         let preferencesChanged = false;

//         if (rawPreferences !== undefined) {
//             let parsedPreferences;
//             try {
//                 parsedPreferences = typeof rawPreferences === 'string' ?
//                     JSON.parse(rawPreferences) :
//                     rawPreferences;
//             } catch (e) {
//                 return res.status(400).json(
//                     new ApiResponse(400, null, "Invalid preferences format")
//                 );
//             }

//             if (!Array.isArray(parsedPreferences)) {
//                 return res.status(400).json(
//                     new ApiResponse(400, null, "Preferences must be an array")
//                 );
//             }

//             processedPreferences = parsedPreferences.map((pref, index) => {
//                 if (!pref.investmentRange || !pref.investmentAmount || !pref.propertyType) {
//                     throw new Error(`Preference ${index + 1} is missing required fields`);
//                 }

//                 if (pref.propertyType === 'Own Property' && !pref.propertySize) {
//                     throw new Error(`Property size is required for Own Property in preference ${index + 1}`);
//                 }

//                 if (!pref.preferredState || !pref.preferredDistrict || !pref.preferredCity) {
//                     throw new Error(`Location fields are required in preference ${index + 1}`);
//                 }

//                 if (!Array.isArray(pref.category) || pref.category.length === 0) {
//                     throw new Error(`At least one category is required in preference ${index + 1}`);
//                 }

//                 if (!pref.locationType || !['domestic', 'international'].includes(pref.locationType)) {
//                     throw new Error(`Invalid or missing locationType in preference ${index + 1}`);
//                 }

//                 const processedCategories = pref.category.map(cat => {
//                     if (!cat.main) {
//                         throw new Error(`Main category is required in preference ${index + 1}`);
//                     }
//                     return {
//                         main: String(cat.main || ''),
//                         sub: String(cat.sub || ''),
//                         child: String(cat.child || '')
//                     };
//                 });

//                 return {
//                     investmentRange: String(pref.investmentRange),
//                     investmentAmount: String(pref.investmentAmount),
//                     propertyType: String(pref.propertyType),
//                     propertySize: pref.propertyType === 'Own Property' ?
//                         String(pref.propertySize || '') : '',
//                     preferredState: String(pref.preferredState),
//                     preferredDistrict: String(pref.preferredDistrict),
//                     preferredCity: String(pref.preferredCity),
//                     locationType: String(pref.locationType),
//                     category: processedCategories,
//                     _id: pref._id || new mongoose.Types.ObjectId()
//                 };
//             });

//             preferencesChanged = JSON.stringify(processedPreferences) !==
//                 JSON.stringify(oldData.preferences);
//         }

//         let profileImage;
//         let imageChanged = false;

//         if (removeProfileImage === "true") {
//             if (oldData.profileImage) {
//                 await deleteFileFromR2(oldData.profileImage);
//                 imageChanged = true;
//             }
//             profileImage = "";
//         }

//         if (req?.file?.path) {
//             if (oldData?.profileImage) {
//                 await deleteFileFromR2(oldData.profileImage);
//             }

//             profileImage = await uploadFileToR2(req.file.path, "investor-profile-images");
//             if (!profileImage) {
//                 return res.status(500).json(
//                     new ApiResponse(500, null, "Failed to upload profile image")
//                 );
//             }
//             imageChanged = true;
//         }

//         const updateData = {};
//         const oldInvestorData = {};

//         const checkAndSetField = (field, value) => {
//             if (value !== undefined && value !== oldData[field]) {
//                 updateData[field] = value;
//                 oldInvestorData[field] = oldData[field];
//                 return true;
//             }
//             return false;
//         };

//         checkAndSetField('firstName', firstName);
//         checkAndSetField('email', email);
//         checkAndSetField('mobileNumber', mobileNumber);
//         checkAndSetField('whatsappNumber', whatsappNumber);
//         checkAndSetField('address', address);
//         checkAndSetField('pincode', pincode);
//         checkAndSetField('country', country);
//         checkAndSetField('state', state);
//         checkAndSetField('city', city);
//         checkAndSetField('occupation', occupation);

//         if (occupation === "Other") {
//             if (!specifyOccupation || specifyOccupation.trim() === "") {
//                 return res.status(400).json(
//                     new ApiResponse(400, null, "Please specify your occupation when selecting 'Other'")
//                 );
//             }
//             checkAndSetField('specifyOccupation', specifyOccupation);
//         } else if (specifyOccupation !== undefined) {
//             updateData.specifyOccupation = undefined;
//             if (oldData.specifyOccupation) {
//                 oldInvestorData.specifyOccupation = oldData.specifyOccupation;
//             }
//         }

//         if (preferencesChanged) {
//     updateData.preferences = processedPreferences;

//     // Sanitize old preferences to avoid schema validation errors
//     const sanitizedOldPreferences = (oldData.preferences || []).map((pref) => ({
//         investmentRange: pref.investmentRange || '',
//         investmentAmount: pref.investmentAmount || '',
//         propertyType: pref.propertyType || '',
//         propertySize: pref.propertySize || '',
//         preferredState: pref.preferredState || '',
//         preferredDistrict: pref.preferredDistrict || '',
//         preferredCity: pref.preferredCity || '',
//         locationType: pref.locationType || 'domestic', // fallback default
//         category: Array.isArray(pref.category) ? pref.category.map(cat => ({
//             main: cat.main || '',
//             sub: cat.sub || '',
//             child: cat.child || ''
//         })) : [],
//         _id: pref._id || new mongoose.Types.ObjectId()
//     }));

//     oldInvestorData.preferences = sanitizedOldPreferences;
// }


//         if (imageChanged) {23`1q4567890-=-986`
//             updateData.profileImage = profileImage;
//             oldInvestorData.profileImage = oldData.profileImage;
//         }

//         const hasChanges = Object.keys(updateData).length > 0;

//         if (!hasChanges) {
//             return res.status(200).json(
//                 new ApiResponse(200, null, "No changes detected")
//             );
//         }

//         const updateOperation = {
//             $set: updateData
//         };

//         if (Object.keys(oldInvestorData).length > 0) {
//             updateOperation.$push = {
//                 oldData: {
//                     ...oldInvestorData,
//                     updatedAt: new Date()
//                 }
//             };
//         }

//         const updatedInvestor = await InvsRegister.findOneAndUpdate(
//             { uuid: req.investorUser?.uuid },
//             updateOperation,
//             { new: true, runValidators: true }
//         ).select("-__v -_id -createdAt -updatedAt -oldData -password");

//         if (!updatedInvestor) {
//             return res.status(404).json(
//                 new ApiResponse(404, null, "Investor not found")
//             );
//         }

//         return res.json(
//             new ApiResponse(200, updatedInvestor, "Investor updated successfully")
//         );

//     } catch (err) {
//         console.error("Update investor error:", err);

//         if (err.message.includes('Preference') ||
//             err.message.includes('category') ||
//             err.message.includes('required')) {
//             return res.status(400).json(
//                 new ApiResponse(400, null, err.message)
//             );
//         }

//         return res.status(500).json(
//             new ApiResponse(500, null, "Failed to update investor", err.message)
//         );
//     }
// };


// export const updateInvestor = async (req, res) => {
//   try {
//     const { uuid } = req.params;
//     const {
//       firstName,
//       email,
//       mobileNumber,
//       whatsappNumber,
//       address,
//       pincode,
//       country,
//       state,
//       city,
//       occupation,
//       specifyOccupation,
//       removeProfileImage 
//     } = req.body;
    
//     const preferences = typeof req.body.preferences === 'string' 
//       ? JSON.parse(req.body.preferences) 
//       : req.body.preferences || [];

//     // Authorization check
//     if (req?.investorUser?.uuid !== uuid) {
//       return res.status(403).json(
//         new ApiResponse(403, null, "Unauthorized access to this resource")
//       );
//     }

//     // Get existing investor data
//     const oldData = await InvsRegister.findOne({ uuid: req.investorUser?.uuid });
//     if (!oldData) {
//       return res.status(404).json(
//         new ApiResponse(404, null, "Investor not found")
//       );
//     }

//     // Handle profile image updates
//     let profileImage;
//     if (removeProfileImage === "true") {
//       if (oldData.profileImage) {
//         await deleteFileFromR2(oldData.profileImage);
//       }
//       profileImage = ""; 
//     } 
    
//     if (req?.file?.path) {
//       // Delete old image if it exists and we're uploading a new one
//       if (oldData?.profileImage && removeProfileImage !== "true") {
//         await deleteFileFromR2(oldData.profileImage);
//       }
      
//       profileImage = await uploadFileToR2(req.file.path, "investor-profile-images");
//       if (!profileImage) {
//         return res.status(500).json(
//           new ApiResponse(500, null, "Failed to upload profile image to R2")
//         );
//       }
//     }

//     // Prepare new preferences
//     const newPreferences = preferences.map((pref) => ({
//       category: Array.isArray(pref.category) ? pref.category : [],
//       investmentRange: pref.investmentRange || "",
//       investmentAmount: pref.investmentAmount || "",
//       preferredCity: pref.preferredCity || "",
//       preferredDistrict: pref.preferredDistrict || "",
//       preferredState: pref.preferredState || "",
//       propertySize: pref.propertySize || "",
//       propertyType: pref.propertyType || ""
//     }));

//     // Prepare update data
//     const updateData = {
//       firstName,
//       email,
//       mobileNumber,
//       whatsappNumber,
//       address,
//       pincode,
//       country,
//       state,
//       city,
//       occupation,
//       preferences: newPreferences,
//     };

//     // Handle profile image in update
//     if (profileImage !== undefined) {
//       updateData.profileImage = profileImage;
//     }

//     // Handle occupation specification
//     if (occupation === "Other") {
//       if (!specifyOccupation || specifyOccupation.trim() === "") {
//         return res.status(400).json(
//           new ApiResponse(400, null, "Please specify your occupation when selecting 'Other'")
//         );
//       }
//       updateData.specifyOccupation = specifyOccupation;
//     } else {
//       updateData.specifyOccupation = undefined;
//     }

//     // Create comparison object (excluding profileImage and timestamps)
//     const oldInvestorData = {
//       firstName: oldData.firstName,
//       email: oldData.email,
//       mobileNumber: oldData.mobileNumber,
//       whatsappNumber: oldData.whatsappNumber,
//       address: oldData.address,
//       pincode: oldData.pincode,
//       country: oldData.country,
//       state: oldData.state,
//       city: oldData.city,
//       occupation: oldData.occupation,
//       specifyOccupation: oldData.specifyOccupation,
//       preferences: oldData.preferences
//     };

//     // Create comparable update data (excluding profileImage)
//     const comparableUpdateData = {
//       firstName,
//       email,
//       mobileNumber,
//       whatsappNumber,
//       address,
//       pincode,
//       country,
//       state,
//       city,
//       occupation,
//       specifyOccupation: occupation === "Other" ? specifyOccupation : undefined,
//       preferences: newPreferences
//     };

//     // Check if all data is the same (excluding profile image)
//     const isDataSame = JSON.stringify(oldInvestorData) === JSON.stringify(comparableUpdateData);

//     // If data is same and no image change, return already up to date
//     if (isDataSame && 
//         (profileImage === undefined || 
//          (profileImage === "" && !oldData.profileImage) || 
//          (profileImage === oldData.profileImage))) {
//       return res.status(200).json(
//         new ApiResponse(200, null, "Already up to date")
//       );
//     }

//     // Update investor data
//     const updatedInvestor = await InvsRegister.findOneAndUpdate(
//       { uuid: req.investorUser?.uuid },
//       { 
//         $set: updateData,
//         $push: { oldData: oldInvestorData } 
//       },
//       { new: true }
//     ).select("-__v -_id -createdAt -updatedAt -oldData");

//     if (!updatedInvestor) {
//       return res.status(404).json(
//         new ApiResponse(404, null, "Investor not found")
//       );
//     }

//     return res.json(
//       new ApiResponse(200, updatedInvestor, "Investor updated successfully")
//     );

//   } catch (err) {
//     console.error("Update investor error:", err);
//     return res.status(500).json(
//       new ApiResponse(500, null, "Failed to update investor", err.message)
//     );
//   }
// };


export const updateInvestor = async (req, res) => {
  // console.log(req.body)
}
export const deleteInvestorProfileImage = async (req, res) => {
  try {
    const { uuid } = req.params;

    // Validate UUID
    if (!uuid) {
      return res.status(400).json(
        new ApiResponse(
          400,
          null,
          "UUID parameter is required"
        )
      );
    }

    // Authorization check
    if (uuid !== req.investorUser?.uuid) {
      return res.status(403).json(
        new ApiResponse(
          403,
          null,
          "Unauthorized access to this resource"
        )
      );
    }

    // Find investor data
    const investor = await InvsRegister.findOne({ uuid });
    if (!investor) {
      return res.status(404).json(
        new ApiResponse(
          404,
          null,
          "Investor not found"
        )
      );
    }

    // Check if profile image exists
    if (!investor.profileImage) {
      return res.status(400).json(
        new ApiResponse(
          400,
          null,
          "No profile image exists to delete"
        )
      );
    }

    // Store old profile image URL before deletion
    const oldProfileImage = investor.profileImage;

    // Delete from R2 storage
    await deleteFileFromR2(oldProfileImage);

    // Update database - both remove profileImage and add to oldData in a single operation
    const updatedInvestor = await InvsRegister.findOneAndUpdate(
      { uuid },
      { 
        $set: { profileImage: "" },
        $push: { 
          oldData: {
            profileImage: oldProfileImage,
            updatedAt: new Date()
          }
        }
      },
      { new: true }
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        { profileImage: updatedInvestor.profileImage },
        "Profile image deleted successfully"
      )
    );

  } catch (error) {
    console.error("Error deleting profile image:", error);
    return res.status(500).json(
      new ApiResponse(
        500,
        null,
        "Failed to delete profile image",
        error.message
      )
    );
  }
};

export const deleteInvestor = async (req, res) => {
    const { uuid } = req.params;

      if (!uuid) {
        return res.status(400).json({ error: "UUID parameter is required" });
      }
  
      if (req.investorUser?.uuid !== uuid) {
        return res.json(
          new ApiResponse(
            403,
            null,
            "Unauthorized access to this resource"
          )
        )
      }
      try {
        const deletedInvestor = await InvsRegister.findOneAndDelete({uuid :req.investorUser?.uuid });
        if (!deletedInvestor) {
            return res.status(404).json({ error: "Investor not found" });
        }
    
        res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Investor deleted successfully",
            )
        );
    } catch (error) {
        res.status(500).json({ error: "Failed to delete Investor ", details: error.message });
    }
  }; 


// export const toggleFavoriteBrand = async (req, res) => {
//   try {
//     const { branduuid } = req.body;
//     const investor = req.investorUser;

//     if (!branduuid) {
//       return res.status(400).json(new ApiResponse(400, {}, "Brand UUID is required"));
//     }

//     if (!investor || !investor._id) {
//       return res.status(401).json(new ApiResponse(401, {}, "Please login first to add favorite brand"));
//     }

//     const brandData = await BrandListing.findOne({ uuid: branduuid });
//     if (!brandData) {
//       return res.status(404).json(new ApiResponse(404, {}, "Brand not found"));
//     }

//     // Check if already favorited by investor
//     const alreadyFavorited = await FavoriteBrandsLikedByInvestor.findOne({
//       InvestorUserId: investor._id,
//       "favoriteBrands.brandID": brandData._id,
//     });

//     if (alreadyFavorited) {
//       return res.status(400).json(new ApiResponse(400, {}, "Brand already added to favorites"));
//     }

//     // Update investor's favorite list
//     const updatedInvestorFavorite = await FavoriteBrandsLikedByInvestor.findOneAndUpdate(
//       { InvestorUserId: investor._id },
//       {
//         $push: {
//           favoriteBrands: {
//             brandID: brandData._id,
//             addedAt: new Date(),
//           },
//         },
//       },
//       { new: true, upsert: true }
//     );

//     // Update brand's liked-by list
//     const updatedBrand = await FavoriteBrands.findOneAndUpdate(
//       { brandUserId: brandData._id },
//       {
//         $push: {
//           favoriteBrandByInvestors: {
//             investorID: investor._id,
//             addedAt: new Date(),
//           },
//         },
//       },
//       { new: true, upsert: true }
//     );

//     return res.status(200).json(
//       new ApiResponse(200, { updatedInvestorFavorite, updatedBrand }, "Favorite brand added successfully")
//     );
//   } catch (error) {
//     console.error("toggleFavoriteBrand error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


// // GET: Get all favorite brands for an investor
// export const getFavoriteBrandsLikedByInvestorID = async (req, res) => {
//   try {
//     const investorUserId = req.params?.uuid;
//     const investor = req.investorUser;

//     if (!investorUserId || investorUserId !== investor?.uuid) {
//       return res.status(403).json(new ApiResponse(403, {}, "Unauthorized access"));
//     }

//     const favoriteData = await FavoriteBrandsLikedByInvestor.findOne({
//       InvestorUserId: investor._id
//     });

//     if (!favoriteData || favoriteData.favoriteBrands.length === 0) {
//       return res.status(404).json(new ApiResponse(404, {}, "No favorite brands found"));
//     }

//     const brandIDs = favoriteData.favoriteBrands.map(item => item.brandID);

//     const favoriteBrands = await BrandListing.find({ _id: { $in: brandIDs } }).select(
//       '-_id -__v -updatedAt -createdAt ' +
//       '-personalDetails.email -personalDetails.mobileNumber -personalDetails.headOfficeAddress ' +
//       '-personalDetails.expansionLocation.pancardNumber -personalDetails.expansionLocation.gstNumber ' +
//       '-brandDetails.pancard -brandDetails.gstCertificate -personalDetails.pancardNumber -personalDetails.gstNumber'
//     );

//     return res.status(200).json(new ApiResponse(200, favoriteBrands, "Favorite brands retrieved successfully"));
//   } catch (error) {
//     console.error("getFavoriteBrands error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


// // // DELETE: Remove a brand from favorites
// export const deleteFavoriteBrand = async (req, res) => {
//   try {
//     const investorUserId = req.params.uuid;
//     const { brandID } = req.body;
//     const investor = req.investorUser;

//     if (!investorUserId || !brandID || investorUserId !== investor?.uuid) {
//       return res.status(403).json(new ApiResponse(403, {}, "Unauthorized access or missing data"));
//     }

//     const brandData = await BrandListing.findOne({ uuid: brandID });
//     if (!brandData) {
//       return res.status(404).json(new ApiResponse(404, {}, "Brand not found"));
//     }

//     // Remove from investor's favorites
//     const removedFavorite = await FavoriteBrandsLikedByInvestor.findOneAndUpdate(
//       { InvestorUserId: investor._id },
//       { $pull: { favoriteBrands: { brandID: brandData._id } } },
//       { new: true }
//     );

//     if (!removedFavorite) {
//       return res.status(404).json(new ApiResponse(404, {}, "Brand not in investor's favorites"));
//     }

//     // Remove investor from brand's list
//     const removedFromBrand = await FavoriteBrands.findOneAndUpdate(
//       { brandUserId: brandData._id },
//       { $pull: { favoriteBrandByInvestors: { investorID: investor._id } } },
//       { new: true }
//     );

//     return res.status(200).json(new ApiResponse(200, removedFavorite, "Favorite brand removed successfully"));
//   } catch (error) {
//     console.error("deleteFavoriteBrand error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


// export const getAllLikedAndUnlikedBrand = async (req, res) => {
//   const investorUUID = req.params.uuid;

  
//   if (investorUUID !== req.investorUser.uuid) {
//     return res.json(new ApiResponse(401, {}, "Unauthorized access"));
//   }

  
//   const existsInvestor = await InvsRegister.findOne({ uuid: req.investorUser.uuid });
//   if (!existsInvestor) {
//     return res.json(new ApiResponse(401, {}, "Investor not found"));
//   }

  
//   const investorLikedBrands = await FavoriteBrandsLikedByInvestor.findOne({
//     InvestorUserId: existsInvestor._id
//   });

  
//   const likedBrandIds = investorLikedBrands
//     ? investorLikedBrands.favoriteBrands.map(item => item.brandID.toString())
//     : [];

 
//   const allBrands = await BrandListing.find({});
//   if (!allBrands || allBrands.length === 0) {
//     return res.json(new ApiResponse(401, {}, "Brands not registered yet"));
//   }

  
//   const result = allBrands.map(brand => {
//     const { _id,updatedAt,createdAt,__v, ...rest } = brand.toObject();
    
//     return {
//       ...rest,
//       isLiked: likedBrandIds.includes(_id.toString())
//     };
//   });

//   console.log(result.length,typeof(result))

//   return res.json(new ApiResponse(200, result, "All brands with liked status"));
// };
