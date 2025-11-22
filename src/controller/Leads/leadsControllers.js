import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { format } from "../../utils/AllLeads/instantApplyPaidLeads.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";

const getLeadsBybrandId = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.json(new ApiResponse(200, null, "Id is required"));
    }

    const packageStartDate = req?.query?.packageStartDate;
    const date = format(new Date(packageStartDate));
    console.log("packageStartDate :", date);

    const result = await BrandDetails.aggregate([
      {
        $match: { uuid: id },
      },

      {
        $lookup: {
          from: "categoryinvestmentrangematches",
          localField: "uuid",
          foreignField: "brandId",
          as: "categoryInvestmentrangeMatch",
        },
      },
      {
        $lookup: {
          from: "brandemailcounts",
          localField: "uuid",
          foreignField: "brandId",
          as: "freeLeads",
        },
      },
      {
        $lookup: {
          from: "categorylocationmatches",
          localField: "uuid",
          foreignField: "brandId",
          as: "categoryLocationMatch",
        },
      },
      {
        $lookup: {
          from: "categorylocationmatches",
          localField: "uuid",
          foreignField: "brandId",
          as: "categoryLocationMatch",
        },
      },
      {
        $unwind: {
          path: "$categoryLocationMatch",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$categoryInvestmentrangeMatch",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$freeLeads",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          uuid: 1,
          // paymentPackage: "$brandDetails.paymentPackage",
          freeLead: {
            leadCount: "$freeLeads.freeEmailCount" || 0,
            records: "$freeLeads.freeEmailRecords",
          },
          categoryInvestmentrangeMatch: {
            $first: {
              $filter: {
                input:
                  "$categoryInvestmentrangeMatch.categoryInvestmentrangeMatchRecords",
                as: "d",
                cond: {
                  $eq: ["$$d.packageStartDate", date],
                },
              },
            },
          },
          categoryLocationMatch: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$categoryLocationMatch.categoryLocationMatchRecords",
                  as: "d",
                  cond: {
                    $eq: ["$$d.packageStartDate", date],
                  },
                },
              },
              0,
            ],
          },
        },
      },
    ]);

    console.log("result :", result);

    if (!result) {
      return res.json(new ApiResponse(200, null, "data not found"));
    }

    return res.json(new ApiResponse(200, result[0], "data fetch successfully"));
  } catch (error) {
    return res.json(new ApiResponse(500, "Server error", error.message));
  }
};

export { getLeadsBybrandId };
