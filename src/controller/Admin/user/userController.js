import { BrandDetails } from "../../../model/Brand/Brand.model/BrandDetails.model.js";
import { instantApply } from "../../../model/Brand/brandFranchiseApply.js";
import { InvsRegister } from "../../../model/Investor/invsRegister.js";
import { ApiResponse } from "../../../utils/ApiResponse/ApiResponse.js";

export const userCount = async (req, res) => {
  try {
    // Run all counts in parallel for better performance
    const [brandStats, investorsCount, instantApplyCount] = await Promise.all([
      BrandDetails.aggregate([
        {
          $group: {
            _id: null,
            brandsCount: {
              $sum: {
                $cond: [
                  { $and: [
                      { $eq: ["$brandDetails.isApproved", true] },
                      { $eq: ["$brandDetails.payment", false] }
                    ]
                  },
                  1,
                  0
                ]
              },
            },
            newBrandsCount: {
              $sum: {
                $cond: [{ $eq: ["$brandDetails.isApproved", false] }, 1, 0],
              },
            },
            paidBrandsCount: {
              $sum: {
                $cond: [{ $eq: ["$brandDetails.payment", true] }, 1, 0],
              },
            },
          },
        },
      ]),
      InvsRegister.countDocuments(),
      instantApply.countDocuments(),
    ]);

    const brandCounts = brandStats[0] || {
      brandsCount: 0,
      newBrandsCount: 0,
      paidBrandsCount: 0,
    };

    return res.json(
      new ApiResponse(
        200,
        {
          brandsCount: brandCounts.brandsCount,
          newBrandsCount: brandCounts.newBrandsCount,
          investorsCount,
          instantApplyCount,
          paidBrandsCount: brandCounts.paidBrandsCount,
        },
        "All user count fetched successfully"
      )
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
};

