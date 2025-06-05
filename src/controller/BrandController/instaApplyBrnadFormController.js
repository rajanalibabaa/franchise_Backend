import {instantApply} from "../../model/Brand/brandFranchiseApply.js";
import uuid from "../../utils/uuid.js";
import { sendInstantApplyEmail } from "../../utils/Centralized Email/centralizedEmail.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";

// Create
// export const instaApplyBrnadFormController = async (req, res) => {
//   try {
//     const {id} = req.params

//     const user = req?.investorUser || req?.brandUser
    
//     const {
//       fullName,
//       location,
//       franchiseModel,
//       franchiseType,
//       investmentRange,
//       planToInvest,
//       readyToInvest,
//       brandId,
//       brandName,
//       brandEmail,
//       // investorEmail,
//       mobileNumber,
//     } = req.body;


//     if (!!req?.investorUser) {
//           console.log(id)
//     // console.log(req.body)
//     // console.log(user)
//     const newSubmission = new instaApplyBrandForm({
//       uuid: uuid(),
//       fullName,
//       location,
//       franchiseModel,
//       franchiseType,
//       investmentRange,
//       planToInvest,
//       readyToInvest,
//       brandId,
//       brandName,
//       brandEmail,
      
      
//       apply : {
//         applyBy : "Investor",
//         investor_ID : user.uuid,
//         investorEmail : investorEmail || user.email,
//         mobileNumber,
//       }
//     });

//     }
//     if (!!req?.brandUser) {
//     //       console.log(id)
//     // console.log(req.body)
//     console.log(user)
//     }

//     await newSubmission.save();

//     // const newSubmission = new instaApplyBrandForm({
//     //   uuid: uuid(),
//     //   fullName,
//     //   location,
//     //   franchiseModel,
//     //   franchiseType,
//     //   investmentRange,
//     //   planToInvest,
//     //   readyToInvest,
//     //   brandId,
//     //   brandName,
//     //   brandEmail,
//     //   investorEmail,
//     //   mobileNumber,
//     // });

//     // await newSubmission.save();

//     // // Send email after successful save
//     // await sendInstantApplyEmail(
//     //   fullName,
//     //   location,
//     //   franchiseModel,
//     //   franchiseType,
//     //   investmentRange,
//     //   planToInvest,
//     //   readyToInvest,
//     //   brandName,
//     //   brandEmail,
//     //   investorEmail,
//     //   mobileNumber
//     // );

//     // res
//     //   .status(201)
//     //   .json({ message: "Form submitted successfully", data: newSubmission });
//   } catch (error) {
//     console.error("Create InstaApply Error:", error);
//     res.status(500).json({ error: "Server error", details: error.message });
//   }
// };


export const instaApplyBrandFormController = async (req, res) => {
  try {
    const {id} = req.params
    const user = req.investorUser || req.brandUser;
    if (id !== user.uuid) {
      return res.status(403).json(new ApiResponse(403, {}, "Unauthorized request"));
    }

    const {
      fullName,
      location,
      franchiseModel,
      franchiseType,
      investmentRange,
      planToInvest,
      readyToInvest,
      brandId,
      brandName,
      brandEmail,
      mobileNumber,
      investorEmail,
      brandLogo
    } = req.body;

    // console.log(req.body)
    // console.log(id)

    if (!fullName || !brandId || !mobileNumber) {
      return res.status(400).json(new ApiResponse(400, {}, "Missing required fields"));
    }

    let applyData = {};

    if (req.investorUser) {
      applyData = {
        applyBy: "Investor",
        investor_ID: user.uuid,
        investorEmail: investorEmail || user.email,
        mobileNumber
      };
    } else if (req.brandUser) {
      applyData = {
        applyBy: "Brand",
        brand_ID: user.uuid,
        brandEmail: user.email,
        mobileNumber
      };
    } else {
      return res.status(403).json(new ApiResponse(403, {}, "Unauthorized user type"));
    }

    // console.log("applyData :",applyData)

    const newSubmission = new instantApply({
      uuid: uuid(),
      fullName,
      location,
      franchiseModel,
      franchiseType,
      investmentRange,
      planToInvest,
      readyToInvest,
      brandId,
      brandName,
      brandEmail,
      brandLogo,
      apply: applyData
    });

    await newSubmission.save();

    

    // await sendInstantApplyEmail(
    //   fullName,
    //   location,
    //   franchiseModel,
    //   franchiseType,
    //   investmentRange,
    //   planToInvest,
    //   readyToInvest,
    //   brandName,
    //   brandEmail,
    //   investorEmail,
    //   mobileNumber
    // );

    return res.status(201).json(new ApiResponse(201, newSubmission, "Application submitted successfully"));

  } catch (error) {
    console.error("Error in instaApplyBrandFormController:", error);
    return res.status(500).json(new ApiResponse(500, {}, "Internal server error"));
  }
};


// Get all
export const getAllInstaApply = async (req, res) => {
  const {id} = req.params
  const BrandData = req.brandUser

  if (id !== BrandData.uuid) {
    return res.json(
      new ApiResponse(401,{},"Unauthorized requset")
    )
  }
  try {
    const instaApply = await instantApply.find({brandId:BrandData.uuid}).select("-_id -createdAt -updatedAt -__v");
    return res.json(
      new ApiResponse(200,instaApply,"All instant apply application fetch successfully")
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
    const investor = req.investorUser 
    const Brand = req.brandUser

    if (id !== investor?.uuid && id !== Brand?.uuid) {
      return res.json(
      new ApiResponse(401,{},"Unauthorized requset")
    )
    }

    if (investor && investor.uuid) {
            const data = await instantApply.find({"apply.investor_ID":investor.uuid}).select("-_id  -updatedAt -__v").sort({ createdAt: -1 });;
      if (!data) {
        return res.json(
          new ApiResponse(309,{},"no brand apply yet")
        )
      }

      return res.json(
        new ApiResponse(200,data,"All instant apply fetch successfully")
      )
    }
    if (Brand && Brand.uuid) {

      const data = await instantApply.find({"apply.brand_ID":Brand.uuid}).select("-_id -createdAt -updatedAt -__v");
      if (!data) {
        return res.json(
          new ApiResponse(309,{},"no brand apply yet")
        )
      }

      return res.json(
        new ApiResponse(200,data,"All instant apply fetch successfully")
      )
    }

    // const instaApply = await instantApply.findById(id);
    // if (!instaApply) {
    //   return res.status(404).json({ message: "Insta Apply not found" });
    // }
    // res
    //   .status(200)
    //   .json({ message: "Insta Apply fetched successfully", data: instaApply });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching Insta Apply", error: error.message });
  }
};

// Update
export const updateInstaApply = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      location,
      franchiseModel,
      franchiseType,
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
        franchiseModel,
        franchiseType,
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

