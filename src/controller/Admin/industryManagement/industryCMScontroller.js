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

export const updateIndustryById = async (req, res) => {
  const { id } = req.params;

  // !industry || !categories || !productTags || !serviceTags
  const { newUpdate } = req?.body;

  if (!id) {
    return res.json(new ApiResponse(401, {}, "id is required"));
  }

  const { categories, productTags, serviceTags } = newUpdate;

  const exists = await IndustryManagement.findOne({
    uuid: id,
  });

  console.log(exists);
  if (!exists) {
    return res.json(new ApiResponse(401, {}, "Data not exists"));
  }

  if (categories?.length > 0) {
    categories.map((item) => {
      exists.categories.push(String(item));
    });
  }

  if (productTags) {
    if (productTags?.addProductTags) {
      productTags?.addProductTags.map((item) => {
        exists.productTags.push(Object(item));
      });
    }
    if (productTags?.pushProductTags?.length > 0) {
      productTags.pushProductTags.forEach((item) => {
        const parentObj = exists.productTags.find(
          (p) => p.parent === item.parent
        );

        if (parentObj) {
          parentObj.tags.push(...item.tags);
        }
      });
    }
  }
  if (serviceTags) {
    if (serviceTags?.addServiceTags) {
      serviceTags?.addServiceTags.map((item) => {
        exists.serviceTags.push(Object(item));
      });
    }
    if (serviceTags?.pushServiceTags?.length > 0) {
      serviceTags.pushServiceTags.forEach((item) => {
        const parentObj = exists.serviceTags.find(
          (p) => p.parent === item.parent
        );

        if (parentObj) {
          parentObj.tags.push(...item.tags);
        }
      });
    }
  }

  await exists.save();

  return res.json(new ApiResponse(200, exists, "Data deleted successfully"));
};

// export const deleteIndustryById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { remove, deleteIndustry } = req.body;
//     const { type, parent, index } = remove || {};

//     if (!id) {
//       return res.json(new ApiResponse(400, {}, "id is required"));
//     }

//     const industry = await IndustryManagement.findOne({ uuid: id });

//     if (!industry) {
//       return res.json(new ApiResponse(404, {}, "Industry not found"));
//     }

//     if (
//       type === undefined &&
//       parent === undefined &&
//       index === undefined &&
//       deleteIndustry === "true"
//     ) {
//       await IndustryManagement.findByIdAndDelete(industry._id);
//       return res.json(
//         new ApiResponse(200, {}, "Industry deleted successfully")
//       );
//     }

//     if (type === "category") {
//       if (index < industry?.categories?.length) {
//         industry.categories = industry.categories.filter((_, i) => i !== index);
//       } else {
//         return res.json(new ApiResponse(400, {}, "Invalid category index"));
//       }
//     }

//     if (type === "productTag") {
//       if (parent) {
//         industry.productTags = industry.productTags.map((item) => {
//           if (item.parent === parent) {
//             item.tags = item.tags.filter((_, i) => i !== index);
//           }
//           return item;
//         });
//       } else if (!parent && industry.serviceTags.length >= index) {
//         industry.serviceTags = industry.serviceTags.filter(
//           (_, i) => i !== index
//         );
//       } else {
//         return res.json(new ApiResponse(400, {}, "Invalid category index"));
//       }
//     }

//     if (type === "serviceTag") {
//       if (parent) {
//         industry.serviceTags = industry.serviceTags.map((item) => {
//           if (item.parent === parent) {
//             item.tags = item.tags.filter((_, i) => i !== index);
//           }
//           return item;
//         });
//       } else if (!parent && industry.serviceTags.length >= index) {
//         industry.serviceTags = industry.serviceTags.filter(
//           (_, i) => i !== index
//         );
//       } else {
//         return res.json(new ApiResponse(400, {}, "Invalid category index"));
//       }
//     }

//     await industry.save();

//     return res.json(
//       new ApiResponse(200, industry.categories, "Data deleted successfully")
//     );
//   } catch (error) {
//     console.log(error);
//     return res.json(new ApiResponse(500, {}, "Something went wrong"));
//   }
// };

export const deleteIndustryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { remove, deleteIndustry } = req.body;
    const { type, parent, index, categories, productTags } = remove || {};

    if (!id) {
      return res.json(new ApiResponse(400, {}, "id is required"));
    }

    const industry = await IndustryManagement.findOne({ uuid: id });

    if (!industry) {
      return res.json(new ApiResponse(404, {}, "Industry not found"));
    }

    if (
      type === undefined &&
      parent === undefined &&
      index === undefined &&
      deleteIndustry === "true"
    ) {
      await IndustryManagement.findByIdAndDelete(industry._id);
      return res.json(
        new ApiResponse(200, {}, "Industry deleted successfully")
      );
    }

    console.log(industry.productTags.length);

    if (categories?.length > 0) {
      categories.sort((a, b) => b - a);

      categories.forEach((idx) => {
        if (idx >= 0 && idx < industry.categories.length) {
          industry.categories.splice(idx, 1);
        }
      });
    }

    if (productTags) {
      if (parent) {
        industry.productTags = industry.productTags.map((item) => {
          if (item.parent === parent) {
            item.tags = item.tags.filter((_, i) => i !== index);
          }
          return item; 
        });
      }

      if (productTags?.products.length > 0) {
        productTags?.products.sort((a, b) => b - a);
        productTags?.products.forEach((idx) => {
          if (idx >= 0 && idx < industry.productTags.length) {
            industry.productTags.splice(idx, 1);
          }
        });
      }
    }

    // if (type === "serviceTag") {
    //   if (parent) {
    //     industry.serviceTags = industry.serviceTags.map((item) => {
    //       if (item.parent === parent) {
    //         item.tags = item.tags.filter((_, i) => i !== index);
    //       }
    //       return item;
    //     });
    //   } else if (!parent && industry.serviceTags.length >= index) {
    //     industry.serviceTags = industry.serviceTags.filter(
    //       (_, i) => i !== index
    //     );
    //   } else {
    //     return res.json(new ApiResponse(400, {}, "Invalid category index"));
    //   }
    // }

    // await industry.save();
    return res.json(
      new ApiResponse(200, industry.productTags, "Data deleted successfully")
    );
  } catch (error) {
    console.log(error);
    return res.json(new ApiResponse(500, {}, "Something went wrong"));
  }
};
