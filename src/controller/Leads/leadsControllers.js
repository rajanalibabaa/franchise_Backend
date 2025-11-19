import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";

const getLeadsBybrandId = async (req, res) => {
  try {
    const brandId = req.params.Id;

    const result = await BrandDetails.aggregate([
      {
        $match: { "brandDetails.brandID": brandId }
      },

  
      // 1) CATEGORY + INVESTMENT RANGE + LOCATION MATCH

      {
        $lookup: {
          from: "categoryinvestmentrangelocationmatches",
          localField: "brandDetails.brandID",
          foreignField: "brandId",
          as: "categoryInvestmentrangeLocationMatch"
        }
      },


      // 2) CATEGORY + INVESTMENT RANGE MATCH

      {
        $lookup: {
          from: "categoryinvestmentrangematches",
          localField: "brandDetails.brandID",
          foreignField: "brandId",
          as: "categoryInvestmentrangeMatch"
        }
      },

   

      // 3) CATEGORY + LOCATION MATCH

      {
        $lookup: {
          from: "categorylocationmatches",
          localField: "brandDetails.brandID",
          foreignField: "brandId",
          as: "categoryLocationMatch"
        }
      },
  
      // 4) LOCATION + INVESTMENT RANGE MATCH
      
      {
        $lookup: {
          from: "locationinvestmentrangematches",
          localField: "brandDetails.brandID",
          foreignField: "brandId",
          as: "locationInvestmentRangeMatch"
        }
      },


      // FINAL PROJECTION
     
      {
        $project: {
          _id: 0,

          brandId: "$brandDetails.brandID",
          brandName: "$brandDetails.brandName",
          companyName: "$brandDetails.companyName",
          email: "$brandDetails.email",
          mobileNumber: "$brandDetails.mobileNumber",

          paymentPackage: "$brandDetails.paymentPackage",
          specialFreeLeadCount: "$brandDetails.specialFreeLeadCount",
          pause: "$brandDetails.pause",
          isFreeLeadPaused: "$brandDetails.isFreeLeadPaused",

          categoryInvestmentrangeLocationMatch: 1,
          categoryInvestmentrangeMatch: 1,
          categoryLocationMatch: 1,
          locationInvestmentRangeMatch: 1
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: result[0] || {}
    });

  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export { getLeadsBybrandId };
