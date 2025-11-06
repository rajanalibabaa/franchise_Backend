import { BrandDetails } from "../../../model/Brand/Brand.model/BrandDetails.model.js";
import BrandBatch from "../../../model/NewIncomeInvestor/InstantApplyTrackSchema.js";
import { ApiResponse } from "../../../utils/ApiResponse/ApiResponse.js";


// Add this GET controller to fetch current status
export const getLeadStatus = async (req, res) => {
  try {
    const brandBatch = await BrandBatch.findOne({});
    
    if (!brandBatch) {
      // Return default values if no record exists
      return res.json(
        new ApiResponse(200, {
          isFreeLeadsBrandPaused: false,
          isPaidLeadsBrandPaused: false
        }, "Default lead status")
      );
    }

    return res.json(
      new ApiResponse(200, {
        isFreeLeadsBrandPaused: brandBatch.isFreeLeadsBrandPaused || false,
        isPaidLeadsBrandPaused: brandBatch.isPaidLeadsBrandPaused || false,
        _id: brandBatch._id,
        updatedAt: brandBatch.updatedAt
      }, "Lead status retrieved successfully")
    );

  } catch (error) {
    console.error("Error fetching lead status:", error);
    return res.status(500).json(
      new ApiResponse(500, {}, "Server error")
    );
  }
};

// Enhanced version of your existing controller
export const leadsFreeAndPaidStopAndStart = async (req, res) => {
  try {
    const { isFreeLeadsBrandPaused, isPaidLeadsBrandPaused } = req.body;

    // Validation
    if (isFreeLeadsBrandPaused === undefined && isPaidLeadsBrandPaused === undefined) {
      return res.status(400).json(
        new ApiResponse(400, {}, "At least one field (isFreeLeadsBrandPaused or isPaidLeadsBrandPaused) must be provided")
      );
    }

    let brandBatch = await BrandBatch.findOne({});

    if (!brandBatch) {
      // Create new record if doesn't exist
      brandBatch = new BrandBatch({
        isFreeLeadsBrandPaused: isFreeLeadsBrandPaused || false,
        isPaidLeadsBrandPaused: isPaidLeadsBrandPaused || false
      });
      
      const savedData = await brandBatch.save();
      
      return res.json(
        new ApiResponse(201, savedData, "Lead settings created successfully")
      );
    }

    // Update existing record
    const updateData = {};
    if (isFreeLeadsBrandPaused !== undefined) {
      updateData.isFreeLeadsBrandPaused = isFreeLeadsBrandPaused;
    }
    if (isPaidLeadsBrandPaused !== undefined) {
      updateData.isPaidLeadsBrandPaused = isPaidLeadsBrandPaused;
    }

    const updatedData = await BrandBatch.findByIdAndUpdate(
      brandBatch._id,
      { $set: updateData },
      { new: true }
    );

    // Log the changes for audit
    console.log("Lead settings updated:", {
      previousState: {
        isFreeLeadsBrandPaused: brandBatch.isFreeLeadsBrandPaused,
        isPaidLeadsBrandPaused: brandBatch.isPaidLeadsBrandPaused
      },
      newState: updateData,
      updatedAt: new Date().toISOString()
    });

    return res.json(
      new ApiResponse(200, updatedData, "Lead settings updated successfully")
    );

  } catch (error) {
    console.error("Error updating lead settings:", error);
    return res.status(500).json(
      new ApiResponse(500, {}, "Server error")
    );
  }
};


export const toggleleadPausedorPlayById = async (req,res) => {
  try {
      const {id} = req.params
  
      const exists = await BrandDetails.findOne({uuid:id})
  
      if (!exists) {
          return res.json(
          new ApiResponse(404, {}, "Brand not found")
          );
      }
  
      console.log(exists.brandDetails.isFreeLeadPaused)
  
      const data = await BrandDetails.findByIdAndUpdate(
              exists._id,
              { $set: { "brandDetails.isFreeLeadPaused": !exists?.brandDetails.isFreeLeadPaused } },
              { new: true }
          );
  
      let message
      if (data.brandDetails.isFreeLeadPaused === true) {
          message ="Brand lead pause successfully"
      } else {
          message ="Brand lead play successfully"
      }
      
      return res.json(
        new ApiResponse(200, data, message)
      );
  
    } catch (outerError) {
      console.error(" Outer error:", outerError);
      return res.status(500).json({ message: "Server error", error: outerError.message });
    }
}

export const getAllFreeLeadPauseBrand = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const id = req.query.id || null;

    const aggregationPipeline = [
      {
        $match: {
          "brandDetails.isFreeLeadPaused": { $ne: false } 
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
          isFreeLeadPaused: "$brandDetails.isFreeLeadPaused",
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
          $match: { "brandDetails.isFreeLeadPaused": { $ne: false } } 
        },
        {
          $count: "totalCount"
        }
      ])
    ]);

    const totalCount = totalCountResult[0]?.totalCount || 0;

    if (!brandsData || brandsData.length === 0) {
      return res.json(new ApiResponse(404, null, "No free lead paused brands found"));
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