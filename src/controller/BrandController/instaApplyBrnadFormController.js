import instaApplyBrnadForm from "../../model/Brand/brandFranchiseApply.js";
import uuid from "../../utils/uuid.js";

const instaApplyBrnadFormController = async (req, res) => {
  try {
   const { 
      fullName,
      location,
      franchiseModel,
      franchiseType,
      investmentRange,
      planToInvest,
      readyToInvest,
      brandId,
      brandName
    } = req.body;
    // Validate required fields
console.log(req.body);

     if (!brandId || !brandName) {
      return res.status(400).json({
        success: false,
        message: 'Brand ID and Brand Name are required'
      });
    }



    const newSubmission = new instaApplyBrnadForm({
      uuid: uuid(),
      fullName,
      location,
      franchiseModel,
      franchiseType,
      investmentRange,
      planToInvest,
      readyToInvest,
      brandId,
      brandName
    });

    await newSubmission.save();

    res.status(201).json({ message: "Form submitted successfully", data: newSubmission });
  } catch (error) {
    console.error('Create InstaApply Error:', error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

export default instaApplyBrnadFormController;