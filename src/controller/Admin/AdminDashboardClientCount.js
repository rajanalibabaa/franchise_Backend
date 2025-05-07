import FranchiseBrand from "../../model/Brand/brandListingPage.js";
import { InvsRegister } from "../../model/Investor/invsRegister.js";
import { PostRequirement } from "../../model/Post Requirement/postRequirement.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";

const getAllClientCount = async (req, res) => {
  try {
    const InvsRegisterCount = await InvsRegister.countDocuments({});
    const BrandListingCount = await FranchiseBrand.countDocuments({});
    const PostRequirementCount = await PostRequirement.countDocuments({});

    const countsArray = [
      { label: "Investors", count: InvsRegisterCount },
      { label: "BrandList", count: BrandListingCount },
      { label: "PostRequirements", count: PostRequirementCount },
    ];

    res.status(200).json(new ApiResponse(200, countsArray));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
  }
};

export { getAllClientCount };
