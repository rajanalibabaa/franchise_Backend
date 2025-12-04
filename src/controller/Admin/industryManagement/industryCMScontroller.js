import { IndustryManagement } from "../../../model/Admin/CMS/industryManagement.model.js";
import { ApiResponse } from "../../../utils/ApiResponse/ApiResponse.js";
import uuid from "../../../utils/uuid.js";

export const createIndustryManagement = async (req, res) => {
  const { industry, categories, productTags, serviceTags } = req.body;

  if (!industry || !categories || !productTags || !serviceTags) {
    return res.json(new ApiResponse(404, {}, "All fields are required"));
  }

  const exists = await IndustryManagement.findOne({ industry: industry });

  const GenerateId = uuid();

  if (exists) {
    return res.json(new ApiResponse(401, {}, "Already industry is exists"));
  }

  const data = await IndustryManagement.create({
    industry,
    categories,
    productTags,
    serviceTags,
    uuid: GenerateId,
  });

  if (!data) {
    return res.json(new ApiResponse(505, {}, "Failed to create"));
  }

  return res.json(
    new ApiResponse(200, data, "IndustryManagement created successfully")
  );
};

export const getIndustryByIndustryName = async (req, res) => {
  const { industry } = req.query;

  const exists = await IndustryManagement.findOne({
    industry: industry,
  }).select(" -__v -_id");

  if (!exists) {
    return res.json(new ApiResponse(401, {}, "Industry is not exists"));
  }

  return res.json(new ApiResponse(200, exists, "Data fetch successfully"));
};

export const getAllIndustry = async (req, res) => {
  try {
    const { main } = req.query;

    let exists = await IndustryManagement.find({}).select("-__v -_id");

    if (!exists || exists.length === 0) {
      return res.json(new ApiResponse(401, {}, "Industry does not exist"));
    }

    if (main === "true") {
      exists = exists.sort((a, b) => a.industry.localeCompare(b.industry));

      const industrys = exists.map((item) => item.industry);

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

export const deleteIndustryById = async (req, res) => {
  const { id } = req.params;
  const { remove } = req.body;

  console.log(id, remove);

  if (!id) {
    return res.json(new ApiResponse(401, {}, "id is required"));
  }
  const { type, parent, index } = remove;
  const match = {
    uuid: id,
  };

  const industry = await IndustryManagement.findOne({ uuid: id });

 

  if (type === "category") {
    if (index < industry.categories.length) {
      industry.categories = industry.categories.filter((_, i) => i !== index);
    } else {
      return res.json(new ApiResponse(400, {}, "Invalid category index"));
    }
  }
  if (type === "productTag") {
    if (index < industry.productTags.length && parent) {
      industry.productTags = industry.productTags.map(item => {
        if (item?.parent === parent) {
          item.tag = item.tag.filter((_, i) => i !== index);
        }
      })
      
      
      
      
    } 
    else {
      return res.json(new ApiResponse(400, {}, "Invalid category index"));
    }
  }

   console.log("industry :", industry.productTags);
   await industry.save();
  return res.json(new ApiResponse(200, industry, "Data deleted successfully"));

  const deleted = await IndustryManagement.findOneAndDelete(match);

  if (!deleted) {
    return res.json(new ApiResponse(401, {}, "Failed to delete"));
  }

  return res.json(new ApiResponse(200, deleted, "Data deleted successfully"));
};

export const updateIndustryById = async (req, res) => {
  const { id } = req.query;

  // !industry || !categories || !productTags || !serviceTags
  const { newUpdate } = req.body;

  if (!id) {
    return res.json(new ApiResponse(401, {}, "id is required"));
  }

  const exists = await IndustryManagement.findOne({
    uuid: id,
  });

  if (!exists) {
    return res.json(new ApiResponse(401, {}, "Data not exists"));
  }

  return res.json(new ApiResponse(200, exists, "Data deleted successfully"));
};
