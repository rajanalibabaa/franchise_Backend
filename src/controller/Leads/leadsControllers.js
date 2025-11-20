import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";

const getLeadsBybrandId = async (req, res) => {
  try {
    const id = req.params.id;

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

    return res.json(
      new ApiResponse(200,result[0],"data fetch successfully")
    )
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export { getLeadsBybrandId };
