import mongoose from "mongoose";
import { IndustryManagement } from "../../../model/Admin/CMS/industryManagement.model.js";
import { ApiResponse } from "../../../utils/ApiResponse/ApiResponse.js";
import uuid from "../../../utils/uuid.js";

// export const createIndustryManagement = async (req, res) => {


//   const { industry, categories, productTags, serviceTags } = req.body;

//   console.log(req.body);

//   if (!industry || !categories || !productTags || !serviceTags) {
//     return res.json(new ApiResponse(404, {}, "All fields are required"));
//   }

//   const exists = await IndustryManagement.findOne({ industry });

//   if (exists) {
//     return res.json(new ApiResponse(401, {}, "Industry already exists"));
//   }

//   const formattedCategories = categories.map((cat) => ({
//     id: uuid(),
//     category: cat,
//   }));
//   const formattedProductTags = productTags.map((pt) => ({
//     id: uuid(),
//     parent: pt.parent,
//     tags: (pt.tags || []).map((tag) => ({
//       id: uuid(),
//       tag: tag,
//     })),
//   }));

//   const formattedServiceTags = serviceTags.map((st) => ({
//     id: uuid(),
//     parent: st.parent,
//     tags: (st.tags || []).map((tag) => ({
//       id: uuid(),
//       tag: tag,
//     })),
//   }));

//   const data = await IndustryManagement.create({
//     industry,
//     categories: formattedCategories,
//     productTags: formattedProductTags,
//     serviceTags: formattedServiceTags,
//     uuid: uuid(),
//   });

//   if (!data) {
//     return res.json(new ApiResponse(505, {}, "Failed to create"));
//   }

//   return res.json(
//     new ApiResponse(200, data, "IndustryManagement created successfully")
//   );
// };

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

// export const getIndustryByIndustryName = async (req, res) => {
//   const { industry } = req.query;
//   console.log(industry);

//   // If no industry param is provided, return a list of all industries (just industry names as array under "Industry" key)
//   if (!industry) {
//     const industriesList = await IndustryManagement.find({})
//       .select("industry")
//       .select(" -__v -_id"); // Exclude __v and _id

//     const industryNames = industriesList.map(item => item.industry);

//     const responseData = {
//       Industry: industryNames
//     };

//     console.log(responseData);

//     return res.json(new ApiResponse(200, responseData, "Industries fetched successfully"));
//   }

//   // If industry param is provided, return full details for that industry, excluding unwanted id fields and transforming to flat arrays
//   const exists = await IndustryManagement.findOne({
//     industry: industry,
//   }).select({
//     __v: 0,
//     _id: 0,
//     "categories.id": 0,
//     "productTags.id": 0,
//     "productTags.tags.id": 0,
//     "serviceTags.id": 0,
//     "serviceTags.tags.id": 0,
//   });

//   console.log(exists);

//   if (!exists) {
//     return res.json(new ApiResponse(404, {}, "Industry does not exist"));
//   }

//   // Transform the data to the desired format: flat arrays for categories and tags
//   const transformedData = {
//     industry: exists.industry,
//     categories: exists.categories.map(cat => cat.category),
//     productTags: exists.productTags.map(pt => ({
//       parent: pt.parent,
//       tags: pt.tags.map(tag => tag.tag)
//     })),
//     serviceTags: exists.serviceTags.map(st => ({
//       parent: st.parent,
//       tags: st.tags.map(tag => tag.tag)
//     })),
//     uuid: exists.uuid,
//     createdAt: exists.createdAt,
//     updatedAt: exists.updatedAt
//   };

//   return res.json(new ApiResponse(200, transformedData, "Industry data fetched successfully"));
// };

// export const getAllIndustry = async (req, res) => {
//   try {
//     const { main } = req.query;

//     let exists = await IndustryManagement.find({}).select("-__v -_id");

//     if (!exists || exists.length === 0) {
//       return res.json(new ApiResponse(401, {}, "Industry does not exist"));
//     }

//     if (main === "true") {
//       exists = exists.sort((a, b) => a.industry.localeCompare(b.industry));

//       const industrys = exists.map((item) => item.industry);

//       let data = {};

//       if (!main) {
//         data = {
//           industrys,
//           categories: exists[0].categories,
//           productTags: exists[0].productTags,
//           serviceTags: exists[0].serviceTags,
//         };
//       } else {
//         data = {
//           industrys,
//         };
//       }

//       return res.json(new ApiResponse(200, data, "Data fetched successfully"));
//     }

//     return res.json(new ApiResponse(200, exists, "Data fetched successfully"));
//   } catch (error) {
//     return res.json(new ApiResponse(500, {}, error.message || "Server error"));
//   }
// };

// export const updateIndustryById = async (req, res) => {
//   const { id } = req.params;

//   // !industry || !categories || !productTags || !serviceTags
//   const { newUpdate, remove } = req?.body;

//   if (!id) {
//     return res.json(new ApiResponse(401, {}, "id is required"));
//   }

//   const { categories, productTags, serviceTags } = newUpdate || {};
//   const { removeServiceTags, removeCategories, removeProductTags } =
//     remove || {};

//   const exists = await IndustryManagement.findOne({
//     uuid: id,
//   });

//   // console.log(exists);
//   if (!exists) {
//     return res.json(new ApiResponse(401, {}, "Data not exists"));
//   }

//   if (categories?.length > 0) {
//     categories.map((item) => {
//       const formattedCategories = {
//         category: item,
//         id: uuid(),
//       };
//       exists.categories.push(formattedCategories);
//     });
//   }

//   if (removeCategories?.length > 0) {
//     removeCategories.forEach((item) => {
//       exists.categories = exists?.categories.filter((c) => c.id !== item);
//     });
//   }

//   if (removeProductTags) {
//     if (removeProductTags?.products?.length > 0) {
//       removeProductTags?.products.map((ids) => {
//         const tagsArray = Array.isArray(exists.productTags)
//           ? exists.productTags
//           : Object.values(exists.productTags);

//         exists.productTags = tagsArray.filter((p) => !ids.includes(p.id));
//       });
//     }

//     if (removeProductTags?.tags?.length > 0) {
//       removeProductTags?.tags.map((item) => {
//         const tagsArray = Array.isArray(exists.productTags)
//           ? exists.productTags
//           : Object.values(exists.productTags);

//         const parentObj = tagsArray.find((p) => p.id === item.productId);

//         if (parentObj) {
//           parentObj.tags = parentObj.tags.filter(
//             (t) => !item.ids.includes(t.id)
//           );
//         }
//       });
//     }
//   }

//   if (removeServiceTags) {
//     if (removeServiceTags?.services?.length > 0) {
//       removeServiceTags?.services.map((ids) => {
//         const tagsArray = Array.isArray(exists.serviceTags)
//           ? exists.serviceTags
//           : Object.values(exists.serviceTags);

//         exists.serviceTags = tagsArray.filter((p) => !ids.includes(p.id));
//       });
//     }

//     if (removeServiceTags?.tags?.length > 0) {
//       removeServiceTags?.tags.map((item) => {
//         const tagsArray = Array.isArray(exists.serviceTags)
//           ? exists.serviceTags
//           : Object.values(exists.serviceTags);

//         const parentObj = tagsArray.find((p) => p.id === item.serviceId);

//         if (parentObj) {
//           parentObj.tags = parentObj.tags.filter(
//             (t) => !item.ids.includes(t.id)
//           );
//         }
//       });
//     }
//   }

//   if (productTags) {
//     if (productTags?.addProductTags) {
//       productTags?.addProductTags.map((item) => {
//         item.id = uuid();
//         (item.tags = (item.tags || []).map((tag) => ({
//           id: uuid(),
//           tag: tag,
//         }))),
//           exists.productTags.push(Object(item));
//       });
//     }
//     if (productTags?.pushProductTags?.length > 0) {
//       productTags.pushProductTags.forEach((item) => {
//         const parentObj = exists.productTags.find((p) => p.id === item.id);
//         if (!parentObj) {
//           return res.json(
//             new ApiResponse(404, item.id, "ProductTag Id doesn't exists")
//           );
//         }
//         if (parentObj) {
//           const newTags = (item.tags || []).map((tag) => ({
//             id: uuid(),
//             tag,
//           }));
//           parentObj.tags.push(...newTags);
//         }
//       });
//     }
//   }
//   if (serviceTags) {
//     if (serviceTags?.addServiceTags) {
//       serviceTags?.addServiceTags.map((item) => {
//         item.id = uuid();
//         item.tags = (item.tags || []).map((tag) => ({
//           id: uuid(),
//           tag,
//         }));
//         exists.serviceTags.push(Object(item));
//       });
//     }
//     if (serviceTags?.pushServiceTags?.length > 0) {
//       serviceTags.pushServiceTags.forEach((item) => {
//         const parentObj = exists.serviceTags.find((p) => p.id === item.id);

//         if (!parentObj) {
//           return res.json(
//             new ApiResponse(404, item.id, "serviceTag Id doesn't exists")
//           );
//         }
//         if (parentObj) {
//           const newTags = (item.tags || []).map((tag) => ({
//             id: uuid(),
//             tag,
//           }));
//           parentObj.tags.push(...newTags);
//         }
//       });
//     }
//   }

//   await exists.save();

//   return res.json(
//     new ApiResponse(200, exists.serviceTags, "Data deleted successfully")
//   );
// };

// export const deleteIndustryById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { remove, deleteIndustry } = req.body;
//     const { serviceTags, categories, productTags } = remove || {};

//     if (!id) {
//       return res.json(new ApiResponse(400, {}, "id is required"));
//     }

//     const industry = await IndustryManagement.findOne({ uuid: id });

//     if (!industry) {
//       return res.json(new ApiResponse(404, {}, "Industry not found"));
//     }

//     if (deleteIndustry === "true") {
//       await IndustryManagement.findByIdAndDelete(industry._id);
//       return res.json(
//         new ApiResponse(200, {}, "Industry deleted successfully")
//       );
//     }

//     if (categories?.length > 0) {
//       categories.forEach((item) => {
//         industry.categories = industry?.categories.filter((c) => c.id !== item);
//       });
//     }

//     if (productTags) {
//       if (productTags?.products?.length > 0) {
//         productTags?.products.map((ids) => {
//           const tagsArray = Array.isArray(industry.productTags)
//             ? industry.productTags
//             : Object.values(industry.productTags);

//           industry.productTags = tagsArray.filter((p) => !ids.includes(p.id));
//         });
//       }

//       if (productTags?.tags?.length > 0) {
//         productTags?.tags.map((item) => {
//           const tagsArray = Array.isArray(industry.productTags)
//             ? industry.productTags
//             : Object.values(industry.productTags);

//           const parentObj = tagsArray.find((p) => p.id === item.productId);

//           if (parentObj) {
//             parentObj.tags = parentObj.tags.filter(
//               (t) => !item.ids.includes(t.id)
//             );
//           }
//         });
//       }
//     }

//     if (serviceTags) {
//       if (serviceTags?.services?.length > 0) {
//         serviceTags?.services.map((ids) => {
//           const tagsArray = Array.isArray(industry.serviceTags)
//             ? industry.serviceTags
//             : Object.values(industry.serviceTags);

//           industry.serviceTags = tagsArray.filter((p) => !ids.includes(p.id));
//         });
//       }

//       if (serviceTags?.tags?.length > 0) {
//         serviceTags?.tags.map((item) => {
//           const tagsArray = Array.isArray(industry.serviceTags)
//             ? industry.serviceTags
//             : Object.values(industry.serviceTags);

//           const parentObj = tagsArray.find((p) => p.id === item.serviceId);

//           if (parentObj) {
//             parentObj.tags = parentObj.tags.filter(
//               (t) => !item.ids.includes(t.id)
//             );
//           }
//         });
//       }
//     }

//     await industry.save();

//     return res.json(
//       new ApiResponse(200, industry.serviceTags, "Data deleted successfully")
//     );
//   } catch (error) {
//     console.log(error);
//     return res.json(new ApiResponse(500, {}, "Something went wrong"));
//   }
// };





// Helper: get or create the single root document


const getRootDoc = async () => {
  let doc = await IndustryManagement.findOne();
  if (!doc) {
    doc = await IndustryManagement.create({ headings: [] });
  }
  return doc;
};
export const getIndustryByIndustryName = async (req, res) => {
  try {
    const { industry } = req.query;
    console.log("getIndustryByIndustryName called with industry:", industry);

    // =============================
    // INITIAL LOAD
    // =============================
    if (!industry) {
      const docs = await IndustryManagement.find({})
        .select("headings.heading headings.industries.industry -_id");

      const Industry = [];

      docs.forEach((doc) => {
        doc.headings?.forEach((heading) => {
          Industry.push({
            heading: heading.heading,
            industries: heading.industries?.map(
              (industry) => industry.industry
            ) || [],
          });
        });
      });

      return res.status(200).json(
        new ApiResponse(
          200,
          { Industry },
          "Industries fetched successfully"
        )
      );
    }

    // =============================
    // SINGLE INDUSTRY DETAILS
    // =============================
    const doc = await IndustryManagement.findOne({
      "headings.industries.industry": industry,
    }).select("-__v -_id");

    if (!doc) {
      return res.status(404).json(
        new ApiResponse(
          404,
          {},
          "Industry not found"
        )
      );
    }

    let foundHeading = null;
    let foundIndustry = null;

    for (const heading of doc.headings || []) {
      const industryData = heading.industries?.find(
        (ind) => ind.industry === industry
      );

      if (industryData) {
        foundHeading = heading.heading;
        foundIndustry = industryData;
        break;
      }
    }

    if (!foundIndustry) {
      return res.status(404).json(
        new ApiResponse(
          404,
          {},
          "Industry not found"
        )
      );
    }

    const responseData = {
      heading: foundHeading,
      industry: foundIndustry.industry,
      uuid: foundIndustry.uuid,
      categories: foundIndustry.categories || [],
      productTags: foundIndustry.productTags || [],
      serviceTags: foundIndustry.serviceTags || [],
    };

    return res.status(200).json(
      new ApiResponse(
        200,
        responseData,
        "Industry details fetched successfully"
      )
    );
  } catch (error) {
    console.error("getIndustryByIndustryName Error:", error);

    return res.status(500).json(
      new ApiResponse(
        500,
        {},
        error.message || "Internal Server Error"
      )
    );
  }
};

// ── CREATE  POST /api/v1/admin/createIndustry ─────────────────────────────
// Body: { heading, industry, categories[], productTags[], serviceTags[] }
export const createIndustryManagement = async (req, res) => {
  try {
    const {
      heading,
      industry,
      categories = [],
      productTags = [],
      serviceTags = [],
    } = req.body;

    if (!heading || !industry) {
      return res.json(new ApiResponse(400, {}, "heading and industry are required"));
    }

    const doc = await getRootDoc();

    // Find or create the heading bucket
    let headingObj = doc.headings.find(
      (h) => h.heading.toLowerCase() === heading.trim().toLowerCase()
    );
    if (!headingObj) {
      doc.headings.push({ heading: heading.trim(), industries: [] });
      headingObj = doc.headings[doc.headings.length - 1];
    }

    // Prevent duplicate industry inside this heading
    const alreadyExists = headingObj.industries.some(
      (i) => i.industry.toLowerCase() === industry.trim().toLowerCase()
    );
    if (alreadyExists) {
      return res.json(
        new ApiResponse(409, {}, `Industry "${industry}" already exists under heading "${heading}"`)
      );
    }

    headingObj.industries.push({
      uuid: uuid(),
      industry: industry.trim(),
      categories: categories.map((cat) => ({ id: uuid(), category: cat })),
      productTags: productTags.map((pt) => ({
        id: uuid(),
        parent: pt.parent,
        tags: (pt.tags || []).map((tag) => ({ id: uuid(), tag })),
      })),
      serviceTags: serviceTags.map((st) => ({
        id: uuid(),
        parent: st.parent,
        tags: (st.tags || []).map((tag) => ({ id: uuid(), tag })),
      })),
    });

    await doc.save();

    return res.json(new ApiResponse(200, doc, "Industry created successfully"));
  } catch (error) {
    console.error("createIndustryManagement:", error);
    return res.json(new ApiResponse(500, {}, error.message || "Server error"));
  }
};
// ── GET ALL  GET /api/v1/admin/getAllIndustry?main=true ───────────────────
// ?main=true → flat sorted list of industry names only
// default    → full headings array
export const getAllIndustry = async (req, res) => {
  try {
    const { main } = req.query;

    const doc = await IndustryManagement.findOne().select("-__v");

    if (!doc || doc.headings.length === 0) {
      return res.json(new ApiResponse(404, {}, "No industries found"));
    }

    if (main === "true") {
      const industries = [];
      doc.headings.forEach((h) =>
        h.industries.forEach((i) => industries.push(i.industry))
      );
      industries.sort((a, b) => a.localeCompare(b));
      return res.json(new ApiResponse(200, { industries }, "Data fetched successfully"));
    }

    return res.json(new ApiResponse(200, doc.headings, "Data fetched successfully"));
  } catch (error) {
    console.error("getAllIndustry:", error);
    return res.json(new ApiResponse(500, {}, error.message || "Server error"));
  }
};

// ── UPDATE  PUT /api/v1/admin/updateIndustryById/:id ─────────────────────
// Body:
// {
//   newUpdate: {
//     industry    : "New Name",          // optional – rename
//     heading     : "New Heading",       // optional – move to different heading
//     categories  : ["Cat A"],           // new categories to ADD
//     productTags : {
//       addProductTags  : [{ parent, tags[] }],
//       pushProductTags : [{ id, tags[] }]
//     },
//     serviceTags : {
//       addServiceTags  : [{ parent, tags[] }],
//       pushServiceTags : [{ id, tags[] }]
//     }
//   },
//   remove: {
//     removeCategories  : ["cat-id"],
//     removeProductTags : { products: ["p-id"], tags: [{ productId, ids[] }] },
//     removeServiceTags : { services: ["s-id"], tags: [{ serviceId, ids[] }] }
//   }
// }
export const updateIndustryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.json(new ApiResponse(400, {}, "id is required"));

    const { newUpdate, remove } = req.body || {};
    const {
      categories,
      productTags,
      serviceTags,
      industry: newIndustryName,
      heading: newHeading,
    } = newUpdate || {};
    const { removeCategories, removeProductTags, removeServiceTags } = remove || {};

    const doc = await getRootDoc();

    // Locate industry across all headings
    let industryObj = null;
    let currentHeadingObj = null;
    for (const h of doc.headings) {
      const found = h.industries.find((i) => i.uuid === id);
      if (found) { industryObj = found; currentHeadingObj = h; break; }
    }
    if (!industryObj) return res.json(new ApiResponse(404, {}, "Industry not found"));

    // Rename industry
    if (newIndustryName?.trim()) {
      industryObj.industry = newIndustryName.trim();
    }

    // Move to a different heading
    if (newHeading && newHeading.trim().toLowerCase() !== currentHeadingObj.heading.toLowerCase()) {
      currentHeadingObj.industries = currentHeadingObj.industries.filter(
        (i) => i.uuid !== id
      );
      let targetHeading = doc.headings.find(
        (h) => h.heading.toLowerCase() === newHeading.trim().toLowerCase()
      );
      if (!targetHeading) {
        doc.headings.push({ heading: newHeading.trim(), industries: [] });
        targetHeading = doc.headings[doc.headings.length - 1];
      }
      targetHeading.industries.push(industryObj);
      doc.headings = doc.headings.filter((h) => h.industries.length > 0);

      // Re-resolve after move
      for (const h of doc.headings) {
        const found = h.industries.find((i) => i.uuid === id);
        if (found) { industryObj = found; break; }
      }
    }

    // Categories: add
    if (categories?.length > 0) {
      categories.forEach((cat) => {
        industryObj.categories.push({ id: uuid(), category: cat });
      });
    }

    // Categories: remove
    if (removeCategories?.length > 0) {
      industryObj.categories = industryObj.categories.filter(
        (c) => !removeCategories.includes(c.id)
      );
    }

    // Product tags: add new parent
    if (productTags?.addProductTags?.length > 0) {
      productTags.addProductTags.forEach((item) => {
        industryObj.productTags.push({
          id: uuid(),
          parent: item.parent,
          tags: (item.tags || []).map((tag) => ({ id: uuid(), tag })),
        });
      });
    }

    // Product tags: push tags into existing parent
    if (productTags?.pushProductTags?.length > 0) {
      for (const item of productTags.pushProductTags) {
        const parentObj = industryObj.productTags.find((p) => p.id === item.id);
        if (!parentObj) {
          return res.json(new ApiResponse(404, {}, `ProductTag parent id "${item.id}" not found`));
        }
        parentObj.tags.push(...(item.tags || []).map((tag) => ({ id: uuid(), tag })));
      }
    }

    // Product tags: remove whole parent
    if (removeProductTags?.products?.length > 0) {
      industryObj.productTags = industryObj.productTags.filter(
        (p) => !removeProductTags.products.includes(p.id)
      );
    }

    // Product tags: remove specific child tags
    if (removeProductTags?.tags?.length > 0) {
      removeProductTags.tags.forEach((item) => {
        const parentObj = industryObj.productTags.find((p) => p.id === item.productId);
        if (parentObj) {
          parentObj.tags = parentObj.tags.filter((t) => !item.ids.includes(t.id));
        }
      });
    }

    // Service tags: add new parent
    if (serviceTags?.addServiceTags?.length > 0) {
      serviceTags.addServiceTags.forEach((item) => {
        industryObj.serviceTags.push({
          id: uuid(),
          parent: item.parent,
          tags: (item.tags || []).map((tag) => ({ id: uuid(), tag })),
        });
      });
    }

    // Service tags: push tags into existing parent
    if (serviceTags?.pushServiceTags?.length > 0) {
      for (const item of serviceTags.pushServiceTags) {
        const parentObj = industryObj.serviceTags.find((p) => p.id === item.id);
        if (!parentObj) {
          return res.json(new ApiResponse(404, {}, `ServiceTag parent id "${item.id}" not found`));
        }
        parentObj.tags.push(...(item.tags || []).map((tag) => ({ id: uuid(), tag })));
      }
    }

    // Service tags: remove whole parent
    if (removeServiceTags?.services?.length > 0) {
      industryObj.serviceTags = industryObj.serviceTags.filter(
        (p) => !removeServiceTags.services.includes(p.id)
      );
    }

    // Service tags: remove specific child tags
    if (removeServiceTags?.tags?.length > 0) {
      removeServiceTags.tags.forEach((item) => {
        const parentObj = industryObj.serviceTags.find((p) => p.id === item.serviceId);
        if (parentObj) {
          parentObj.tags = parentObj.tags.filter((t) => !item.ids.includes(t.id));
        }
      });
    }

    await doc.save();

    return res.json(new ApiResponse(200, industryObj, "Industry updated successfully"));
  } catch (error) {
    console.error("updateIndustryById:", error);
    return res.json(new ApiResponse(500, {}, error.message || "Server error"));
  }
};

// ── DELETE  DELETE /api/v1/admin/deleteIndustryById/:id ──────────────────
// Body:
// { deleteIndustry: "true" }   → full delete
// OR
// { remove: { categories[], productTags: { products[], tags[] }, serviceTags: { services[], tags[] } } }
export const deleteIndustryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.json(new ApiResponse(400, {}, "id is required"));

    const { deleteIndustry, remove } = req.body || {};
    const { categories, productTags, serviceTags } = remove || {};

    const doc = await getRootDoc();

    // Locate industry
    let industryObj = null;
    let parentHeading = null;
    for (const h of doc.headings) {
      const found = h.industries.find((i) => i.uuid === id);
      if (found) { industryObj = found; parentHeading = h; break; }
    }
    if (!industryObj) return res.json(new ApiResponse(404, {}, "Industry not found"));

    // Full delete
    if (deleteIndustry === "true") {
      parentHeading.industries = parentHeading.industries.filter((i) => i.uuid !== id);
      doc.headings = doc.headings.filter((h) => h.industries.length > 0);
      await doc.save();
      return res.json(new ApiResponse(200, {}, "Industry deleted successfully"));
    }

    // Partial delete – categories
    if (categories?.length > 0) {
      industryObj.categories = industryObj.categories.filter(
        (c) => !categories.includes(c.id)
      );
    }

    // Partial delete – product tag parents
    if (productTags?.products?.length > 0) {
      industryObj.productTags = industryObj.productTags.filter(
        (p) => !productTags.products.includes(p.id)
      );
    }

    // Partial delete – product child tags
    if (productTags?.tags?.length > 0) {
      productTags.tags.forEach((item) => {
        const parentObj = industryObj.productTags.find((p) => p.id === item.productId);
        if (parentObj) {
          parentObj.tags = parentObj.tags.filter((t) => !item.ids.includes(t.id));
        }
      });
    }

    // Partial delete – service tag parents
    if (serviceTags?.services?.length > 0) {
      industryObj.serviceTags = industryObj.serviceTags.filter(
        (p) => !serviceTags.services.includes(p.id)
      );
    }

    // Partial delete – service child tags
    if (serviceTags?.tags?.length > 0) {
      serviceTags.tags.forEach((item) => {
        const parentObj = industryObj.serviceTags.find((p) => p.id === item.serviceId);
        if (parentObj) {
          parentObj.tags = parentObj.tags.filter((t) => !item.ids.includes(t.id));
        }
      });
    }

    await doc.save();

    return res.json(new ApiResponse(200, industryObj, "Items deleted successfully"));
  } catch (error) {
    console.error("deleteIndustryById:", error);
    return res.json(new ApiResponse(500, {}, error.message || "Server error"));
  }
};




// export const createIndustryManagement = async (req, res) => {
//   try {
//     const {
//       heading,
//       industry,
//       categories = [],
//       productTags = [],
//       serviceTags = [],
//     } = req.body;

//     if (!heading || !industry) {
//       return res.json(
//         new ApiResponse(400, {}, "Heading and Industry are required")
//       );
//     }

//     let data = await IndustryManagement.findOne();

//     if (!data) {
//       data = await IndustryManagement.create({
//         headings: [],
//       });
//     }

//     let headingObj = data.headings.find(
//       (h) => h.heading.toLowerCase() === heading.toLowerCase()
//     );

//     if (!headingObj) {
//       headingObj = {
//         heading,
//         industries: [],
//       };

//       data.headings.push(headingObj);
//       headingObj = data.headings[data.headings.length - 1];
//     }

//     const industryExists = headingObj.industries.find(
//       (i) => i.industry.toLowerCase() === industry.toLowerCase()
//     );

//     if (industryExists) {
//       return res.json(
//         new ApiResponse(409, {}, "Industry already exists")
//       );
//     }

//     headingObj.industries.push({
//       industry,
//       uuid: uuid(),

//       categories: categories.map((cat) => ({
//         id: uuid(),
//         category: cat,
//       })),

//       productTags: productTags.map((pt) => ({
//         id: uuid(),
//         parent: pt.parent,
//         tags: (pt.tags || []).map((tag) => ({
//           id: uuid(),
//           tag,
//         })),
//       })),

//       serviceTags: serviceTags.map((st) => ({
//         id: uuid(),
//         parent: st.parent,
//         tags: (st.tags || []).map((tag) => ({
//           id: uuid(),
//           tag,
//         })),
//       })),
//     });

//     await data.save();

//     return res.json(
//       new ApiResponse(200, data, "Industry created successfully")
//     );
//   } catch (error) {
//     return res.json(
//       new ApiResponse(500, {}, error.message)
//     );
//   }
// };

// export const getIndustryByIndustryName = async (req, res) => {
//   const { industry } = req.query;
//   console.log(industry);

//   // If no industry param is provided, return a list of all industries (just industry names as array under "Industry" key)
//   if (!industry) {
//     const industriesList = await IndustryManagement.find({})
//       .select("industry")
//       .select(" -__v -_id"); // Exclude __v and _id

//     const industryNames = industriesList.map(item => item.industry);

//     const responseData = {
//       Industry: industryNames
//     };

//     console.log(responseData);

//     return res.json(new ApiResponse(200, responseData, "Industries fetched successfully"));
//   }

//   // If industry param is provided, return full details for that industry, excluding unwanted id fields and transforming to flat arrays
//   const exists = await IndustryManagement.findOne({
//     industry: industry,
//   }).select({
//     __v: 0,
//     _id: 0,
//     "categories.id": 0,
//     "productTags.id": 0,
//     "productTags.tags.id": 0,
//     "serviceTags.id": 0,
//     "serviceTags.tags.id": 0,
//   });

//   console.log(exists);

//   if (!exists) {
//     return res.json(new ApiResponse(404, {}, "Industry does not exist"));
//   }

//   // Transform the data to the desired format: flat arrays for categories and tags
//   const transformedData = {
//     industry: exists.industry,
//     categories: exists.categories.map(cat => cat.category),
//     productTags: exists.productTags.map(pt => ({
//       parent: pt.parent,
//       tags: pt.tags.map(tag => tag.tag)
//     })),
//     serviceTags: exists.serviceTags.map(st => ({
//       parent: st.parent,
//       tags: st.tags.map(tag => tag.tag)
//     })),
//     uuid: exists.uuid,
//     createdAt: exists.createdAt,
//     updatedAt: exists.updatedAt
//   };

//   return res.json(new ApiResponse(200, transformedData, "Industry data fetched successfully"));
// };

// export const getAllIndustry = async (req, res) => {
//   try {
//     const { main } = req.query;

//     const data = await IndustryManagement.findOne().select("-__v");

//     if (!data) {
//       return res.json(
//         new ApiResponse(404, {}, "No data found")
//       );
//     }

//     if (main === "true") {
//       const industries = [];

//       data.headings.forEach((heading) => {
//         heading.industries.forEach((industry) => {
//           industries.push(industry.industry);
//         });
//       });

//       return res.json(
//         new ApiResponse(
//           200,
//           { industries: industries.sort() },
//           "Data fetched successfully"
//         )
//       );
//     }

//     return res.json(
//       new ApiResponse(
//         200,
//         data.headings,
//         "Data fetched successfully"
//       )
//     );
//   } catch (error) {
//     return res.json(
//       new ApiResponse(500, {}, error.message)
//     );
//   }
// };

// export const updateIndustryById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { newUpdate, remove } = req.body;

//     const doc = await IndustryManagement.findOne();

//     if (!doc) {
//       return res.json(
//         new ApiResponse(404, {}, "Data not found")
//       );
//     }

//     let industryObj = null;

//     doc.headings.forEach((heading) => {
//       const found = heading.industries.find(
//         (i) => i.uuid === id
//       );

//       if (found) {
//         industryObj = found;
//       }
//     });

//     if (!industryObj) {
//       return res.json(
//         new ApiResponse(404, {}, "Industry not found")
//       );
//     }

//     const { categories, productTags, serviceTags } =
//       newUpdate || {};

//     const {
//       removeCategories,
//       removeProductTags,
//       removeServiceTags,
//     } = remove || {};

//     // Categories Add
//     if (categories?.length) {
//       categories.forEach((item) => {
//         industryObj.categories.push({
//           id: uuid(),
//           category: item,
//         });
//       });
//     }

//     // Categories Remove
//     if (removeCategories?.length) {
//       industryObj.categories =
//         industryObj.categories.filter(
//           (c) => !removeCategories.includes(c.id)
//         );
//     }

//     // Product Tag Add Parent
//     if (productTags?.addProductTags?.length) {
//       productTags.addProductTags.forEach((item) => {
//         industryObj.productTags.push({
//           id: uuid(),
//           parent: item.parent,
//           tags: (item.tags || []).map((tag) => ({
//             id: uuid(),
//             tag,
//           })),
//         });
//       });
//     }

//     // Product Tag Push
//     if (productTags?.pushProductTags?.length) {
//       productTags.pushProductTags.forEach((item) => {
//         const parent =
//           industryObj.productTags.find(
//             (p) => p.id === item.id
//           );

//         if (parent) {
//           parent.tags.push(
//             ...(item.tags || []).map((tag) => ({
//               id: uuid(),
//               tag,
//             }))
//           );
//         }
//       });
//     }

//     // Service Tag Add Parent
//     if (serviceTags?.addServiceTags?.length) {
//       serviceTags.addServiceTags.forEach((item) => {
//         industryObj.serviceTags.push({
//           id: uuid(),
//           parent: item.parent,
//           tags: (item.tags || []).map((tag) => ({
//             id: uuid(),
//             tag,
//           })),
//         });
//       });
//     }

//     // Service Tag Push
//     if (serviceTags?.pushServiceTags?.length) {
//       serviceTags.pushServiceTags.forEach((item) => {
//         const parent =
//           industryObj.serviceTags.find(
//             (p) => p.id === item.id
//           );

//         if (parent) {
//           parent.tags.push(
//             ...(item.tags || []).map((tag) => ({
//               id: uuid(),
//               tag,
//             }))
//           );
//         }
//       });
//     }

//     // Remove Product Parent
//     if (removeProductTags?.products?.length) {
//       industryObj.productTags =
//         industryObj.productTags.filter(
//           (p) => !removeProductTags.products.includes(p.id)
//         );
//     }

//     // Remove Product Child Tags
//     if (removeProductTags?.tags?.length) {
//       removeProductTags.tags.forEach((item) => {
//         const parent =
//           industryObj.productTags.find(
//             (p) => p.id === item.productId
//           );

//         if (parent) {
//           parent.tags = parent.tags.filter(
//             (t) => !item.ids.includes(t.id)
//           );
//         }
//       });
//     }

//     // Remove Service Parent
//     if (removeServiceTags?.services?.length) {
//       industryObj.serviceTags =
//         industryObj.serviceTags.filter(
//           (p) => !removeServiceTags.services.includes(p.id)
//         );
//     }

//     // Remove Service Child Tags
//     if (removeServiceTags?.tags?.length) {
//       removeServiceTags.tags.forEach((item) => {
//         const parent =
//           industryObj.serviceTags.find(
//             (p) => p.id === item.serviceId
//           );

//         if (parent) {
//           parent.tags = parent.tags.filter(
//             (t) => !item.ids.includes(t.id)
//           );
//         }
//       });
//     }

//     await doc.save();

//     return res.json(
//       new ApiResponse(
//         200,
//         industryObj,
//         "Industry updated successfully"
//       )
//     );
//   } catch (error) {
//     return res.json(
//       new ApiResponse(500, {}, error.message)
//     );
//   }
// };

// export const deleteIndustryById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const doc = await IndustryManagement.findOne();

//     if (!doc) {
//       return res.json(
//         new ApiResponse(404, {}, "Data not found")
//       );
//     }

//     let deleted = false;

//     doc.headings.forEach((heading) => {
//       const beforeCount = heading.industries.length;

//       heading.industries = heading.industries.filter(
//         (industry) => industry.uuid !== id
//       );

//       if (beforeCount !== heading.industries.length) {
//         deleted = true;
//       }
//     });

//     doc.headings = doc.headings.filter(
//       (h) => h.industries.length > 0
//     );

//     if (!deleted) {
//       return res.json(
//         new ApiResponse(404, {}, "Industry not found")
//       );
//     }

//     await doc.save();

//     return res.json(
//       new ApiResponse(
//         200,
//         {},
//         "Industry deleted successfully"
//       )
//     );
//   } catch (error) {
//     return res.json(
//       new ApiResponse(500, {}, error.message)
//     );
//   }
// };