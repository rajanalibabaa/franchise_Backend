import Brand from "../../model/LeadMatching&DistributionLogic/brandModel.js";
import PostRequirement from "../../model/LeadMatching&DistributionLogic/postRequirementModel.js";

export const brandAndPostReqController = async (req, res) => {
    try {
        const { userEmail, category, location, investment } = req.body;

        console.log("Request Body: ", req.body);

        // Validate input data
        if (!userEmail || !category || !location || !investment) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Check if the brand exists
        // const brand = await Brand.findOne({
            // category: new RegExp(category, "i"), // Case-insensitive match
            // targetLocations: { $in: [location] }, // Check if location exists in the array
            // minInvestment: { $lte: investment },
            // maxInvestment: { $gte: investment },
        // });

        const brand = await Brand.find({
            
            targetLocations: { $in: [location] },
            minInvestment: { $lte: investment },
            targetCatagoary: { $regex: category, $options: "i" }, 
            
        })

        if (!brand) {
            return res.status(404).json({ message: "No matching brand found" });
        }

        // Check if the post requirement exists
        // const postRequirement = await PostRequirement.findOne({
            userEmail,
            category,
            location,
            investment,
        // });

        // if (!postRequirement) {
            // return res.status(404).json({ message: "No matching post requirement found" });
        // }

        console.log("Brand: ", brand);

        // If both exist, return the brand and post requirement details
        return res.status(200).json({
            success: true,
            message: "Matching brand and post requirement found",
            data: { brand, postRequirement },
        });
    } catch (error) {
        console.error("Error in brandAndPostReqController: ", error.stack);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};