import { BrandDetails } from "../../../model/Brand/Brand.model/BrandDetails.model.js";
import { ApiResponse } from "../../../utils/ApiResponse/ApiResponse.js";


export const togglePayment= async (req, res) => {
  try {
    const {id} = req.params

    const exists = await BrandDetails.findOne({uuid:id})

    if (!exists) {
        return res.json(
        new ApiResponse(404, {}, "Brand not found")
        );
    }

    const data = await BrandDetails.findByIdAndUpdate(
            exists._id,
            { $set: { "brandDetails.payment": !exists?.brandDetails.payment } },
            { new: true }
        );

    return res.json(
      new ApiResponse(200, data, `Payment Status change successfully into: ${data.brandDetails.payment}`)
    );

  } catch (outerError) {
    console.error(" Outer error:", outerError);
    return res.status(500).json({ message: "Server error", error: outerError.message });
  }
};

export const getAllPaidBrand = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const id = req.query.id || null;

    const aggregationPipeline = [
      {
        $match: {
          "brandDetails.payment": { $ne: false } 
        }
      },
      {
        $lookup: {
          from: "brandfranchisedetails",
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "franchiseDetails"
        }
      },
      {
        $lookup: {
          from: "branduploads",
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "uploads"
        }
      },
      { $unwind: { path: "$franchiseDetails", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$uploads", preserveNullAndEmptyArrays: true } },
     
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 0,
          brandID: 1,
          uuid: 1,
          isLiked: 1,
          isShortListed: 1,
          brandname: "$brandDetails.brandName",
          isBrandPause: "$brandDetails.isBrandPause",
          activePackage: "$brandDetails.paymentPackage",
          payment: "$brandDetails.payment",
          brandCategories: {
            $ifNull: ["$franchiseDetails.franchiseDetails.brandCategories", null]
          },
          fico: {
            $let: {
              vars: {
                data: { $arrayElemAt: ["$franchiseDetails.franchiseDetails.fico", 0] }
              },
              in: {
                investmentRange: "$$data.investmentRange",
                areaRequired: "$$data.areaRequired",
                franchiseModel: "$$data.franchiseModel"
              }
            }
          },
          logo: {
            $cond: {
              if: { $isArray: "$uploads.uploads.brandLogo" },
              then: { $arrayElemAt: ["$uploads.uploads.brandLogo", 0] },
              else: null
            }
          },
        }
      },
      { $skip: skip },
      { $limit: limit }
    ];

    const [brandsData, totalCountResult] = await Promise.all([
      BrandDetails.aggregate(aggregationPipeline),
      BrandDetails.aggregate([
        {
          $match: { "brandDetails.payment": { $ne: false } } 
        },
        {
          $count: "totalCount"
        }
      ])
    ]);

    const totalCount = totalCountResult[0]?.totalCount || 0;

    if (!brandsData || brandsData.length === 0) {
      return res.json(new ApiResponse(404, null, "No active brands found"));
    }

    const brands = brandsData
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return res.json(
      new ApiResponse(
        200,
        {
          brands,
          pagination: {
            total: totalCount,
            totalPages,
            currentPage: page,
            limit,
            hasNext,
            hasPrevious
          }
        },
        "Brand data fetched successfully"
      )
    );
  } catch (error) {
    console.error("Error fetching brands:", error);
    return res.json(
      new ApiResponse(500, null, `Failed to fetch brands: ${error.message}`)
    );
  }
}; 