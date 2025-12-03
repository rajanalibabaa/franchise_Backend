import { IndustryManagement } from "../../../model/Admin/CMS/industryManagement.model.js";
import { ApiResponse } from "../../../utils/ApiResponse/ApiResponse.js";
import uuid from "../../../utils/uuid.js";

export const createIndustryManagement = async (req, res) => {
  const { industry, categories, productTags, serviceTags } = req.body;

  if (!industry || !categories || !productTags || !serviceTags) {
    return res.json(new ApiResponse(404, {}, "All fields are required"));
  }

  const exists = await IndustryManagement.findOne({ industry: industry });

  const GenerateId = uuid()

  if (exists) {
    return res.json(new ApiResponse(401, {}, "Already industry is exists"));
  }

  const data = await IndustryManagement.create({
    industry,
    categories,
    productTags,
    serviceTags,
    uuid:GenerateId
  });

  if (!data) {
    return res.json(new ApiResponse(505, {}, "Failed to create"));
  }

  return res.json(new ApiResponse(200, data, "IndustryManagement created successfully"));
};

export const getIndustryByIndustryName = async(req,res) => {
  const {industry} = req.query 

  const exists = await IndustryManagement.findOne({ industry: industry }).select(" -__v -_id");

   if (!exists) {
    return res.json(new ApiResponse(401, {}, "Industry is not exists"));
  }


  return res.json(new ApiResponse(200, exists, "Data fetch successfully"));

}

export const getAllIndustry = async (req, res) => {
  try {
    const { main } = req.query;

    let exists = await IndustryManagement.find({})
      .select("-__v -_id");

    if (!exists || exists.length === 0) {
      return res.json(new ApiResponse(401, {}, "Industry does not exist"));
    }

    if (main === "true") {

     exists = exists.sort((a, b) => a.industry.localeCompare(b.industry));

      const industrys = exists.map(item => item.industry);

      const data = {
        industrys,
        categories: exists[0].categories,
        productTags: exists[0].productTags,
        serviceTags: exists[0].serviceTags,
      };

      return res.json(new ApiResponse(200, data, "Data fetched successfully"));
    }

    return res.json(new ApiResponse(200, exists, "Data fetched successfully"));

  } catch (error) {
    return res.json(new ApiResponse(500, {}, error.message || "Server error"));
  }
};
