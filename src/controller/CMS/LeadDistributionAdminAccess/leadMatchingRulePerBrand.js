import LeadMatchingRule from "../../../model/CMS/LeadDistributionAdminAccess/leadMatch.js";
import LeadMatchingRulePerBrand from "../../../model/CMS/LeadDistributionAdminAccess/leadMatchingRulePerBrand.js";
// import {BrandDetails} from "../../../model/Brand/Brand.model/BrandDetails.model.js";

export const cloneLeadMatchingRuleForBrand = async (id, brandName) => {
  try {
    console.log("Cloning Lead Matching Rule for brandOwnerId:",
      id, "and brandName:", brandName
    );
   
    console.log(
      "Cloning Lead Matching Rule for brandOwnerId:",
      id
    );
    if (!id) {
      throw new Error("Brand Owner ID is required");
    }

    // Check if the brand-specific rule already exists
    const existingBrandRule = await LeadMatchingRulePerBrand.findOne({
      brandOwnerId: id,
    });

    if (existingBrandRule) {
      console.log(
        "Brand-specific lead matching rule already exists for brandOwnerId:",
        id,
      );
      return existingBrandRule;
    }

    // Get master rule document
    const masterRule = await LeadMatchingRule.findOne();

    if (!masterRule) {
        throw new Error("Master Lead Matching Rule not found");
    }

    // Create brand-specific copy
    const brandRule =
      await LeadMatchingRulePerBrand.create({
        brandOwnerId: id,
        brandName: brandName, // Assuming you have the brand name available
        rules: masterRule.rules,
      });

    return brandRule;
  } catch (error) {
    console.error(
      "cloneLeadMatchingRuleForBrand Error:",
      error,
    );

    throw new Error(
      "Failed to clone lead matching rule for brand: " +
        error.message,
    );
  }
};

export const updateLeadMatchPerBrand = async (
  req,
  res
) => {
  try {
    const { brandOwnerId } = req.params;

    const {
      packageType,
      selectedMatchTypes,
    } = req.body;

    const brandRule =
      await LeadMatchingRulePerBrand.findOne({
        brandOwnerId,
      });

    if (!brandRule) {
      return res.status(404).json({
        success: false,
        message: "Brand rule not found",
      });
    }

    brandRule.rules =
      brandRule.rules.map((rule) => {
        const isSelected =
          selectedMatchTypes.some(
            (item) =>
              item.matchType ===
              rule.matchType,
          );

        return {
          ...rule.toObject(),

          packagePlans:
            rule.packagePlans.map((pkg) => {
              if (
                pkg.packageType ===
                packageType
              ) {
                return {
                  ...pkg.toObject(),
                  isActive: isSelected,
                };
              }

              return pkg;
            }),
        };
      });

    await brandRule.save();

    return res.status(200).json({
      success: true,
      message:
        "Lead Match Updated Successfully",
      data: brandRule,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message:
        "Error updating lead match",
      error: error.message,
    });
  }
};

export const getLeadMatchPerBrand =
  async (req, res) => {
    try {
      const { brandOwnerId } =
        req.params;

      const data =
        await LeadMatchingRulePerBrand.findOne(
          {
            brandOwnerId,
          },
        );

      if (!data) {
        return res.status(404).json({
          success: false,
          message:
            "Brand Rule Not Found",
        });
      }

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };


// export const createLeadRulesForAllBrands =
//   async () => {
//     try {
//       // Get master rule
//       const masterRule =
//         await LeadMatchingRule.findOne().lean();

//       if (!masterRule) {
//         throw new Error(
//           "Master Lead Matching Rule not found"
//         );
//       }

//       // Get all brands
//       const brands =
//         await BrandDetails.find(
//           {},
//           {
//             uuid: 1,
//             brandID: 1,
//             "brandDetails.brandName": 1,
//           }
//         ).lean();

//       console.log(
//         "Found brands:",
//         brands.map(
//           (b) =>
//             `${b.brandDetails?.brandName} (${b.uuid})`
//         )
//       );

//       // Get existing brand rules
//       const existingRules =
//         await LeadMatchingRulePerBrand.find(
//           {},
//           {
//             brandOwnerId: 1,
//           }
//         ).lean();

//       const existingBrandIds = new Set(
//         existingRules.map(
//           (item) => item.brandOwnerId
//         )
//       );

//       // Prepare new documents
//       const documentsToInsert = brands
//         .filter(
//           (brand) =>
//             brand.uuid &&
//             !existingBrandIds.has(
//               brand.uuid
//             )
//         )
//         .map((brand) => ({
//           brandOwnerId: brand.uuid,
//           brandID: brand.brandID,
//           brandName:
//             brand.brandDetails?.brandName ||
//             "",
//           rules: masterRule.rules,
//         }));

//       if (
//         documentsToInsert.length === 0
//       ) {
//         return {
//           success: true,
//           message:
//             "All brands already have rules",
//           createdCount: 0,
//         };
//       }

//       const result =
//         await LeadMatchingRulePerBrand.insertMany(
//           documentsToInsert,
//           {
//             ordered: false,
//           }
//         );

//       return {
//         success: true,
//         message:
//           "Lead rules created successfully",
//         createdCount: result.length,
//       };
//     } catch (error) {
//       console.error(
//         "createLeadRulesForAllBrands Error:",
//         error
//       );
//       throw error;
//     }
//   };


