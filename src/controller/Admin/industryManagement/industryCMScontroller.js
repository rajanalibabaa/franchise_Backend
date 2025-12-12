import mongoose from "mongoose";
import { IndustryManagement } from "../../../model/Admin/CMS/industryManagement.model.js";
import { ApiResponse } from "../../../utils/ApiResponse/ApiResponse.js";
import uuid from "../../../utils/uuid.js";

export const createIndustryManagement = async (req, res) => {
  const { industry, categories, productTags, serviceTags } = req.body;

  console.log(req.body);

  if (!industry || !categories || !productTags || !serviceTags) {
    return res.json(new ApiResponse(404, {}, "All fields are required"));
  }

  const exists = await IndustryManagement.findOne({ industry });

  if (exists) {
    return res.json(new ApiResponse(401, {}, "Industry already exists"));
  }

  const formattedCategories = categories.map((cat) => ({
    id: uuid(),
    category: cat,
  }));
  const formattedProductTags = productTags.map((pt) => ({
    id: uuid(),
    parent: pt.parent,
    tags: (pt.tags || []).map((tag) => ({
      id: uuid(),
      tag: tag,
    })),
  }));

  const formattedServiceTags = serviceTags.map((st) => ({
    id: uuid(),
    parent: st.parent,
    tags: (st.tags || []).map((tag) => ({
      id: uuid(),
      tag: tag,
    })),
  }));

  const data = await IndustryManagement.create({
    industry,
    categories: formattedCategories,
    productTags: formattedProductTags,
    serviceTags: formattedServiceTags,
    uuid: uuid(),
  });

  if (!data) {
    return res.json(new ApiResponse(505, {}, "Failed to create"));
  }

  return res.json(
    new ApiResponse(200, data, "IndustryManagement created successfully")
  );
};

// export const getIndustryByIndustryName = async (req, res) => {
//   const { industry } = req.query;
//   console.log(industry);

//   const exists = await IndustryManagement.findOne({
//     industry: industry,
//   }).select(" -__v -_id");

//   console.log(exists);

//   if (!exists) {
//     return res.json(new ApiResponse(401, {}, "Industry is not exists"));
//   }

//   return res.json(new ApiResponse(200, exists, "Data fetch successfully"));
// };

export const getIndustryByIndustryName = async (req, res) => {
  const { industry } = req.query;
  console.log(industry);

  // If no industry param is provided, return a list of all industries (just industry names as array under "Industry" key)
  if (!industry) {
    const industriesList = await IndustryManagement.find({})
      .select("industry")
      .select(" -__v -_id"); // Exclude __v and _id

    const industryNames = industriesList.map(item => item.industry);

    const responseData = {
      Industry: industryNames
    };

    console.log(responseData);

    return res.json(new ApiResponse(200, responseData, "Industries fetched successfully"));
  }

  // If industry param is provided, return full details for that industry, excluding unwanted id fields and transforming to flat arrays
  const exists = await IndustryManagement.findOne({
    industry: industry,
  }).select({
    __v: 0,
    _id: 0,
    "categories.id": 0,
    "productTags.id": 0,
    "productTags.tags.id": 0,
    "serviceTags.id": 0,
    "serviceTags.tags.id": 0,
  });

  console.log(exists);

  if (!exists) {
    return res.json(new ApiResponse(404, {}, "Industry does not exist"));
  }

  // Transform the data to the desired format: flat arrays for categories and tags
  const transformedData = {
    industry: exists.industry,
    categories: exists.categories.map(cat => cat.category),
    productTags: exists.productTags.map(pt => ({
      parent: pt.parent,
      tags: pt.tags.map(tag => tag.tag)
    })),
    serviceTags: exists.serviceTags.map(st => ({
      parent: st.parent,
      tags: st.tags.map(tag => tag.tag)
    })),
    uuid: exists.uuid,
    createdAt: exists.createdAt,
    updatedAt: exists.updatedAt
  };

  return res.json(new ApiResponse(200, transformedData, "Industry data fetched successfully"));
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

      let data = {};

      if (!main) {
        data = {
          industrys,
          categories: exists[0].categories,
          productTags: exists[0].productTags,
          serviceTags: exists[0].serviceTags,
        };
      } else {
        data = {
          industrys,
        };
      }

      return res.json(new ApiResponse(200, data, "Data fetched successfully"));
    }

    return res.json(new ApiResponse(200, exists, "Data fetched successfully"));
  } catch (error) {
    return res.json(new ApiResponse(500, {}, error.message || "Server error"));
  }
};

export const updateIndustryById = async (req, res) => {
  const { id } = req.params;

  // !industry || !categories || !productTags || !serviceTags
  const { newUpdate, remove } = req?.body;

  if (!id) {
    return res.json(new ApiResponse(401, {}, "id is required"));
  }

  const { categories, productTags, serviceTags } = newUpdate || {};
  const { removeServiceTags, removeCategories, removeProductTags } =
    remove || {};

  const exists = await IndustryManagement.findOne({
    uuid: id,
  });

  // console.log(exists);
  if (!exists) {
    return res.json(new ApiResponse(401, {}, "Data not exists"));
  }

  if (categories?.length > 0) {
    categories.map((item) => {
      const formattedCategories = {
        category: item,
        id: uuid(),
      };
      exists.categories.push(formattedCategories);
    });
  }

  if (removeCategories?.length > 0) {
    removeCategories.forEach((item) => {
      exists.categories = exists?.categories.filter((c) => c.id !== item);
    });
  }

  if (removeProductTags) {
    if (removeProductTags?.products?.length > 0) {
      removeProductTags?.products.map((ids) => {
        const tagsArray = Array.isArray(exists.productTags)
          ? exists.productTags
          : Object.values(exists.productTags);

        exists.productTags = tagsArray.filter((p) => !ids.includes(p.id));
      });
    }

    if (removeProductTags?.tags?.length > 0) {
      removeProductTags?.tags.map((item) => {
        const tagsArray = Array.isArray(exists.productTags)
          ? exists.productTags
          : Object.values(exists.productTags);

        const parentObj = tagsArray.find((p) => p.id === item.productId);

        if (parentObj) {
          parentObj.tags = parentObj.tags.filter(
            (t) => !item.ids.includes(t.id)
          );
        }
      });
    }
  }

  if (removeServiceTags) {
    if (removeServiceTags?.services?.length > 0) {
      removeServiceTags?.services.map((ids) => {
        const tagsArray = Array.isArray(exists.serviceTags)
          ? exists.serviceTags
          : Object.values(exists.serviceTags);

        exists.serviceTags = tagsArray.filter((p) => !ids.includes(p.id));
      });
    }

    if (removeServiceTags?.tags?.length > 0) {
      removeServiceTags?.tags.map((item) => {
        const tagsArray = Array.isArray(exists.serviceTags)
          ? exists.serviceTags
          : Object.values(exists.serviceTags);

        const parentObj = tagsArray.find((p) => p.id === item.serviceId);

        if (parentObj) {
          parentObj.tags = parentObj.tags.filter(
            (t) => !item.ids.includes(t.id)
          );
        }
      });
    }
  }

  if (productTags) {
    if (productTags?.addProductTags) {
      productTags?.addProductTags.map((item) => {
        item.id = uuid();
        (item.tags = (item.tags || []).map((tag) => ({
          id: uuid(),
          tag: tag,
        }))),
          exists.productTags.push(Object(item));
      });
    }
    if (productTags?.pushProductTags?.length > 0) {
      productTags.pushProductTags.forEach((item) => {
        const parentObj = exists.productTags.find((p) => p.id === item.id);
        if (!parentObj) {
          return res.json(
            new ApiResponse(404, item.id, "ProductTag Id doesn't exists")
          );
        }
        if (parentObj) {
          const newTags = (item.tags || []).map((tag) => ({
            id: uuid(),
            tag,
          }));
          parentObj.tags.push(...newTags);
        }
      });
    }
  }
  if (serviceTags) {
    if (serviceTags?.addServiceTags) {
      serviceTags?.addServiceTags.map((item) => {
        item.id = uuid();
        item.tags = (item.tags || []).map((tag) => ({
          id: uuid(),
          tag,
        }));
        exists.serviceTags.push(Object(item));
      });
    }
    if (serviceTags?.pushServiceTags?.length > 0) {
      serviceTags.pushServiceTags.forEach((item) => {
        const parentObj = exists.serviceTags.find((p) => p.id === item.id);

        if (!parentObj) {
          return res.json(
            new ApiResponse(404, item.id, "serviceTag Id doesn't exists")
          );
        }
        if (parentObj) {
          const newTags = (item.tags || []).map((tag) => ({
            id: uuid(),
            tag,
          }));
          parentObj.tags.push(...newTags);
        }
      });
    }
  }

  await exists.save();

  return res.json(
    new ApiResponse(200, exists.serviceTags, "Data deleted successfully")
  );
};

export const deleteIndustryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { remove, deleteIndustry } = req.body;
    const { serviceTags, categories, productTags } = remove || {};

    if (!id) {
      return res.json(new ApiResponse(400, {}, "id is required"));
    }

    const industry = await IndustryManagement.findOne({ uuid: id });

    if (!industry) {
      return res.json(new ApiResponse(404, {}, "Industry not found"));
    }

    if (deleteIndustry === "true") {
      await IndustryManagement.findByIdAndDelete(industry._id);
      return res.json(
        new ApiResponse(200, {}, "Industry deleted successfully")
      );
    }

    if (categories?.length > 0) {
      categories.forEach((item) => {
        industry.categories = industry?.categories.filter((c) => c.id !== item);
      });
    }

    if (productTags) {
      if (productTags?.products?.length > 0) {
        productTags?.products.map((ids) => {
          const tagsArray = Array.isArray(industry.productTags)
            ? industry.productTags
            : Object.values(industry.productTags);

          industry.productTags = tagsArray.filter((p) => !ids.includes(p.id));
        });
      }

      if (productTags?.tags?.length > 0) {
        productTags?.tags.map((item) => {
          const tagsArray = Array.isArray(industry.productTags)
            ? industry.productTags
            : Object.values(industry.productTags);

          const parentObj = tagsArray.find((p) => p.id === item.productId);

          if (parentObj) {
            parentObj.tags = parentObj.tags.filter(
              (t) => !item.ids.includes(t.id)
            );
          }
        });
      }
    }

    if (serviceTags) {
      if (serviceTags?.services?.length > 0) {
        serviceTags?.services.map((ids) => {
          const tagsArray = Array.isArray(industry.serviceTags)
            ? industry.serviceTags
            : Object.values(industry.serviceTags);

          industry.serviceTags = tagsArray.filter((p) => !ids.includes(p.id));
        });
      }

      if (serviceTags?.tags?.length > 0) {
        serviceTags?.tags.map((item) => {
          const tagsArray = Array.isArray(industry.serviceTags)
            ? industry.serviceTags
            : Object.values(industry.serviceTags);

          const parentObj = tagsArray.find((p) => p.id === item.serviceId);

          if (parentObj) {
            parentObj.tags = parentObj.tags.filter(
              (t) => !item.ids.includes(t.id)
            );
          }
        });
      }
    }

    await industry.save();

    return res.json(
      new ApiResponse(200, industry.serviceTags, "Data deleted successfully")
    );
  } catch (error) {
    console.log(error);
    return res.json(new ApiResponse(500, {}, "Something went wrong"));
  }
};
