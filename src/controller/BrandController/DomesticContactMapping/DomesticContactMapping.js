import BrandContactMapping from "../../../model/Brand/DomesticContactMapping/DomesticContactMapping.js";
import { BrandDetails } from "../../../model/Brand/Brand.model/BrandDetails.model.js";
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




export const getBrandContactMappingById = async (
  req,
  res
) => {
  try {
    const { brandOwnerId } = req.params;

    const contactMapping =
      await BrandContactMapping.findOne({
        brandOwnerId,
      }).lean();

    if (!contactMapping) {
      return res.status(404).json({
        success: false,
        message: "Brand Contact Mapping not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: contactMapping,
    });
  } catch (error) {
    console.error(
      "Error fetching Brand Contact Mapping:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
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

