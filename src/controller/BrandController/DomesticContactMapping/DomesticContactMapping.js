import XLSX from "xlsx";
import BrandContactMapping from "../../../model/Brand/DomesticContactMapping/DomesticContactMapping.js";
import { BrandDetails } from "../../../model/Brand/Brand.model/BrandDetails.model.js";
import { BrandFranchiseDetails } from "../../../model/Brand/Brand.model/FranchiseDetails.model.js";
import { BrandExpansionLocationData } from "../../../model/Brand/Brand.model/ExpansionLocation.model.js";

  // When create or update brand details mapping for domestic contact mapping accordingly

export const createBrandContactMappingDomestic = async (
  brandOwnerId,
  brandName,
  brandDetails,
  expansionLocationData
) => {
  try {
    const defaultEmail =
      brandDetails?.email || "";

    const defaultMobileNumber =
      brandDetails?.mobileNumber || "";

    const defaultWhatsappNumber =
      brandDetails?.whatsappNumber || "";

    const locations =
      expansionLocationData?.expansionLocations?.domestic?.locations || [];

    const states = [];

    for (const location of locations) {
      const stateName = location?.state;

      if (!stateName) continue;

      const stateObj = {
        state: stateName,
        email: defaultEmail,
        mobileNumber: defaultMobileNumber,
        whatsappNumber: defaultWhatsappNumber,
        districts: [],
      };

      const districts = location?.districts || [];

      for (const districtObj of districts) {
        const districtName =
          districtObj?.district;

        if (!districtName) continue;

        stateObj.districts.push({
          district: districtName,
          email: defaultEmail,
          mobileNumber: defaultMobileNumber,
          whatsappNumber: defaultWhatsappNumber,
        });
      }

      states.push(stateObj);
    }

    return await BrandContactMapping.create({
      brandOwnerId,
      brandName,
      states,
    });
  } catch (error) {
    console.error(
      "Error creating BrandContactMapping:",
      error
    );
    throw error;
  }
};

export const updateBrandContactMappingDomestic = async (
  brandOwnerId,
  addExpansionLocationData,
  removeExpansionLocationData,
  brandDetails
) => {
  try {
    const contactMapping =
      await BrandContactMapping.findOne({
        brandOwnerId,
      });

    if (!contactMapping) {
      throw new Error("Brand Contact Mapping not found");
    }

    const defaultEmail =
      brandDetails?.email || "";

    const defaultMobileNumber =
      brandDetails?.mobileNumber || "";

    const defaultWhatsappNumber =
      brandDetails?.whatsappNumber || "";

    // ======================
    // REMOVE STATES
    // ======================
    if (
      removeExpansionLocationData?.expansionLocations
        ?.domestic?.state
    ) {
      contactMapping.states =
        contactMapping.states.filter(
          (stateObj) =>
            !removeExpansionLocationData
              .expansionLocations
              .domestic
              .state
              .includes(stateObj.state)
        );
    }

    // ======================
    // REMOVE DISTRICTS
    // ======================
    if (
      removeExpansionLocationData?.expansionLocations
        ?.domestic?.districts
    ) {
      for (const [
        stateName,
        districts,
      ] of Object.entries(
        removeExpansionLocationData
          .expansionLocations
          .domestic
          .districts
      )) {
        const stateObj =
          contactMapping.states.find(
            (s) => s.state === stateName
          );

        if (!stateObj) continue;

        stateObj.districts =
          stateObj.districts.filter(
            (districtObj) =>
              !districts.includes(
                districtObj.district
              )
          );

        // Remove state if no districts left
        if (
          stateObj.districts.length === 0
        ) {
          contactMapping.states =
            contactMapping.states.filter(
              (s) =>
                s.state !== stateName
            );
        }
      }
    }

    // ======================
    // ADD STATES
    // ======================
    if (
      addExpansionLocationData?.expansionLocations
        ?.domestic?.state
    ) {
      for (const stateName of
        addExpansionLocationData
          .expansionLocations
          .domestic
          .state) {

        const exists =
          contactMapping.states.some(
            (s) => s.state === stateName
          );

        if (!exists) {
          contactMapping.states.push({
            state: stateName,
            email: defaultEmail,
            mobileNumber:
              defaultMobileNumber,
            whatsappNumber:
              defaultWhatsappNumber,
            districts: [],
          });
        }
      }
    }

    // ======================
    // ADD DISTRICTS
    // ======================
    if (
      addExpansionLocationData?.expansionLocations
        ?.domestic?.districts
    ) {
      for (const [
        stateName,
        districts,
      ] of Object.entries(
        addExpansionLocationData
          .expansionLocations
          .domestic
          .districts
      )) {

        let stateObj =
          contactMapping.states.find(
            (s) => s.state === stateName
          );

        // Create state if missing
        if (!stateObj) {
          stateObj = {
            state: stateName,
            email: defaultEmail,
            mobileNumber:
              defaultMobileNumber,
            whatsappNumber:
              defaultWhatsappNumber,
            districts: [],
          };

          contactMapping.states.push(
            stateObj
          );
        }

        for (const districtName of districts) {
          const districtExists =
            stateObj.districts.some(
              (d) =>
                d.district ===
                districtName
            );

          if (!districtExists) {
            stateObj.districts.push({
              district: districtName,
              email: defaultEmail,
              mobileNumber:
                defaultMobileNumber,
              whatsappNumber:
                defaultWhatsappNumber,
            });
          }
        }
      }
    }

    await contactMapping.save();

    return contactMapping;
  } catch (error) {
    console.error(
      "Error updating BrandContactMapping:",
      error
    );
    throw error;
  }
};

export const getBrandContactStates =
  async (req, res) => {
    try {
      const { brandOwnerId } =
        req.params;
        console.log("Fetching contact mapping for brandOwnerId:", brandOwnerId);

      const result =
        await BrandContactMapping.aggregate(
          [
            {
              $match: {
                brandOwnerId,
              },
            },
            {
              $project: {
                _id: 0,
                brandOwnerId: 1,
                states: {
                  $map: {
                    input: "$states",
                    as: "state",
                    in: {
                      state:
                        "$$state.state",
                      email:
                        "$$state.email",
                      mobileNumber:
                        "$$state.mobileNumber",
                      whatsappNumber:
                        "$$state.whatsappNumber",
                      districtCount: {
                        $size: {
                          $ifNull: [
                            "$$state.districts",
                            [],
                          ],
                        },
                      },
                    },
                  },
                },
              },
            },
          ]
        );

      if (!result.length) {
        return res.status(404).json({
          success: false,
          message:
            "Brand Contact Mapping not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: result[0],
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Internal Server Error",
        error: error.message,
      });
    }
  };

export const getDistrictsByState =
  async (req, res) => {
    try {
      const {
        brandOwnerId,
        state,
      } = req.params;
      console.log(`Fetching districts for brandOwnerId: ${brandOwnerId}, state: ${state}` );

      const result =
        await BrandContactMapping.aggregate(
          [
            {
              $match: {
                brandOwnerId,
              },
            },
            {
              $unwind: "$states",
            },
            {
              $match: {
                "states.state":
                  state,
              },
            },
            {
              $project: {
                _id: 0,
                state:
                  "$states.state",
                districts:
                  "$states.districts",
              },
            },
          ]
        );

      if (!result.length) {
        return res.status(404).json({
          success: false,
          message:
            "State not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: result[0],
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Internal Server Error",
        error: error.message,
      });
    }
  };

export const updateContactMapping = async (
  req,
  res
) => {
  try {
    const {
      brandOwnerId,
      state,
      district,
      email,
      mobileNumber,
      whatsappNumber,
    } = req.body;

    if (!brandOwnerId || !state) {
      return res.status(400).json({
        success: false,
        message:
          "brandOwnerId and state are required",
      });
    }

    const brand =
      await BrandContactMapping.findOne({
        brandOwnerId,
      });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    const stateObj = brand.states.find(
      (s) => s.state === state
    );

    if (!stateObj) {
      return res.status(404).json({
        success: false,
        message: "State not found",
      });
    }

    // ==========================
    // DISTRICT UPDATE
    // ==========================
    if (district) {
      const districtObj =
        stateObj.districts.find(
          (d) => d.district === district
        );

      if (!districtObj) {
        return res.status(404).json({
          success: false,
          message:
            "District not found in selected state",
        });
      }

      if (email !== undefined) {
        districtObj.email = email;
      }

      if (mobileNumber !== undefined) {
        districtObj.mobileNumber =
          mobileNumber;
      }

      if (
        whatsappNumber !== undefined
      ) {
        districtObj.whatsappNumber =
          whatsappNumber;
      }

      await brand.save();

      return res.status(200).json({
        success: true,
        message:
          "District contact updated successfully",
        data: districtObj,
      });
    }

    // ==========================
    // STATE UPDATE
    // ==========================

    const oldEmail = stateObj.email;
    const oldMobile =
      stateObj.mobileNumber;
    const oldWhatsapp =
      stateObj.whatsappNumber;

    if (email !== undefined) {
      stateObj.email = email;
    }

    if (mobileNumber !== undefined) {
      stateObj.mobileNumber =
        mobileNumber;
    }

    if (
      whatsappNumber !== undefined
    ) {
      stateObj.whatsappNumber =
        whatsappNumber;
    }

    // Update districts that still use state values
    stateObj.districts.forEach(
      (districtObj) => {
        if (
          email &&
          districtObj.email === oldEmail
        ) {
          districtObj.email = email;
        }

        if (
          mobileNumber &&
          districtObj.mobileNumber ===
            oldMobile
        ) {
          districtObj.mobileNumber =
            mobileNumber;
        }

        if (
          whatsappNumber &&
          districtObj.whatsappNumber ===
            oldWhatsapp
        ) {
          districtObj.whatsappNumber =
            whatsappNumber;
        }
      }
    );

    await brand.save();

    return res.status(200).json({
      success: true,
      message:
        "State contact updated successfully",
      data: stateObj,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateFicoByBrandCategory = async (req, res) => {
  try {
    const { brandCategory, newDataFico } = req.body;

    if (!brandCategory?.main || !brandCategory?.sub) {
      return res.status(400).json({
        success: false,
        message: "Brand main and sub categories are required",
      });
    }

    const filter = {
      "franchiseDetails.brandCategories.main":
        brandCategory.main,
      "franchiseDetails.brandCategories.sub":
        brandCategory.sub,
    };

    // Optional Product Tag Filter
    if (
      brandCategory?.productTag?.parent &&
      brandCategory?.productTag?.tag
    ) {
      filter[
        "franchiseDetails.brandCategories.productTags"
      ] = {
        $elemMatch: {
          parent: brandCategory.productTag.parent,
          tags: brandCategory.productTag.tag,
        },
      };
    }

    const brands = await BrandFranchiseDetails.find(filter);

    if (!brands.length) {
      return res.status(404).json({
        success: false,
        message: "No matching brands found",
      });
    }

    let updatedBrands = 0;

    for (const brand of brands) {
      if (
        !brand.franchiseDetails?.fico ||
        !brand.franchiseDetails.fico.length
      ) {
        continue;
      }

      brand.franchiseDetails.fico =
        brand.franchiseDetails.fico.map((fico) => ({
          ...fico.toObject(),
          franchiseModel:
            newDataFico?.franchiseModel ??
            fico.franchiseModel,
          franchiseType:
            newDataFico?.franchiseType ??
            fico.franchiseType,
        }));

      await brand.save();
      updatedBrands++;
    }

    return res.status(200).json({
      success: true,
      message: "FICO updated successfully",
      matchedBrands: brands.length,
      updatedBrands,
    });
  } catch (error) {
    console.error(
      "updateFicoByBrandCategory Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export const updateFicoByCategory = async (req, res) => {
//   try {
//     const {
//       brandCategories,
//       franchiseModel,
//       franchiseType,
//     } = req.body;

//     console.log("updateFicoByCategory Request Body:", req.body);

//     if (!brandCategories?.main || !brandCategories?.sub) {
//       return res.status(400).json({
//         success: false,
//         message: "brandCategories.main and brandCategories.sub are required",
//       });
//     }

//     const filter = {
//       "franchiseDetails.brandCategories.main":
//         brandCategories.main,
//       "franchiseDetails.brandCategories.sub":
//         brandCategories.sub,
//     };

//     // Get matching franchise records before update
//     const franchiseRecords = await BrandFranchiseDetails.find(filter)
//       .select("brandOwnerId")
//       .lean();

//     const brandOwnerIds = franchiseRecords.map(
//       (item) => item.brandOwnerId
//     );

//     const updateFields = {};

//     if (franchiseModel) {
//       updateFields[
//         "franchiseDetails.fico.$[].franchiseModel"
//       ] = franchiseModel;
//     }

//     if (franchiseType) {
//       updateFields[
//         "franchiseDetails.fico.$[].franchiseType"
//       ] = franchiseType;
//     }

//     const result = await BrandFranchiseDetails.updateMany(
//       filter,
//       {
//         $set: updateFields,
//       }
//     );

//     // Fetch brand names
//     const brands = await BrandDetails.find({
//       uuid: { $in: brandOwnerIds },
//     })
//       .select(
//         "uuid brandDetails.brandName brandDetails.companyName"
//       )
//       .lean();

//     return res.status(200).json({
//       success: true,
//       matchedCount: result.matchedCount,
//       modifiedCount: result.modifiedCount,
//       updatedBrands: brands.map((brand) => ({
//         uuid: brand.uuid,
//         brandName: brand.brandDetails?.brandName,
//         companyName: brand.brandDetails?.companyName,
//       })),
//     });
//   } catch (error) {
//     console.error("updateFicoByCategory Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const getAllBrandNames = async (req, res) => {
  try {
    const brands = await BrandDetails.aggregate([
      {
        $lookup: {
          from: "brandfranchisedetails",
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "franchiseData",
        },
      },
      {
        $unwind: {
          path: "$franchiseData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          BrandName: "$brandDetails.brandName",
          MainCategory:
            "$franchiseData.franchiseDetails.brandCategories.main",
          SubCategory:
            "$franchiseData.franchiseDetails.brandCategories.sub",
        },
      },
      {
        $sort: {
          BrandName: 1,
        },
      },
    ]);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(brands);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 40 }, // Brand Name
      { wch: 30 }, // Main Category
      { wch: 30 }, // Sub Category
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Brand Categories"
    );

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    const fileName = `Brand_Category_Report_${Date.now()}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileName}`
    );

    return res.send(excelBuffer);
  } catch (error) {
    console.error("Error exporting report:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to export report",
      error: error.message,
    });
  }
};
export const exportBrandProductTagsReport = async (req, res) => {
  try {
    // Get all brands
    const brands = await BrandDetails.find({})
      .select("uuid brandDetails.brandName")
      .lean();

    // Get all franchise details
    const franchiseBrands =
      await BrandFranchiseDetails.find({})
        .select(
          "brandOwnerId franchiseDetails.brandCategories"
        )
        .lean();

    console.log("Total Brands:", brands.length);
    console.log(
      "Total Franchise Brands:",
      franchiseBrands.length
    );

    // Create franchise map
    const franchiseMap = {};

    franchiseBrands.forEach((franchise) => {
      franchiseMap[franchise.brandOwnerId] =
        franchise;
    });

    const excelData = [];

    for (const brand of brands) {
      const brandName =
        brand?.brandDetails?.brandName || "";

      const brandOwnerId = brand.uuid;

      const franchise =
        franchiseMap[brandOwnerId];

      // Brand exists but no franchise details
      if (!franchise) {
        excelData.push({
          BrandName: brandName,
          BrandOwnerId: brandOwnerId,
          MainCategory: "",
          SubCategory: "",
          Parent: "",
          TagsCount: 0,
          Tags: "",
        });

        continue;
      }

      const brandCategories =
        franchise?.franchiseDetails
          ?.brandCategories || {};

      const mainCategory =
        brandCategories.main || "";

      const subCategory =
        brandCategories.sub || "";

      const productTags =
        brandCategories.productTags || [];

      // Franchise exists but no product tags
      if (!productTags.length) {
        excelData.push({
          BrandName: brandName,
          BrandOwnerId: brandOwnerId,
          MainCategory: mainCategory,
          SubCategory: subCategory,
          Parent: "",
          TagsCount: 0,
          Tags: "",
        });

        continue;
      }

      // One row per parent
      for (const item of productTags) {
        excelData.push({
          BrandName: brandName,
          BrandOwnerId: brandOwnerId,
          MainCategory: mainCategory,
          SubCategory: subCategory,
          Parent: item?.parent || "",
          TagsCount: item?.tags?.length || 0,
          Tags: (item?.tags || []).join(", "),
        });
      }
    }

    const workbook = XLSX.utils.book_new();

    const worksheet =
      XLSX.utils.json_to_sheet(excelData);

    worksheet["!cols"] = [
      { wch: 40 }, // BrandName
      { wch: 30 }, // BrandOwnerId
      { wch: 30 }, // MainCategory
      { wch: 30 }, // SubCategory
      { wch: 30 }, // Parent
      { wch: 15 }, // TagsCount
      { wch: 100 }, // Tags
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Brand Product Tags"
    );

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=brand-product-tags-report-${Date.now()}.xlsx`
    );

    return res.send(buffer);
  } catch (error) {
    console.error(
      "exportBrandProductTagsReport Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const bulkUpdateFranchiseModelType = async (req, res) => {
  try {
    const data = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a non-empty array",
      });
    }

    // Normalize brand name
    const normalizeBrandName = (name) => {
      return String(name || "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
    };

    // Load all brands once (faster than querying every row)
    const brands = await BrandDetails.find(
      {},
      {
        uuid: 1,
        "brandDetails.brandName": 1,
      }
    ).lean();

    // Create brandName -> uuid map
    const brandMap = new Map();

    brands.forEach((brand) => {
      const normalizedName = normalizeBrandName(
        brand?.brandDetails?.brandName
      );

      if (normalizedName) {
        brandMap.set(normalizedName, brand.uuid);
      }
    });

    const bulkOperations = [];
    const updatedBrands = [];
    const notFoundBrands = [];

    for (const item of data) {
      const {
        brandName,
        franchiseModel,
        franchiseType,
      } = item;

      const normalizedInputName =
        normalizeBrandName(brandName);

      const uuid = brandMap.get(normalizedInputName);

      if (!uuid) {
        notFoundBrands.push({
          brandName,
          reason: "Brand not found",
        });
        continue;
      }

      bulkOperations.push({
        updateOne: {
          filter: {
            brandOwnerId: uuid,
          },
          update: {
            $set: {
              "franchiseDetails.fico.$[].franchiseModel":
                franchiseModel,
              "franchiseDetails.fico.$[].franchiseType":
                franchiseType,
            },
          },
        },
      });

      updatedBrands.push({
        brandName,
        uuid,
      });
    }

    let bulkResult = null;

    if (bulkOperations.length > 0) {
      bulkResult =
        await BrandFranchiseDetails.bulkWrite(
          bulkOperations
        );
    }

    return res.status(200).json({
      success: true,
      totalReceived: data.length,
      totalMatched: updatedBrands.length,
      totalNotFound: notFoundBrands.length,
      modifiedCount: bulkResult?.modifiedCount || 0,
      matchedCount: bulkResult?.matchedCount || 0,
      notFoundBrands,
    });
  } catch (error) {
    console.error(
      "bulkUpdateFranchiseModelType Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// All brands contact mapping creation for domestic locations 

// export const createContactMappingsForExistingBrands =
//   async () => {
//     try {
//       const brands = await BrandDetails.find(
//         {},
//         {
//           uuid: 1,
//           brandDetails: 1,
//         }
//       ).lean();

//       console.log(
//         `Found ${brands.length} brands`
//       );

//       let createdCount = 0;
//       let skippedCount = 0;
//       let errorCount = 0;

//       for (const brand of brands) {
//         try {
//           const brandOwnerId = brand.uuid;

//           const alreadyExists =
//             await BrandContactMapping.exists({
//               brandOwnerId,
//             });

//           if (alreadyExists) {
//             skippedCount++;
//             continue;
//           }

//           const expansionData =
//             await BrandExpansionLocationData.findOne({
//               brandOwnerId,
//             }).lean();

//           if (!expansionData) {
//             console.log(
//               `Expansion data not found for ${brandOwnerId}`
//             );
//             continue;
//           }

//           const locations =
//             expansionData?.expansionLocationData
//               ?.expansionLocations?.domestic
//               ?.locations || [];

//           const defaultEmail =
//             brand?.brandDetails?.email || "";

//           const defaultMobile =
//             brand?.brandDetails?.mobileNumber || "";

//           const defaultWhatsapp =
//             brand?.brandDetails?.whatsappNumber || "";

//           const states = [];

//           for (const location of locations) {
//             const stateName = location?.state;

//             if (!stateName) continue;

//             const stateObj = {
//               state: stateName,
//               email: defaultEmail,
//               mobileNumber: defaultMobile,
//               whatsappNumber: defaultWhatsapp,
//               districts: [],
//             };

//             const districts =
//               location?.districts || [];

//             for (const districtObj of districts) {
//               const districtName =
//                 districtObj?.district;

//               if (!districtName) continue;

//               stateObj.districts.push({
//                 district: districtName,
//                 email: defaultEmail,
//                 mobileNumber: defaultMobile,
//                 whatsappNumber: defaultWhatsapp,
//               });
//             }

//             states.push(stateObj);
//           }

//           await BrandContactMapping.create({
//             brandOwnerId,
//             brandName:
//               brand?.brandDetails?.brandName || "",
//             states,
//           });

//           createdCount++;

//           console.log(
//             `Created Contact Mapping -> ${brand?.brandDetails?.brandName}`
//           );
//         } catch (brandError) {
//           errorCount++;

//           console.error(
//             `Failed Brand ${brand?.uuid}`,
//             brandError.message
//           );
//         }
//       }

//       console.log("=================================");
//       console.log(`Created : ${createdCount}`);
//       console.log(`Skipped : ${skippedCount}`);
//       console.log(`Errors  : ${errorCount}`);
//       console.log("=================================");

//       return {
//         createdCount,
//         skippedCount,
//         errorCount,
//       };
//     } catch (error) {
//       console.error(
//         "Migration Error:",
//         error
//       );
//       throw error;
//     }
//   };
