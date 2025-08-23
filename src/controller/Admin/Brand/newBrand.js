import NewIncomingBrands from "../../../model/Brand/newIncomigBrands.js";
import { ApiResponse } from "../../../utils/ApiResponse/ApiResponse.js";
import uuid from "../../../utils/uuid.js";

export const getNewIncomingBrands = async (req, res) => {
  try {
    // const NewIncomingBrands = mongoose.model("NewIncomingBrands");
    const brands = await NewIncomingBrands.aggregate([
        // { $sort: { createdAt: -1 } },
        { $limit: 10 },
        { $project: { 
            _id: 0,
            uuid: 1,
            brandID: 1,
            brandName: 1,
            fullName: "$brandDetails.fullName",
            brandCategories: "$franchiseDetails.brandCategories",
            createdAt: 1
        } }
    ])
    
    if (brands.length === 0) {
      return res.json(
        new ApiResponse(304,null , "No new incoming brands found")
      )
    }
    return res.json(
      new ApiResponse(200, brands, "New incoming brands fetched successfully")
    )
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const getNewIncomingBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    // const NewIncomingBrands = mongoose.model("NewIncomingBrands");
    const brand = await NewIncomingBrands.findById({uuid: id});
    if (!brand) {
      return res.json(
        new ApiResponse(304,null , "No brand found with the given ID")
      )
    }
    return res.json(
      new ApiResponse(200, brand, "Brand fetched successfully")
    )
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const brandApprove = async (req, res) => {
    try {
        const { id } = req.params;

        const brand = await NewIncomingBrands.findOne({uuid: id});
        if (!brand) {
            return res.json(
                new ApiResponse(404, null, "Brand not found")
            )
        }

          

    } catch (error) {
        return res.json(
            new ApiResponse(500, null, "Internal Server Error")
        )
    }
}