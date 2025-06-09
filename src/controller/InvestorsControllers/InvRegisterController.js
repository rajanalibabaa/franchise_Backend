import { InvsRegister } from "../../model/Investor/invsRegister.js";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import uuid from "../../utils/uuid.js";
import { FavoriteBrands, FavoriteBrandsLikedByInvestor } from "../../model/Investor/favoriteBrandsInvestor.js";
import mongoose from "mongoose";
import { newIncomerInvestorController } from "../Admin/investorRegisterLeadController.js";

export const createInvestor = async (req, res) => {
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
     category,
     investmentRange,
     investmentAmount,
     propertyType,
     propertySize,
     preferredState,
     preferredCity
    } = req.body;

    // console.log("Incoming data:", req.body);

    
    
    const exists = await InvsRegister.findOne({
      $or: [
        { email },
        { mobileNumber }
      ]
    });

    if (exists) {
      return res.status(409).json(
        new ApiResponse(
          409,
          null,
          "Investor already exists"
        )
      );
    }

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
     category,
     specifyOccupation: occupation === 'Other' ? specifyOccupation : undefined,
     investmentRange,
     investmentAmount,
     propertyType,
     propertySize,
     preferredState,
     preferredCity,
      uuid: uuid()
    });

    await investor.save();

    newIncomerInvestorController(email,firstName,category,country,state,city,investmentRange)

    return res.status(201).json(
      new ApiResponse(201, null, "Investor created successfully")
    );
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

    const investor = await InvsRegister.findOne({ uuid: req.investorUser?.uuid }).select("-__v -_id -createdAt -updatedAt");

    console.log("investor :",investor)

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

  
export const updateInvestor = async (req, res) => {
  try {
    const { uuid } = req.params;
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
      category,
      investmentRange,
      investmentAmount,
      propertyType,
      propertySize,
      preferredState,
      preferredCity
    } = req.body;

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
      );
    }

    // Prepare update data
    const updateData = {
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
      category,
      investmentRange,
      investmentAmount,
      propertyType,
      propertySize,
      preferredState,
      preferredCity
    };

   // Handle specifyOccupation based on occupation
if (occupation === 'Other') {
  if (!specifyOccupation || specifyOccupation.trim() === '') {
    return res.status(400).json(
      new ApiResponse(400, null, "Please specify your occupation when selecting 'Other'")
    );
  }
  updateData.specifyOccupation = specifyOccupation;
} else {
  // Clear specifyOccupation if occupation is not 'Other'
  updateData.specifyOccupation = undefined;
}

    const updatedInvestor = await InvsRegister.findOneAndUpdate(
      { uuid: req.investorUser?.uuid },
      updateData,
      { new: true } // Return the updated document
    ).select("-__v -_id -createdAt -updatedAt");

    if (!updatedInvestor) {
      return res.status(404).json(
        new ApiResponse(404, null, "Investor not found")
      );
    }

   return res.status(200).json(
      new ApiResponse(
        200,
        updatedInvestor,
        "Investor updated successfully"
      )
    );
  } catch (err) {
    console.error("Update investor error:", err);
    return res.status(400).json({
      error: "Failed to update investor",
      details: err.message,
    });
  }};
  
export const deleteInvestor = async (req, res) => {
    const { uuid } = req.params;
      // console.log(uuid)

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
        // console.log("======================")
        const deletedInvestor = await InvsRegister.findOneAndDelete({uuid :req.investorUser?.uuid });
        // console.log("==========: ",deletedInvestor)
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
