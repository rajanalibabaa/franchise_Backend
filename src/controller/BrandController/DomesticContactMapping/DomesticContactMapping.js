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

// export const updateFranchiseTypeByModelAndType = async (
//   franchiseModel,
//   franchiseType,
//   newFranchiseTypeData
// ) => {
//   console.log("=================================================");
//   console.log("Update Franchise Type Started");
//   console.log("Franchise Model:", franchiseModel);
//   console.log("Current Franchise Type:", franchiseType);
//   console.log("New Franchise Type:", newFranchiseTypeData);
//   console.log("=================================================");

//   try {
//     const modelRegex = new RegExp(
//       `^\\s*${franchiseModel.trim()}\\s*$`,
//       "i"
//     );

//     const typeRegex = new RegExp(
//       `^\\s*${franchiseType.trim()}\\s*$`,
//       "i"
//     );

//     const brands = await BrandFranchiseDetails.find({
//       "franchiseDetails.fico": {
//         $elemMatch: {
//           franchiseModel: modelRegex,
//           franchiseType: typeRegex,
//         },
//       },
//     });

//     console.log(`Found ${brands.length} matching brands`);

//     if (!brands.length) {
//       return {
//         success: false,
//         foundBrands: 0,
//         updatedBrands: 0,
//         message: "No matching brands found",
//       };
//     }

//     let updatedBrands = 0;

//     for (const brand of brands) {
//       let modified = false;

//       if (
//         !brand?.franchiseDetails?.fico ||
//         !Array.isArray(brand.franchiseDetails.fico)
//       ) {
//         continue;
//       }

//       for (const fico of brand.franchiseDetails.fico) {
//         const dbModel = fico?.franchiseModel?.trim()?.toLowerCase();
//         const dbType = fico?.franchiseType?.trim()?.toLowerCase();

//         const incomingModel = franchiseModel
//           ?.trim()
//           ?.toLowerCase();

//         const incomingType = franchiseType
//           ?.trim()
//           ?.toLowerCase();

//         if (
//           dbModel === incomingModel &&
//           dbType === incomingType
//         ) {
//           console.log("\n====================================");
//           console.log(
//             "Brand Owner ID:",
//             brand.brandOwnerId
//           );
//           console.log(
//             "Matched Franchise Model:",
//             fico.franchiseModel
//           );
//           console.log(
//             "Old Franchise Type:",
//             fico.franchiseType
//           );
//           console.log(
//             "New Franchise Type:",
//             newFranchiseTypeData
//           );
//           console.log("====================================");

//           // Update only franchiseType
//           fico.franchiseType = newFranchiseTypeData;

//           modified = true;
//         }
//       }

//       if (modified) {
//         await brand.save();

//         console.log(
//           `Updated Brand: ${brand.brandOwnerId}`
//         );

//         updatedBrands++;
//       }
//     }

//     console.log("\n=================================================");
//     console.log(`Total Brands Found   : ${brands.length}`);
//     console.log(`Total Brands Updated : ${updatedBrands}`);
//     console.log("=================================================\n");

//     return {
//       success: true,
//       foundBrands: brands.length,
//       updatedBrands,
//       message: `${updatedBrands} brands updated successfully`,
//     };
//   } catch (error) {
//     console.error(
//       "Error updating franchise type:",
//       error
//     );

//     return {
//       success: false,
//       foundBrands: 0,
//       updatedBrands: 0,
//       message: error.message,
//     };
//   }
// };



export const findFranchiseTypeCounts = async () => {
  try {
    const brands = await BrandFranchiseDetails.find(
      {},
      {
        "franchiseDetails.fico.franchiseType": 1,
        brandOwnerId: 1,
      }
    );

    const franchiseTypeCounts = {};

    for (const brand of brands) {
      const ficoList = brand?.franchiseDetails?.fico || [];

      for (const fico of ficoList) {
        if (!fico?.franchiseType) continue;

        const franchiseType = fico.franchiseType
          .trim()
          .toLowerCase();

        franchiseTypeCounts[franchiseType] =
          (franchiseTypeCounts[franchiseType] || 0) + 1;
      }
    }

    console.log("\n========== Franchise Type Counts ==========");

    Object.entries(franchiseTypeCounts).forEach(
      ([franchiseType, count]) => {
        console.log(
          `${franchiseType} => ${count} records`
        );
      }
    );

    console.log(
      "\nTotal Unique Franchise Types:",
      Object.keys(franchiseTypeCounts).length
    );

    console.log("\n========== Unique Values ==========");

    Object.keys(franchiseTypeCounts).forEach(
      (franchiseType) => {
        console.log(franchiseType);
      }
    );

    return {
      success: true,
      totalUniqueFranchiseTypes:
        Object.keys(franchiseTypeCounts).length,
      franchiseTypeCounts,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: error.message,
    };
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
