// import { BrandPackages } from "../../model/BrandPackagePlans/brandPackagePlans.js";
// import investorEnquiry from "../../model/Leads/leadsModels.js";

// export const findMatchingBrandsForEnquiry = async (req, res) => {
//   try {
//     const { investorUuid } = req.body;

//     console.log("Received enquiry matching request:", req.body);

//     if (!investorUuid) {
//       return res.status(400).json({
//         success: false,
//         message: "investorUuid is required",
//       });
//     }

//     // ============================================
//     // STEP 1: Get investor enquiry data
//     // ============================================
//     const InvestorEnquiryData = await investorEnquiry.findOne({
//       uuid: investorUuid,
//     });

//     console.log("Investor Enquiry Data:", InvestorEnquiryData);

//     if (!InvestorEnquiryData) {
//       return res.status(404).json({
//         success: false,
//         message: "Investor enquiry not found",
//       });
//     }

//     // ============================================
//     // STEP 2: Extract matching criteria from investor enquiry
//     // ============================================
//     const investmentRange =
//       req.body.investmentRange || InvestorEnquiryData?.investmentRange;
//     const state = req.body.state || InvestorEnquiryData?.state;
//     const district = req.body.district || InvestorEnquiryData?.district;
//     const industry = InvestorEnquiryData?.industry;
//     const category = InvestorEnquiryData?.category;

//     console.log("Matching Criteria:", {
//       investmentRange,
//       state,
//       district,
//       industry,
//       category,
//     });

//     if (!investmentRange || !state || !district) {
//       return res.status(400).json({
//         success: false,
//         message: "investmentRange, state and district are required",
//       });
//     }

//     // ============================================
//     // STEP 3: Find ALL brands matching industry & category
//     // ============================================
//     const query = {};

//     if (industry) query.industry = industry;
//     if (category) query.category = category;

//     console.log("MongoDB Query:", query);

//     const allMatchingBrands = await BrandPackages.find(query);

//     console.log(
//       `Found ${allMatchingBrands.length} brands with matching industry/category`
//     );

//     if (!allMatchingBrands || allMatchingBrands.length === 0) {
//       return res.status(200).json({
//         success: true,
//         investorUuid,
//         matchingCriteria: {
//           industry,
//           category,
//           investmentRange,
//           state,
//           district,
//         },
//         totalMatches: 0,
//         data: [],
//       });
//     }

//     // ============================================
//     // STEP 4: Match brands by investmentRange, state, district
//     // ============================================
//     const matchedBrands = [];

//     for (const brand of allMatchingBrands) {
//       console.log(`\nChecking brand: ${brand.brandName}`);

//       if (!brand?.packages || brand.packages.length === 0) {
//         console.log(`No packages found for brand: ${brand.brandName}`);
//         continue;
//       }

//       for (const pkg of brand.packages) {
//         const investmentPackages = pkg.investmetPackages || [];

//         console.log(
//           `Package Type: ${pkg.packagesType}, Investment Packages Count: ${investmentPackages.length}`
//         );

//         for (const investmentPackage of investmentPackages) {
//           // ============================================
//           // STEP 5: Check if package is active
//           // ============================================
//           if (
//             !investmentPackage.isActive ||
//             investmentPackage.isPaused ||
//             investmentPackage.isExperied
//           ) {
//             console.log(
//               `Skipping package ${investmentPackage.packagesName} - not active or paused/expired`
//             );
//             continue;
//           }

//           console.log(
//             `Checking active package: ${investmentPackage.packagesName}`
//           );

//           let isMatched = false;
//           let matchedRangeDetails = null;

//           // ============================================
//           // STEP 6: Match investmentRange, state, district
//           // ============================================
//           for (const range of investmentPackage.investmentranges || []) {
//             console.log(
//               `Checking range: ${range.selectedPlanInvestmetrange} vs required: ${investmentRange}`
//             );

//             // Check investment range match
//             if (range.selectedPlanInvestmetrange !== investmentRange) {
//               continue;
//             }

//             console.log(`Investment range matched: ${investmentRange}`);

//             // Check state and district match
//             const stateDistrictList =
//               range.selectedPlanStateAndDistrict || [];

//             const locationMatched = stateDistrictList.some((location) => {
//               const locStateMatch =
//                 location.state?.toLowerCase() === state?.toLowerCase();

//               const locDistrict = location.district;

//               let districtMatch = false;

//               if (Array.isArray(locDistrict)) {
//                 districtMatch = locDistrict.some(
//                   (d) =>
//                     d?.toLowerCase() === district?.toLowerCase()
//                 );
//               } else {
//                 districtMatch =
//                   String(locDistrict || "")
//                     .toLowerCase()
//                     .includes(district?.toLowerCase());
//               }

//               console.log(
//                 `State: ${location.state} match: ${locStateMatch}, District match: ${districtMatch}`
//               );

//               return locStateMatch && districtMatch;
//             });

//             if (locationMatched) {
//               isMatched = true;
//               matchedRangeDetails = range;
//               console.log(`Location matched! State: ${state}, District: ${district}`);
//               break;
//             }
//           }

//           // ============================================
//           // STEP 7: Add matched brand to results
//           // ============================================
//           if (isMatched) {
//             console.log(
//               `MATCHED - Brand: ${brand.brandName}, Package: ${investmentPackage.packagesName}`
//             );

//             matchedBrands.push({
//               brandOwnerId: brand.brandOwnerId,
//               brandName: brand.brandName,
//               industry: brand.industry,
//               category: brand.category,
//               packageType: pkg.packagesType,
//               matchedCriteria: {
//                 investmentRange,
//                 state,
//                 district,
//               },
//               packageDetails: {
//                 packageName: investmentPackage.packagesName || null,
//                 packageId: investmentPackage.planUniqueId || null,
//                 totalLeads: investmentPackage.totalLeads ?? null,
//                 remainingLeads: investmentPackage.remainingLeads ?? null,
//                 sendingLeads: investmentPackage.sendingLeads ?? null,
//                 isActive: investmentPackage.isActive,
//                 isPaused: investmentPackage.isPaused,
//                 isExpired: investmentPackage.isExperied,
//                 packageStartDate: investmentPackage.packageStartDate || null,
//                 packageEndDate: investmentPackage.packageEndDate || null,
//                 validity: investmentPackage.validity || null,
//                 investmetRageLabel:
//                   investmentPackage.investmetRageLabel || null,
//                 matchedRange: matchedRangeDetails
//                   ? {
//                       investmentRange:
//                         matchedRangeDetails.selectedPlanInvestmetrange,
//                       stateDistricts:
//                         matchedRangeDetails.selectedPlanStateAndDistrict,
//                     }
//                   : null,
//               },
//             });
//           }
//         }
//       }
//     }

//     console.log(`\nTotal matched brands: ${matchedBrands.length}`);

//     return res.status(200).json({
//       success: true,
//       investorUuid,
//       matchingCriteria: {
//         industry,
//         category,
//         investmentRange,
//         state,
//         district,
//       },
//       totalMatches: matchedBrands.length,
//       data: matchedBrands,
//     });
//   } catch (error) {
//     console.error("Error in findMatchingBrandsForEnquiry:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Error while matching enquiry",
//       error: error.message,
//     });
//   }
// };




import { BrandPackages } from "../../model/BrandPackagePlans/brandPackagePlans.js";
import investorEnquiry from "../../model/Leads/leadsModels.js";


export const findMatchingBrandsForEnquiry = async (req, res) => {
  try {
    const { investorUuid } = req.body;

    if (!investorUuid) {
      return res.status(400).json({
        success: false,
        message: "investorUuid is required",
      });
    }

    /* ==========================================
       STEP 1 : FIND INVESTOR
    ========================================== */

    const enquiry = await investorEnquiry.findOne({
      uuid: investorUuid,
    });

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Investor enquiry not found",
      });
    }

    const investmentRange = req.body.investmentRange || enquiry.investmentRange;
    const state = req.body.state || enquiry.state;
    const district = req.body.district || enquiry.district;
    const industry = enquiry.industry;

    if (!industry || !investmentRange || !state) {
      return res.status(400).json({
        success: false,
        message: "industry, investmentRange and state are required",
      });
    }



    /* ==========================================
       STEP 2 : FIND ALL BRANDS BY INDUSTRY
    ========================================== */

    const brands = await BrandPackages.find({ industry });

    /* ==========================================
       STEP 3 : SEPARATE PACKAGES BY TYPE
    ========================================== */

    const separatedPackages = {
      FREE: [],
      LEAD: [],
      LISTING: [],
    };

    brands.forEach((brand) => {
      (brand.packages || []).forEach((pkg) => {
        const packageType = pkg.packagesType; // "FREE" | "LEAD" | "LISTING"

        (pkg.investmetPackages || []).forEach((plan) => {
          separatedPackages[packageType]?.push({
            ...plan._doc,
            brandOwnerId: brand.brandOwnerId,
            brandName: brand.brandName,
            industry: brand.industry,
            category: brand.category,
          });
        });
      });
    });

    /* ==========================================
       STEP 4 : HELPER - NORMALIZE STRING
    ========================================== */

    const normalize = (str) =>
      String(str || "")
        .trim()
        .toLowerCase();

    /* ==========================================
       STEP 5 : MATCHING FUNCTION
       
       Rules:
       -------
       LEAD / FREE packages:
         - investmentRange must match exactly
         - state must match exactly
         - if package district[] is EMPTY → match ANY district (whole state)
         - if package district[] has values → investor district must be in list

       LISTING packages:
         - if investmentRange is "ALL INVESTMENT RANGE" → skip investment check
         - state must match exactly
         - district rules same as above
    ========================================== */

    const isPackageActive = (pkg) => {
      if (!pkg.isActive) return false;
      if (pkg.isPaused) return false;
      if (pkg.isExperied) return false;
      return true;
    };

    const isInvestmentMatched = (rangeValue, investorRange) => {
      // Special case for LISTING plan "ALL INVESTMENT RANGE"
      if (
        normalize(rangeValue) === normalize("ALL INVESTMENT RANGE")
      ) {
        return true; // matches any investor investment range
      }

      return normalize(rangeValue) === normalize(investorRange);
    };

    const isLocationMatched = (location, investorState, investorDistrict) => {
      // State must match
      const stateMatched =
        normalize(location.state) === normalize(investorState);

      if (!stateMatched) {
        console.log(
          `  State mismatch: package="${location.state}" investor="${investorState}"`
        );
        return false;
      }

      const packageDistricts = location.district || [];

      // If package district list is EMPTY → covers entire state → match
      if (packageDistricts.length === 0) {
        console.log(`  State matched, no district restriction → MATCH`);
        return true;
      }

      // If investor has no district → state level match is enough
      if (!investorDistrict) {
        console.log(
          `  State matched, investor has no district → MATCH`
        );
        return true;
      }

      // Check if investor district is in package district list
      const districtMatched = packageDistricts.some(
        (d) => normalize(d) === normalize(investorDistrict)
      );

      console.log(
        `  District check: investor="${investorDistrict}" packageDistricts=${JSON.stringify(
          packageDistricts
        )} → ${districtMatched ? "MATCH" : "NO MATCH"}`
      );

      return districtMatched;
    };

    const findMatchingPackages = (packages, investorRange, investorState, investorDistrict) => {
      return packages.filter((pkg) => {
        // Check if package is active
        if (!isPackageActive(pkg)) {
          console.log(`Package "${pkg.packagesName}" is inactive/paused/expired → SKIP`);
          return false;
        }

        const ranges = pkg.investmentranges || [];

        // Check if ANY investment range block matches
        const matched = ranges.some((range) => {
          console.log(`\nChecking package: "${pkg.packagesName}"`);
          console.log(
            `  Investment: package="${range.selectedPlanInvestmetrange}" investor="${investorRange}"`
          );

          // Check investment range
          const investmentMatched = isInvestmentMatched(
            range.selectedPlanInvestmetrange,
            investorRange
          );

          if (!investmentMatched) {
            console.log(`  Investment mismatch → SKIP`);
            return false;
          }

          console.log(`  Investment MATCHED`);

          // Check state and district
          const locations = range.selectedPlanStateAndDistrict || [];

          return locations.some((location) =>
            isLocationMatched(location, investorState, investorDistrict)
          );
        });

        return matched;
      });
    };

    /* ==========================================
       STEP 6 : RUN MATCHING
    ========================================== */

    const matchedLeadBrands = findMatchingPackages(
      separatedPackages.LEAD,
      investmentRange,
      state,
      district
    );

    const matchedListingBrands = findMatchingPackages(
      separatedPackages.LISTING,
      investmentRange,
      state,
      district
    );

    const matchedFreeBrands = findMatchingPackages(
      separatedPackages.FREE,
      investmentRange,
      state,
      district
    );

    console.log("\n=== MATCH RESULTS ===");
    console.log("Matched LEAD:", matchedLeadBrands.length);
    console.log("Matched LISTING:", matchedListingBrands.length);
    console.log("Matched FREE:", matchedFreeBrands.length);

    // Remove duplicates across types (by brandOwnerId)
    const seen = new Set();
    const finalMatchedBrands = [
      ...matchedLeadBrands,
      ...matchedListingBrands,
      ...matchedFreeBrands,
    ].filter((brand) => {
      const key = String(brand.brandOwnerId);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log("Final unique brands:", finalMatchedBrands.length);

    /* ==========================================
       STEP 7 : RESPONSE
    ========================================== */

    return res.status(200).json({
      success: true,
      investorUuid,

      matchingCriteria: {
        industry,
        investmentRange,
        state,
        district: district || null,
      },

      summary: {
        LEAD: matchedLeadBrands.length,
        LISTING: matchedListingBrands.length,
        FREE: matchedFreeBrands.length,
        TOTAL: finalMatchedBrands.length,
      },

      data: {
        LEAD: matchedLeadBrands,
        LISTING: matchedListingBrands,
        FREE: matchedFreeBrands,
        // ALL: finalMatchedBrands,
      },
    });
  } catch (error) {
    console.error("Matching Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error while matching enquiry",
      error: error.message,
    });
  }
};