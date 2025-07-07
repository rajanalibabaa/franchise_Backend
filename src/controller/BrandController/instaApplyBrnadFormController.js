import {instantApply} from "../../model/Brand/brandFranchiseApply.js";
import uuid from "../../utils/uuid.js";
import { sendInstantApplyEmail } from "../../utils/Centralized Email/centralizedEmail.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { InvsRegister } from "../../model/Investor/invsRegister.js";



export const instaApplyBrandFormController = async (req, res) => {
  try {
   

    const {
      fullName,
      email,
      mobileNumber,
      state,
      district,
      city,
      investmentRange,
      planToInvest,
      readyToInvest,
      brandId,
      brandName,
      applyId
    } = req.body;

    console.log(req.body)

    const exists = await BrandListing.findOne({
      uuid : brandId
    })

    if (!exists) {
      return res.json(
        new ApiResponse(404,null,"Brand not found")
      )
    }

     // Check if brand exists
    const brand = await BrandListing.findOne({ uuid: brandId });
    if (!brand) {
      return res.status(404).json(new ApiResponse(404, null, "Brand not found"));
    }

    // Determine who is applying (Investor / Brand / other)
    let applyBy = "other";
    let applyById = "other"
    const isBrand = await BrandListing.findOne({ uuid: applyId });
    if (isBrand) {
      applyBy = "Brand";
      applyById = isBrand?.uuid
    } else {
      const isInvestor = await InvsRegister.findOne({ uuid: applyId });
      if (isInvestor) {
        applyBy = "Investor";
        applyById = isInvestor?.uuid
      }
    }


 
    const newSubmission = new instantApply({
      uuid: uuid(),
      fullName,
      email,
      mobileNumber,
      state,
      district,
      city,
      investmentRange,
      planToInvest,
      readyToInvest,
      brandId,
      brandName,
      brandEmail : exists.brandDetails.email,
      brandLogo : exists.uploads.brandLogo[0],
      apply : {
        applyBy,
        applyId :  applyById,
      }
    });

    await newSubmission.save();

    if (!newSubmission) {
      return res.json(
        new ApiResponse(500,null,"Somethink went wrong while newSubmission saving in database")
      )
    }

    res.json(
      new ApiResponse(200,newSubmission, "Application submitted successfully")
    );

    await sendInstantApplyEmail(
      fullName,
      district,
      state,
      city,
      investmentRange,
      planToInvest,
      readyToInvest,
      brandName,
      exists.brandDetails.email,
      email,
      mobileNumber
    );

    return 

  } catch (error) {
    console.error("Error in instaApplyBrandFormController:", error);
    return res.status(500).json(new ApiResponse(500, {}, "Internal server error"));
  }
};


// Get all
export const getAllInstaApplyToBrand = async (req, res) => {
  const {id} = req.params
  const BrandData = req.brandUser

  if (id !== BrandData.uuid) {
    return res.json(
      new ApiResponse(401,{},"Unauthorized requset")
    )
  }
  try {
    const instaApply = (await instantApply.find({brandId:BrandData.uuid}).select("-_id -createdAt -updatedAt -__v")).reverse();
    

    const applyList = [];

    for (let i = 0; i < instaApply.length; i++) {
      const application = instaApply[i];
      let data = await InvsRegister.findOne({ uuid: application.apply?.applyId }).select("-_id -oldData");
      if (!data) {
        data = await BrandListing.findOne({ uuid: application.apply?.applyId });
      }

      if (data) {
        applyList.push(data);
      }
    }
    return res.json(
      new ApiResponse(200,applyList,"All instant apply application fetch successfully")
    )

  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching Insta Apply", error: error.message });
  }
};

// Get by ID

export const getInstaApplyById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.investorUser || req.brandUser;

  
    if (!user || id !== user?.uuid) {
      return res.status(401).json(
        new ApiResponse(401, {}, "Unauthorized request")
      );
    }

    const myInstaApplies = await instantApply.find({ "apply.applyId": user.uuid });

    console.log("myInstaApplies :",myInstaApplies)

    if (!myInstaApplies || myInstaApplies.length === 0) {
      return res.status(404).json(
        new ApiResponse(404, null, "User hasn't applied to any brand yet")
      );
    }

    const applyList = [];

    for (let i = 0; i < myInstaApplies.length; i++) {
      const application = myInstaApplies[i];
      const brand = await BrandListing.findOne({ uuid: application.brandId });

      if (brand) {
        applyList.push(brand);
      }
    }

    return res.status(200).json(
      new ApiResponse(200, applyList, "Apply list fetched successfully")
    );

  } catch (error) {
    console.error("Error in getInstaApplyById:", error);
    return res.status(500).json(
      new ApiResponse(500, null, "Error fetching Insta Apply")
    );
  }
};

// Update
export const updateInstaApply = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      location,
      // franchiseModel,
      // franchiseType,
      investmentRange,
      planToInvest,
      readyToInvest,
      brandId,
      brandName,
      brandEmail,
      investorEmail,
      mobileNumber,
    } = req.body;

    const updatedInstaApply = await instaApplyBrandForm.findByIdAndUpdate(
      id,
      {
        fullName,
        location,
        // franchiseModel,
        // franchiseType,
        investmentRange,
        planToInvest,
        readyToInvest,
        brandId,
        brandName,
        brandEmail,
        investorEmail,
        mobileNumber,
      },
      { new: true }
    );

    if (!updatedInstaApply) {
      return res.status(404).json({ message: "Insta Apply not found" });
    }
    res.status(200).json({
      message: "Insta Apply updated successfully",
      data: updatedInstaApply,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating Insta Apply", error: error.message });
  }
};

// Delete
export const deleteInstaApply = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInstaApply = await instaApplyBrandForm.findByIdAndDelete(id);
    if (!deletedInstaApply) {
      return res.status(404).json({ message: "Insta Apply not found" });
    }
    res.status(200).json({
      message: "Insta Apply deleted successfully",
      data: deletedInstaApply,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting Insta Apply", error: error.message });
  }
};

