import { InvsRegister } from "../../model/Investor/invsRegister.js";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import uuid from "../../utils/uuid.js";
import FavoriteBrandsInvestor from "../../model/Investor/favoriteBrandsInvestor.js";

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


export const toggleFavoriteBrand = async (req, res) => {
  try {
    const { investorUserId, branduuid, liked } = req.body;

    const investorDoc = await InvsRegister.findById(investorUserId);
    if (!investorDoc) return res.status(404).json({ error: "Investor not found" });

    const brandDoc = await BrandListing.findById(branduuid);
    if (!brandDoc) return res.status(404).json({ error: "Brand not found" });

    let favDoc = await FavoriteBrandsInvestor.findOne({ InvestorUserId: investorUserId });
    if (!favDoc) {
      favDoc = await FavoriteBrandsInvestor.create({
        InvestorUserId: investorUserId,
        favoriteBrands: [],
      });
    }

    const exists = favDoc.favoriteBrands.some((item) => item.branduuid.equals(branduuid));

    if (liked && !exists) {
      favDoc.favoriteBrands.push({ branduuid });
    } else if (!liked && exists) {
      favDoc.favoriteBrands = favDoc.favoriteBrands.filter(
        (item) => !item.branduuid.equals(branduuid)
      );
    }

    await favDoc.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("toggleFavoriteBrand error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET: Get all favorite brands for an investor
export const getFavoriteBrands = async (req, res) => {
  try {
    const { investorUserId } = req.params;

    const doc = await FavoriteBrandsInvestor.findOne({ InvestorUserId: investorUserId })
      .populate("favoriteBrands.branduuid")
      .lean();

    if (!doc) return res.status(200).json([]);

    res.status(200).json(doc.favoriteBrands.map((b) => b.branduuid));
  } catch (error) {
    console.error("getFavoriteBrands error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// DELETE: Remove a brand from favorites
export const deleteFavoriteBrand = async (req, res) => {
  try {
    const { investorUserId, branduuid } = req.params;

    const doc = await FavoriteBrandsInvestor.findOne({ InvestorUserId: investorUserId });
    if (!doc) return res.status(404).json({ error: "Investor not found" });

    doc.favoriteBrands = doc.favoriteBrands.filter(
      (item) => !item.branduuid.equals(branduuid)
    );

    await doc.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("deleteFavoriteBrand error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
