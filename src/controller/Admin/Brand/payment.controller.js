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