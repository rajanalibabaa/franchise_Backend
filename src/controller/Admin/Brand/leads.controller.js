import BrandBatch from "../../../model/NewIncomeInvestor/InstantApplyTrackSchema.js";
import { ApiResponse } from "../../../utils/ApiResponse/ApiResponse.js";


export const leadsFreeAndPaidStopAndStart = async (req, res) => {
  try {
    const {isFreeLeadsBrandPaused,isPaidLeadsBrandPaused}=req.body

    const exists = await BrandBatch.findOne({})

    if (!exists) {
        return res.json(
        new ApiResponse(404, {}, "Brand not found")
        );
    }

    console.log(exists)

    const data = await BrandBatch.findByIdAndUpdate(
            exists._id,
            { $set: { 
                ...(isFreeLeadsBrandPaused !== undefined && { isFreeLeadsBrandPaused }),
                ...(isPaidLeadsBrandPaused !== undefined && { isPaidLeadsBrandPaused }),               
            } },
            { new: true }
        );

    
    return res.json(
      new ApiResponse(200, data, "Data change successfully")
    );

  } catch (outerError) {
    console.error(" Outer error:", outerError);
    return res.status(500).json({ message: "Server error", error: outerError.message });
  }
}; 