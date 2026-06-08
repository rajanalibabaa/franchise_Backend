import BrandContactMapping from "../../../model/Brand/DomesticContactMapping/DomesticContactMapping.js";
import { BrandDetails } from "../../../model/Brand/Brand.model/BrandDetails.model.js";
import { BrandExpansionLocationData } from "../../../model/Brand/Brand.model/ExpansionLocation.model.js";

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

// All brands contact mapping creation for domestic locations
export const createContactMappingsForExistingBrands =
  async () => {
    try {
      const brands = await BrandDetails.find(
        {},
        {
          uuid: 1,
          brandDetails: 1,
        }
      ).lean();

      console.log(
        `Found ${brands.length} brands`
      );

      let createdCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const brand of brands) {
        try {
          const brandOwnerId = brand.uuid;

          const alreadyExists =
            await BrandContactMapping.exists({
              brandOwnerId,
            });

          if (alreadyExists) {
            skippedCount++;
            continue;
          }

          const expansionData =
            await BrandExpansionLocationData.findOne({
              brandOwnerId,
            }).lean();

          if (!expansionData) {
            console.log(
              `Expansion data not found for ${brandOwnerId}`
            );
            continue;
          }

          const locations =
            expansionData?.expansionLocationData
              ?.expansionLocations?.domestic
              ?.locations || [];

          const defaultEmail =
            brand?.brandDetails?.email || "";

          const defaultMobile =
            brand?.brandDetails?.mobileNumber || "";

          const defaultWhatsapp =
            brand?.brandDetails?.whatsappNumber || "";

          const states = [];

          for (const location of locations) {
            const stateName = location?.state;

            if (!stateName) continue;

            const stateObj = {
              state: stateName,
              email: defaultEmail,
              mobileNumber: defaultMobile,
              whatsappNumber: defaultWhatsapp,
              districts: [],
            };

            const districts =
              location?.districts || [];

            for (const districtObj of districts) {
              const districtName =
                districtObj?.district;

              if (!districtName) continue;

              stateObj.districts.push({
                district: districtName,
                email: defaultEmail,
                mobileNumber: defaultMobile,
                whatsappNumber: defaultWhatsapp,
              });
            }

            states.push(stateObj);
          }

          await BrandContactMapping.create({
            brandOwnerId,
            brandName:
              brand?.brandDetails?.brandName || "",
            states,
          });

          createdCount++;

          console.log(
            `Created Contact Mapping -> ${brand?.brandDetails?.brandName}`
          );
        } catch (brandError) {
          errorCount++;

          console.error(
            `Failed Brand ${brand?.uuid}`,
            brandError.message
          );
        }
      }

      console.log("=================================");
      console.log(`Created : ${createdCount}`);
      console.log(`Skipped : ${skippedCount}`);
      console.log(`Errors  : ${errorCount}`);
      console.log("=================================");

      return {
        createdCount,
        skippedCount,
        errorCount,
      };
    } catch (error) {
      console.error(
        "Migration Error:",
        error
      );
      throw error;
    }
  };