import { instantApply } from "../../model/Brand/brandFranchiseApply.js";
import uuid from "../../utils/uuid.js";
import { sendInstantApplyEmail } from "../../utils/Centralized Email/centralizedEmail.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { InvsRegister } from "../../model/Investor/invsRegister.js";
import { instantApplyPerfectAndPartial } from "../../utils/All Leads/instantApplyPerfectAndPartial.js";
import InstantApplyLead from "../../model/NewIncomeInvestor/instantApplyPerfectAndPartial.js";
import mongoose, { Aggregate } from "mongoose";
import { instantApplyLocationMatch } from "../../utils/All Leads/instantApplyLocationMatch.js";
import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import InstantApplyInvestor from "../../model/NewIncomeInvestor/InstantApplyLocationSchema.js"


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
      applyId,
    } = req.body;

    console.log("req.body :", req.body);

    // Use aggregation to fetch brand data from all three collections
    const brandAggregate = await BrandDetails.aggregate([
      {
        $match: { uuid: brandId },
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
          from: "brandexpansionlocationdata",
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "expansionLocationData",
        },
      },
      {
        $lookup: {
          from: "branduploads", // This is the missing lookup
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
      {
        $unwind: {
          path: "$expansionLocationData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$uploads",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $limit: 1,
      },
    ]);

    console.log("brandAggregate :", brandAggregate);

    if (!brandAggregate || brandAggregate.length === 0) {
      return res.json(new ApiResponse(404, null, "Brand not found"));
    }

    const exists = brandAggregate[0];

    // Determine who is applying (Investor / Brand / other)
    let applyBy = "other";
    let applyById = "other";

    const isBrand = await BrandDetails.findOne({ uuid: applyId });
    if (isBrand) {
      applyBy = "Brand";
      applyById = isBrand?.uuid;
    } else {
      const isInvestor = await InvsRegister.findOne({ uuid: applyId });
      if (isInvestor) {
        applyBy = "Investor";
        applyById = isInvestor?.uuid;
      }
    }

    const { main, sub, child } =
      exists.franchiseDetails?.franchiseDetails?.brandCategories || {};
    console.log("main, sub, child :", main, sub, child);

    const newSubmission = new instantApply({
      uuid: uuid(),
      fullName,
      email,
      mobileNumber,
      Categories:
        exists.franchiseDetails?.franchiseDetails?.brandCategories || {},
      state,
      district,
      city,
      investmentRange,
      planToInvest,
      readyToInvest,
      brandId,
      brandName,
      brandEmail: exists.brandDetails?.email,
      brandLogo: exists.uploads?.uploads?.brandLogo?.[0],
      apply: {
        applyBy,
        applyId: applyById,
      },
    });

    await newSubmission.save();
    console.log("newSubmission :", newSubmission);

    if (!newSubmission) {
      return res.json(
        new ApiResponse(
          500,
          null,
          "Something went wrong while newSubmission saving in database"
        )
      );
    }

    res.json(
      new ApiResponse(200, newSubmission, "Application submitted successfully")
    );

    



    await instantApplyLocationMatch(
      fullName,
      email,
      mobileNumber,
      brandName,
      brandId,
      exists.brandDetails?.email,
      main,
      sub,
      child,
      state,
      district,
      city,
      investmentRange,
      planToInvest,
      readyToInvest,
      applyBy,
      applyById,
      exists.uploads?.uploads?.brandLogo
    );
  } catch (error) {
    console.error("Error in instaApplyBrandFormController:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Internal server error"));
  }
};

// Get all



export const getAllInstaApplyToBrand = async (req, res) => {
  const { id } = req.params;
  const BrandData = req.brandUser;

  if (!id || id !== BrandData?.uuid) {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Unauthorized request"));
  }

  try {
    // Fetch instant applications with proper error handling
    const instaApply = await InstantApplyLead.find({
      "initialBrand.brandId": BrandData.uuid,
    })
      .select("-_id -__v")
      .sort({ createdAt: -1 })
      .lean();
    console.log("instaApply:", instaApply);

    // Process applications in parallel for better performance
    const applyList = await Promise.all(
      instaApply.map(async (application) => {
        try {
          let data = await InvsRegister.findOne({
            uuid: application.apply?.applyId,
          })
            .select("-_id -oldData")
            .lean();

          if (!data) {
            data = await BrandListing.findOne({
              uuid: application.apply?.applyId,
            }).lean();
          }

          return data ? { ...application, userData: data } : application;
        } catch (error) {
          console.error(
            `Error processing application ${application._id}:`,
            error
          );
          return application;
        }
      })
    );

    return res.json(
      new ApiResponse(
        200,
        applyList,
        "All instant apply applications fetched successfully"
      )
    );
  } catch (error) {
    console.error("Error in getAllInstaApplyToBrand:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          `Error fetching Insta Apply: ${error.message}`
        )
      );
  }
};

// Get Instant Apply Location Lead Controller by ID

export const getInstantApplyLocationLeadControllerById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await BrandDetails.findOne({uuid:id})
    
    // Use aggregation to find and reshape the data
    // const instantApplie = await InstantApplyInvestor.aggregate([
    //   // Match documents that have the brandId in their brandsSent array
    //   {
    //     $match: {
    //       'brandsSent.brandId': id
    //     }
    //   },
    //   // Unwind the brandsSent array to filter by brandId
    //   {
    //     $unwind: '$brandsSent'
    //   },
    //   // Match only the specific brandId entries
    //   {
    //     $match: {
    //       'brandsSent.brandId': id
    //     }
    //   },
    //   // Group back to reconstruct the original document structure
    //   {
    //     $group: {
    //       _id: '$_id',
    //       location: { $first: '$location' },
    //       apply: { $first: '$apply' },
    //       investorEmail: { $first: '$investorEmail' },
    //       investorName: { $first: '$investorName' },
    //       investorPhone: { $first: '$investorPhone' },
    //       category: { $first: '$category' },
    //       investmentRange: { $first: '$investmentRange' },
    //       planToInvest: { $first: '$planToInvest' },
    //       readyToInvest: { $first: '$readyToInvest' },
    //       brandsSent: { $push: '$brandsSent' },
    //       createdAt: { $first: '$createdAt' },
    //       updatedAt: { $first: '$updatedAt' },
    //       __v: { $first: '$__v' }
    //     }
    //   },
    //   // Project to include only the required fields
    //   {
    //     $project: {
    //       'location.state': 1,
    //       'location.city': 1,
    //       'location.district': 1,
    //       investorEmail: 1,
    //       investorName: 1,
    //       investorPhone: 1,
    //       category: {
    //         main: { $arrayElemAt: ['$category.main', 0] },
    //         sub: { $arrayElemAt: ['$category.sub', 0] },
    //         child: { $arrayElemAt: ['$category.child', 0] }
    //       },
    //       investmentRange: 1,
    //       planToInvest: 1,
    //       readyToInvest: 1,
    //       brandsSent: 1
    //     }
    //   }
    // ]);

    // const instantApplie = await InstantApplyInvestor.find({
    //   // "brandsSent.brandId": user._id

    // });
    const instantApplie = await InstantApplyInvestor.aggregate([
      {
        $match:{"brandsSent.brandId": user._id}
      },
      {
        $project:{
          _id : 0,
          investorName:1,
          investorEmail:1,
          investorPhone:1,
          'category.main':{$arrayElemAt:['$category.main',0]},
          'category.sub':{$arrayElemAt:['$category.sub',0]},
          'category.child':{$arrayElemAt:['$category.child',0]},
          'location.state': 1,
          'location.district': 1,
          'location.city': 1,
          'investmentRange':1,
          'planToInvest':1,
          'readyToInvest':1,
          apply:1,
          'createdAt':1,
          'updatedAt':1

        }
      }
      
    ])


    if (!instantApplie || instantApplie.length === 0) {
      return res.status(404).json(
        new ApiResponse(
          404,
          [],
          "No instant apply records found for this brand"
        ) 
      );
    }

    return res.json(
      new ApiResponse(
        200,
        instantApplie,
        "Instant apply records fetched successfully"
      )
    );

  } catch (error) {
    console.error("Error in getInstantApplyLocationLeadControllerById:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Internal server error"));
  }
};
//Get By Id

export const getInstaApplyById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.investorUser || req.brandUser;

    if (!user || id !== user?.uuid) {
      return res
        .status(401)
        .json(new ApiResponse(401, {}, "Unauthorized request"));
    }

    const myInstaApplies = await instantApply.find({
      "apply.applyId": user.uuid,
    });

    if (!myInstaApplies || myInstaApplies.length === 0) {
      return res.json(
        new ApiResponse(404, {}, "User hasn't applied to any brand yet")
      );
    }

    // Fetch brand info for each application in parallel
    const applyList = await Promise.all(
      myInstaApplies.map(async (application) => {
        const brand = await BrandListing.findOne({ uuid: application.brandId }).lean();
        return {
          application,
          brand: brand || null,
        };
      })
    );

    // Reverse for latest first
    const reverse = applyList.reverse();
    return res.json(
      new ApiResponse(200, reverse, "Apply list fetched successfully")
    );
  } catch (error) {
    console.error("Error in getInstaApplyById:", error);
    return res.json(new ApiResponse(500, null, "Error fetching Insta Apply"));
  }
};

// Update
export const updateInstaApply = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      location,
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

export const getAllLeads = async (req, res) => {
  const { id } = req.params;
  const BrandData = req.brandUser;

  if (!id || id !== BrandData?.uuid) {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Unauthorized request"));
  }

  const leads = await InstantApplyLead.find({
    "brandMatches.brandId": new mongoose.Types.ObjectId(BrandData._id),
  })
    .select("-_id -__v")
    .sort({ createdAt: -1 })
    .lean();
  console.log("instaApply:", leads.length);
  return res.json(
    new ApiResponse(
      200,
      leads,
      "All instant apply applications fetched successfully"
    )
  );
};

export const getAllInstantApply = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    
    const total = await instantApply.countDocuments();

    const data = await instantApply
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json(
      new ApiResponse(200, {
        success: true,
        data,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit
        }
      },
      "Instant Apply Fetch Successfully"
    )
    );
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
