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
