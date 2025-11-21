import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";

const getLeadsBybrandId = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.json(new ApiResponse(200, null, "Id is required"));
    }

    const packageStartDate = req?.body?.packageStartDate;

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
          from: "categorylocationmatches",
          localField: "uuid",
          foreignField: "brandId",
          as: "categoryLocationMatch",
        },
      },
      {
        $project: {
          _id: 0,
          uuid: 1,
          paymentPackage: "$brandDetails.paymentPackage",
          categoryInvestmentrangeMatch: 1,
          categoryLocationMatch: 1,
        },
      },
    ]);

    if (!result) {
      return res.json(new ApiResponse(200, null, "data not found"));
    }

    return res.json(new ApiResponse(200, result[0], "data fetch successfully"));
  } catch (error) { 
     return res.json(new ApiResponse(500, "Server error", error.message));
  }
};

export { getLeadsBybrandId };
