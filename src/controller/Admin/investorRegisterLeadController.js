import InvestorLead from "../../model/NewIncomeInvestor/leadsModel.js";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { sendBrandEmailPerfect } from "../../utils/Centralized Email/centralizedEmail.js";


export const newIncomerInvestorController = async (
  email,
  firstName,
  category,
  locationType,
  preferredCountry,
  preferredState,
  preferredDistrict,
  preferredCity,
  investmentRange
) => {
  try {
    // Validate inputs
    if (!category || !Array.isArray(category) || category.length === 0) {
      throw new Error("At least one category is required");
    }
    if (!locationType || !['domestic', 'international'].includes(locationType)) {
      throw new Error("Location type must be either 'domestic' or 'international'");
    }


    // Base category condition
    const categoryCondition = {
      "franchiseDetails.brandCategories.main": category[0].main,
      "franchiseDetails.brandCategories.sub": category[0].sub,
      "franchiseDetails.brandCategories.child": category[0].child
    };

    // Investment range condition (if provided)
    const investmentCondition = investmentRange ? {
      "franchiseDetails.fico.investmentRange": investmentRange
    } : {};

    // Location condition
    const locationCondition = locationType === 'international' ? 
      {
        $or: [
          { 
            "expansionLocationData.currentOutletLocations.international.country": {
              $elemMatch: {
                states: preferredState,
                "district.district": preferredDistrict,
                "district.cities": preferredCity
              }
            }
          },
          {
            "expansionLocationData.expansionLocations.international.country": {
              $elemMatch: {
                states: preferredState,
                "district.district": preferredDistrict,
                "district.cities": preferredCity
              }
            }
          }
        ]
      } : {
        $or: [
          { 
            "expansionLocationData.currentOutletLocations.domestic.locations": {
              $elemMatch: {
                state: preferredState,
                "districts.district": preferredDistrict,
                "districts.cities": preferredCity
              }
            }
          },
          {
            "expansionLocationData.expansionLocations.domestic.locations": {
              $elemMatch: {
                state: preferredState,
                "districts.district": preferredDistrict,
                "districts.cities": preferredCity
              }
            }
          }
        ]
      };

    // Projection fields
    const projection = {
      "franchiseDetails": 1,
      "expansionLocationData": 1,
      "brandDetails": 1
    };

    // 1. Perfect matches (all conditions)
    const perfectMatches = await BrandListing.find({
      $and: [
        categoryCondition,
        investmentCondition,
        locationCondition
      ]
    }, projection).lean();

    // 2. Investment + Location matches
    const investmentLocationMatches = await BrandListing.find({
      $and: [
        investmentCondition,
        locationCondition
      ]
    }, projection).lean();

    // 3. Category + Investment matches
    const categoryInvestmentMatches = await BrandListing.find({
      $and: [
        categoryCondition,
        investmentCondition
      ]
    }, projection).lean();

    console.log(`Found:
      - ${perfectMatches.length} perfect matches
      - ${investmentLocationMatches.length} investment+location matches
      - ${categoryInvestmentMatches.length} category+investment matches`);

      await perfectMatches.map(data => {
        // console.log("brandDetails :",data.brandDetails.email)
        sendBrandEmailPerfect(
          data.brandDetails.email,
          data.brandDetails.companyName,
          firstName,
          categoryCondition,
          preferredDistrict,
          investmentRange,
          
        )
      })

    return {
      success: true,
      matches: {
        perfectMatches,
        investmentLocationMatches,
        categoryInvestmentMatches
      }
    };
  } catch (error) {
    console.error("Error in investor search:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to search for brands"
    };
  }
};







import BrandListing from "../../model/Brand/brandListingPage.js";
import { sendInstantApplyPerAndPar } from "../../utils/Centralized Email/centralizedEmail.js";
import InstantApplyLead from "../../model/NewIncomeInvestor/instantApplyPerfectAndPartial.js";

// Define the investment ranges in order for comparison
const investmentRanges = [
  { value: "Below-50,000", index: 0 },
  { value: "Rs.50,000-2L", index: 1 },
  { value: "Rs.2L-5L", index: 2 },
  { value: "Rs.5L-10L", index: 3 },
  { value: "Rs.10L-20L", index: 4 },
  { value: "Rs.20L-30L", index: 5 },
  { value: "Rs.30L-50L", index: 6 },
  { value: "Rs.50L-1Cr", index: 7 },
  { value: "Rs.1Cr-2Cr", index: 8 },
  { value: "Rs.2Cr-5Cr", index: 9 },
  { value: "Rs.5Cr-above", index: 10 },
];

// Helper function to get all investment ranges that are less than or equal to the given range
const getApplicableInvestmentRanges = (investmentRange) => {
  const validRanges = investmentRanges.map((r) => r.value);
  if (!validRanges.includes(investmentRange)) {
    throw new Error(
      `Invalid investment range provided. Valid ranges are: ${validRanges.join(
        ", "
      )}`
    );
  }

  const rangeIndex = investmentRanges.findIndex(
    (range) => range.value === investmentRange
  );
  return investmentRanges.slice(0, rangeIndex + 1).map((range) => range.value);
};

export const instantApplyPerfectAndPartial = async (
  fullName,
  email,
  mobileNumber,
  mainCategory,
  subCategory,
  childCategory,
  state,
  district,
  city,
  investmentRange,
  planToInvest,
  readyToInvest
) => {
  let newLead;
  try {
    // Validate required fields
    if (
      !fullName ||
      !email ||
      !mobileNumber ||
      !state ||
      !district ||
      !city ||
      !investmentRange
    ) {
      throw new Error("Required fields are missing");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please provide a valid email address");
    }

    // Validate mobile number
    if (mobileNumber.length < 10) {
      throw new Error("Please provide a valid mobile number");
    }

    // Validate investment range
    const validRanges = investmentRanges.map((r) => r.value);
    if (!validRanges.includes(investmentRange)) {
      throw new Error(
        `Invalid investment range provided. Valid ranges are: ${validRanges.join(
          ", "
        )}`
      );
    }

    // Get applicable investment ranges for partial matches
    const applicableRanges = getApplicableInvestmentRanges(investmentRange);

    // Prepare categories array
    const categories = [];
    if (mainCategory || subCategory || childCategory) {
      categories.push({
        main: mainCategory || null,
        sub: subCategory || null,
        child: childCategory || null,
      });
    }

    // Prepare investor data
    const investorData = {
      investorEmail: email,
      investorName: fullName,
      investorPhone: mobileNumber,
      category: categories,
      location: {
        state,
        district,
        city,
      },
      investmentRange,
      planToInvest: planToInvest || null,
      readyToInvest: readyToInvest || null,
      source: "instantApply",
      status: "processing",
    };

    // Save new investor lead
    newLead = new InstantApplyLead(investorData);
    await newLead.save();

    const emailedBrands = new Set();
    const results = [];
    const allMatches = [];
    let matchStats = {
      perfect: { found: 0, emailed: 0 },
      categoryInvestment: { found: 0, emailed: 0 },
      categoryLocation: { found: 0, emailed: 0 },
      investmentLocation: { found: 0, emailed: 0 }
    };

    // Prepare category values for querying
    const categoryValues = [];
    if (childCategory) categoryValues.push(childCategory);
    if (subCategory) categoryValues.push(subCategory);
    if (mainCategory) categoryValues.push(mainCategory);

    // 1. Find PERFECT matches (category, location, and investment range)
    if (childCategory) {
      const perfectMatchQuery = {
        "brandDetails.email": { $ne: null },
        "franchiseDetails.fico.investmentRange": { $in: applicableRanges },
        "franchiseDetails.brandCategories.child": childCategory,
        "expansionLocationData.expansionLocations.domestic.locations": {
          $elemMatch: {
            state: state,
            districts: {
              $elemMatch: {
                district: district,
                cities: city,
              },
            },
          },
        },
      };

      const perfectMatches = await BrandListing.find(perfectMatchQuery).lean();
      matchStats.perfect.found = perfectMatches.length;
      console.log(`Found ${perfectMatches.length} perfect matches`);

      // Process perfect matches
      for (const brand of perfectMatches) {
        const brandEmail = brand.brandDetails?.email?.toLowerCase()?.trim();
        const brandCompanyName =
          brand.brandDetails?.brandName || "Unknown Company";

        if (!brandEmail || emailedBrands.has(brandEmail)) {
          continue;
        }

        const matchData = {
          email: brandEmail,
          companyName: brandCompanyName,
          brandId: brand._id,
          matchType: "perfect",
          matchCriteria: ["category", "location", "investment"],
          emailSent: false,
          contacted: false,
        };

        try {
          const emailSubject =
            "Perfect Match: Investor matches your Category, Location, and Investment Range";

          await sendInstantApplyPerAndPar(
            fullName,
            email,
            mobileNumber,
            brandEmail,
            brandCompanyName,
            `${mainCategory}, ${subCategory}, ${childCategory}`,
            `${city}, ${district}, ${state}`,
            investmentRange,
            emailSubject,
            planToInvest,
            readyToInvest
          );

          emailedBrands.add(brandEmail);
          matchData.emailSent = true;
          matchData.emailSentAt = new Date();
          matchStats.perfect.emailed++;

          results.push({
            companyName: brandCompanyName,
            email: brandEmail,
            location: `${city}, ${district}, ${state}`,
            category: childCategory,
            investment: investmentRange,
            matchType: "perfect",
            brandId: brand._id,
          });
        } catch (error) {
          console.error(`Failed to email perfect match: ${brandEmail}`, error);
          matchData.emailError = error.message;
        }

        allMatches.push(matchData);
      }
      console.log(`Sent ${matchStats.perfect.emailed} perfect match emails`);
    }

    // 2. Find CATEGORY + INVESTMENT matches (if no perfect match was found)
    if (childCategory && matchStats.perfect.emailed === 0) {
      const categoryInvestmentQuery = {
        "brandDetails.email": { $ne: null },
        "franchiseDetails.fico.investmentRange": { $in: applicableRanges },
        "franchiseDetails.brandCategories.child": childCategory,
        "brandDetails.email": { $nin: Array.from(emailedBrands) },
      };
      const categoryInvestmentMatches = await BrandListing.find(
        categoryInvestmentQuery
      ).lean();
      matchStats.categoryInvestment.found = categoryInvestmentMatches.length;
      console.log(`Found ${categoryInvestmentMatches.length} category + investment matches`);

      for (const brand of categoryInvestmentMatches) {
        const brandEmail = brand.brandDetails?.email?.toLowerCase()?.trim();
        const brandCompanyName =
          brand.brandDetails?.brandName || "Unknown Company";
           
        if (!brandEmail || emailedBrands.has(brandEmail)) {
          continue;
        }

        const matchData = {
          email: brandEmail,
          companyName: brandCompanyName,
          brandId: brand._id,
          matchType: "partial",
          matchCriteria: ["category", "investment"],
          emailSent: false,
          contacted: false,
        };

        try {
          const emailSubject =
            "Great Match: Investor matches your Category and Investment Range";

          await sendInstantApplyPerAndPar(
            fullName,
            email,
            mobileNumber,
            brandEmail,
            brandCompanyName,
            `${mainCategory}, ${subCategory}, ${childCategory}`,
            `${city}, ${district}, ${state}`,
            investmentRange,
            emailSubject,
            planToInvest,
            readyToInvest
          );

          emailedBrands.add(brandEmail);
          matchData.emailSent = true;
          matchData.emailSentAt = new Date();
          matchStats.categoryInvestment.emailed++;

          results.push({
            companyName: brandCompanyName,
            email: brandEmail,
            location: `${city}, ${district}, ${state}`,
            category: childCategory,
            investment: investmentRange,
            matchType: "partial",
            brandId: brand._id,
          });
        } catch (error) {
          console.error(
            `Failed to email category+investment match: ${brandEmail}`,
            error
          );
          matchData.emailError = error.message;
        }

        allMatches.push(matchData);
      }
      console.log(`Sent ${matchStats.categoryInvestment.emailed} category + investment match emails`);
    }

    // 3. Find CATEGORY + LOCATION matches (if no previous matches were found)
    if (childCategory && emailedBrands.size === 0) {
      const categoryLocationQuery = {
        "brandDetails.email": { $ne: null },
        "franchiseDetails.brandCategories.child": childCategory,
        "expansionLocationData.expansionLocations.domestic.locations": {
          $elemMatch: {
            state: state,
            districts: {
              $elemMatch: {
                district: district,
                cities: city,
              },
            },
          },
        },
        "brandDetails.email": { $nin: Array.from(emailedBrands) },
      };

      const categoryLocationMatches = await BrandListing.find(
        categoryLocationQuery
      ).lean();
      matchStats.categoryLocation.found = categoryLocationMatches.length;
      console.log(`Found ${categoryLocationMatches.length} category + location matches`);

      for (const brand of categoryLocationMatches) {
        const brandEmail = brand.brandDetails?.email?.toLowerCase()?.trim();
        const brandCompanyName =
          brand.brandDetails?.brandName || "Unknown Company";
        
        if (!brandEmail || emailedBrands.has(brandEmail)) {
          continue;
        }

        const matchData = {
          email: brandEmail,
          companyName: brandCompanyName,
          brandId: brand._id,
          matchType: "partial",
          matchCriteria: ["category", "location"],
          emailSent: false,
          contacted: false,
        };

        try {
          const emailSubject =
            "Good Match: Investor matches your Category and Location";

          await sendInstantApplyPerAndPar(
            fullName,
            email,
            mobileNumber,
            brandEmail,
            brandCompanyName,
            `${mainCategory}, ${subCategory}, ${childCategory}`,
            `${city}, ${district}, ${state}`,
            investmentRange,
            emailSubject,
            planToInvest,
            readyToInvest
          );

          emailedBrands.add(brandEmail);
          matchData.emailSent = true;
          matchData.emailSentAt = new Date();
          matchStats.categoryLocation.emailed++;

          results.push({
            companyName: brandCompanyName,
            email: brandEmail,
            location: `${city}, ${district}, ${state}`,
            category: childCategory,
            investment: investmentRange,
            matchType: "partial",
            brandId: brand._id,
          });
        } catch (error) {
          console.error(
            `Failed to email category+location match: ${brandEmail}`,
            error
          );
          matchData.emailError = error.message;
        }

        allMatches.push(matchData);
      }
      console.log(`Sent ${matchStats.categoryLocation.emailed} category + location match emails`);
    }

    // 4. Find INVESTMENT + LOCATION matches (if no previous matches were found)
    if (emailedBrands.size === 0) {
      const investmentLocationQuery = {
        "brandDetails.email": { $ne: null },
        "franchiseDetails.fico.investmentRange": { $in: applicableRanges },
        "expansionLocationData.expansionLocations.domestic.locations": {
          $elemMatch: {
            state: state,
            districts: {
              $elemMatch: {
                district: district,
                cities: city,
              },
            },
          },
        },
        "brandDetails.email": { $nin: Array.from(emailedBrands) },
      };

      const investmentLocationMatches = await BrandListing.find(
        investmentLocationQuery
      ).lean();
      matchStats.investmentLocation.found = investmentLocationMatches.length;
      console.log(`Found ${investmentLocationMatches.length} investment + location matches`);

      for (const brand of investmentLocationMatches) {
        const brandEmail = brand.brandDetails?.email?.toLowerCase()?.trim();
        const brandCompanyName =
          brand.brandDetails?.brandName || "Unknown Company";
        const brandCategories = brand.franchiseDetails?.brandCategories || {};
        const brandCategoryStr =
          [brandCategories.main, brandCategories.sub, brandCategories.child]
            .filter(Boolean)
            .join(", ") || "Not specified";

        if (!brandEmail || emailedBrands.has(brandEmail)) {
          continue;
        }

        const matchData = {
          email: brandEmail,
          companyName: brandCompanyName,
          brandId: brand._id,
          matchType: "partial",
          matchCriteria: ["investment", "location"],
          emailSent: false,
          contacted: false,
        };

        try {
          const emailSubject =
            "Potential Match: Investor matches your Location and Investment Range";

          await sendInstantApplyPerAndPar(
            fullName,
            email,
            mobileNumber,
            brandEmail,
            brandCompanyName,
            `${mainCategory}, ${subCategory}, ${childCategory}`,
            `${city}, ${district}, ${state}`,
            investmentRange,
            emailSubject,
            planToInvest,
            readyToInvest
          );

          emailedBrands.add(brandEmail);
          matchData.emailSent = true;
          matchData.emailSentAt = new Date();
          matchStats.investmentLocation.emailed++;

          results.push({
            companyName: brandCompanyName,
            email: brandEmail,
            location: `${city}, ${district}, ${state}`,
            category: brandCategoryStr,
            investment: investmentRange,
            matchType: "partial",
            brandId: brand._id,
          });
        } catch (error) {
          console.error(
            `Failed to email investment+location match: ${brandEmail}`,
            error
          );
          matchData.emailError = error.message;
        }

        allMatches.push(matchData);
      }
      console.log(`Sent ${matchStats.investmentLocation.emailed} investment + location match emails`);
    }

    // Calculate match counts
    const perfectMatchesCount = allMatches.filter(
      (m) => m.matchType === "perfect"
    ).length;
    const partialMatchesCount = allMatches.filter(
      (m) => m.matchType === "partial"
    ).length;

    // Log final statistics
    console.log('Final Matching Statistics:', {
      totalBrandsFound: matchStats.perfect.found + matchStats.categoryInvestment.found + 
                         matchStats.categoryLocation.found + matchStats.investmentLocation.found,
      totalEmailsSent: matchStats.perfect.emailed + matchStats.categoryInvestment.emailed + 
                       matchStats.categoryLocation.emailed + matchStats.investmentLocation.emailed,
      perfectMatches: matchStats.perfect,
      categoryInvestmentMatches: matchStats.categoryInvestment,
      categoryLocationMatches: matchStats.categoryLocation,
      investmentLocationMatches: matchStats.investmentLocation
    });

    // Update lead with match data
    const updateData = {
      brandMatches: allMatches,
      matchedBrandsCount: {
        perfect: perfectMatchesCount,
        partial: partialMatchesCount,
        total: allMatches.length,
      },
      status: allMatches.length > 0 ? "matched" : "closed",
      emailStatus: {
        perfectMatchesSent: perfectMatchesCount > 0,
        partialMatchesSent: partialMatchesCount > 0,
        lastEmailSentAt: new Date(),
      },
    };

    await InstantApplyLead.findByIdAndUpdate(newLead._id, { $set: updateData });

    return {
      status: 200,
      message: `Matches found (${perfectMatchesCount} perfect, ${partialMatchesCount} partial)`,
      stats: {
        total: allMatches.length,
        perfectMatches: perfectMatchesCount,
        partialMatches: partialMatchesCount,
        detailedStats: matchStats
      },
      data: results,
    };
  } catch (error) {
    console.error("Error in instantApplyPerfectAndPartial:", error);

    // Update lead status to indicate failure if it was created
    if (newLead) {
      await InstantApplyLead.findByIdAndUpdate(newLead._id, {
        $set: {
          status: "failed",
          emailStatus: {
            perfectMatchesSent: false,
            partialMatchesSent: false,
            error: error.message,
          },
        },
      });
    }

    return {
      status: 500,
      message: "An error occurred while processing the request.",
      error: error.message,
    };
  }
};