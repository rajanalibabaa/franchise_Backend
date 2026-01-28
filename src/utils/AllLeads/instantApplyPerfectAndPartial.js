import BrandListing from "../../model/Brand/brandListingPage.js";
import {
  sendInstantApplyPerAndPar,
  sendInstantApplyEmail,
} from "../../utils/Centralized Email/centralizedEmail.js";
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
        ", ",
      )}`,
    );
  }

  const rangeIndex = investmentRanges.findIndex(
    (range) => range.value === investmentRange,
  );
  return investmentRanges.slice(0, rangeIndex + 1).map((range) => range.value);
};

export const instantApplyPerfectAndPartial = async (
  fullName,
  email,
  mobileNumber,
  brandName,
  brandId,
  brandEmail,
  mainCategory,
  subCategory,
  childCategory,
  state,
  district,
  city,
  investmentRange,
  planToInvest,
  readyToInvest,
  applyBy,
  applyById,
  brandLogo,
  batch = 0,
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
          ", ",
        )}`,
      );
    }

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
      apply: {
        applyBy: applyBy || "other",
        applyId: applyById || "other",
      },
      initialBrand: {
        brandId,
        brandName,
        brandEmail,
        brandLogo,
        emailSent: false,
      },
    };

    // Save new investor lead first
    newLead = new InstantApplyLead(investorData);
    await newLead.save();

    const emailedBrandId = new Set();
    // console.log(emailedBrandId);

    // 1. First send the instant apply email to the brand with matchType "instantbrandapply"
    if (brandEmail) {
      try {
        await sendInstantApplyEmail(
          fullName,
          email,
          mobileNumber,
          brandName,
          brandEmail,
          `${mainCategory},${subCategory},${childCategory}`,
          `${state},${district},${city}`,
          investmentRange,
          planToInvest,
          readyToInvest,
        );

        // Update the initial brand email status
        await InstantApplyLead.findByIdAndUpdate(newLead._id, {
          $set: {
            "initialBrand.emailSent": true,
            "initialBrand.emailSentAt": new Date(),
            "emailStatus.initialEmailSent": true,
            "emailStatus.lastEmailSentAt": new Date(),
          },
          $inc: { "matchedBrandsCount.total": 1 },
        });
      } catch (error) {
        console.error("Failed to send initial instant apply email:", error);
        await InstantApplyLead.findByIdAndUpdate(newLead._id, {
          $set: {
            "initialBrand.emailError": error.message,
            "emailStatus.initialEmailError": error.message,
          },
        });
      }
    }

    // Get applicable investment ranges for partial matches
    const applicableRanges = getApplicableInvestmentRanges(investmentRange);

    const results = [];
    const allMatches = [];
    let matchStats = {
      perfect: { found: 0, emailed: 0 },
      categoryInvestment: { found: 0, emailed: 0 },
      categoryLocation: { found: 0, emailed: 0 },
      investmentLocation: { found: 0, emailed: 0 },
    };

    // Prepare category values for querying
    const categoryValues = [];
    if (childCategory) categoryValues.push(childCategory);
    if (subCategory) categoryValues.push(subCategory);
    if (mainCategory) categoryValues.push(mainCategory);

    //   console.log("Category values:", categoryValues);
    //   console.log("Location query:",   state,
    // district,
    // city,);

    // 2. Find PERFECT matches (category, location, and investment range)
    if (childCategory) {
      const perfectMatchQuery = {
        "brandDetails.email": { $ne: null, $ne: brandEmail }, // Exclude the brand that was already contacted
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
      // console.log(`Found ${perfectMatches.length} perfect matches`);

      // Process perfect matches
      for (const brand of perfectMatches) {
        const brandEmail = brand.brandDetails?.email?.toLowerCase()?.trim();
        const brandCompanyName =
          brand.brandDetails?.brandName || "Unknown Company";
        const brandId = brand.uuid;
        // console.log(brandId,"brandId")

        const id = emailedBrandId.has(brandId);
        // console.log(id,"id")

        if (!id) {
          const matchData = {
            email: brandEmail,
            companyName: brandCompanyName,
            brandId: brand._id,
            matchType: "perfect",
            emailSent: false,
            contacted: false,
          };
          // console.log(matchData);
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
              readyToInvest,
            );

            emailedBrandId.add(brandId);

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
            console.error(
              `Failed to email perfect match: ${brandEmail}`,
              error,
            );
            matchData.emailError = error.message;
          }

          allMatches.push(matchData);
        }
      }
      // console.log(`Sent ${matchStats.perfect.emailed} perfect match emails`);
    }

    // 3. Find CATEGORY + INVESTMENT matches (if no perfect match was found)
    if (childCategory) {
      const categoryInvestmentQuery = {
        "brandDetails.email": { $ne: null, $ne: brandEmail },
        "franchiseDetails.fico.investmentRange": { $in: applicableRanges },
        "franchiseDetails.brandCategories.child": childCategory,
      };

      const categoryInvestmentMatches = await BrandListing.find(
        categoryInvestmentQuery,
      ).lean();
      matchStats.categoryInvestment.found = categoryInvestmentMatches.length;
      // console.log(
      //   `Found ${categoryInvestmentMatches.length} category + investment matches`
      // );

      for (const brand of categoryInvestmentMatches) {
        const brandEmail = brand.brandDetails?.email?.toLowerCase()?.trim();
        const brandCompanyName =
          brand.brandDetails?.brandName || "Unknown Company";
        const brandId = brand._id;

        const id = emailedBrandId.has(brandId);

        if (!id) {
          const matchData = {
            email: brandEmail,
            companyName: brandCompanyName,
            brandId: brand._id,
            matchType: "categoryAndInvest",
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
              readyToInvest,
            );

            emailedBrandId.add(brandId);

            matchData.emailSent = true;
            matchData.emailSentAt = new Date();
            matchStats.categoryInvestment.emailed++;

            results.push({
              companyName: brandCompanyName,
              email: brandEmail,
              location: `${city}, ${district}, ${state}`,
              category: childCategory,
              investment: investmentRange,
              matchType: "categoryAndInvest",
              brandId: brand._id,
            });
          } catch (error) {
            console.error(
              `Failed to email category+investment match: ${brandEmail}`,
              error,
            );
            matchData.emailError = error.message;
          }

          allMatches.push(matchData);
        }
      }
      // console.log(
      //   `Sent ${matchStats.categoryInvestment.emailed} category + investment match emails`
      // );
    }

    // 4. Find CATEGORY + LOCATION matches (if no previous matches were found)
    if (childCategory) {
      const categoryLocationQuery = {
        "brandDetails.email": { $ne: null, $ne: brandEmail },
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

      const categoryLocationMatches = await BrandListing.find(
        categoryLocationQuery,
      ).lean();
      matchStats.categoryLocation.found = categoryLocationMatches.length;
      // console.log(
      //   `Found ${categoryLocationMatches.length} category + location matches`
      // );

      for (const brand of categoryLocationMatches) {
        const brandEmail = brand.brandDetails?.email?.toLowerCase()?.trim();
        const brandCompanyName =
          brand.brandDetails?.brandName || "Unknown Company";
        const brandId = brand._id;
        const id = emailedBrandId.has(brandId);

        if (!id) {
          const matchData = {
            email: brandEmail,
            companyName: brandCompanyName,
            brandId: brand._id,
            matchType: "categoryAndLocation",
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
              readyToInvest,
            );

            emailedBrandId.add(brandId);

            matchData.emailSent = true;
            matchData.emailSentAt = new Date();
            matchStats.categoryLocation.emailed++;

            results.push({
              companyName: brandCompanyName,
              email: brandEmail,
              location: `${city}, ${district}, ${state}`,
              category: childCategory,
              investment: investmentRange,
              matchType: "categoryAndLocation",
              brandId: brand._id,
            });
          } catch (error) {
            console.error(
              `Failed to email category+location match: ${brandEmail}`,
              error,
            );
            matchData.emailError = error.message;
          }

          allMatches.push(matchData);
        }
      }
      // console.log(
      //   `Sent ${matchStats.categoryLocation.emailed} category + location match emails`
      // );
    }

    // 5. Find INVESTMENT + LOCATION matches (if no previous matches were found)
    if (investmentRange) {
      const investmentLocationQuery = {
        "brandDetails.email": { $ne: null, $ne: brandEmail },
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
      };

      const investmentLocationMatches = await BrandListing.find(
        investmentLocationQuery,
      ).lean();
      matchStats.investmentLocation.found = investmentLocationMatches.length;
      // console.log(
      //   `Found ${investmentLocationMatches.length} investment + location matches`
      // );

      for (const brand of investmentLocationMatches) {
        const brandEmail = brand.brandDetails?.email?.toLowerCase()?.trim();
        const brandCompanyName =
          brand.brandDetails?.brandName || "Unknown Company";
        const brandCategories = brand.franchiseDetails?.brandCategories || {};
        const brandCategoryStr =
          [brandCategories.main, brandCategories.sub, brandCategories.child]
            .filter(Boolean)
            .join(", ") || "Not specified";
        const brandId = brand.uuid;
        const id = emailedBrandId.has(brandId);

        if (!id) {
          const matchData = {
            email: brandEmail,
            companyName: brandCompanyName,
            brandId: brand._id,
            matchType: "investmentAndLocation",
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
              readyToInvest,
            );

            emailedBrandId.add(brandId);

            matchData.emailSent = true;
            matchData.emailSentAt = new Date();
            matchStats.investmentLocation.emailed++;

            results.push({
              companyName: brandCompanyName,
              email: brandEmail,
              location: `${city}, ${district}, ${state}`,
              category: brandCategoryStr,
              investment: investmentRange,
              matchType: "investmentAndLocation",
              brandId: brand._id,
            });
          } catch (error) {
            console.error(
              `Failed to email investment+location match: ${brandEmail}`,
              error,
            );
            matchData.emailError = error.message;
          }

          allMatches.push(matchData);
        }
      }
      // console.log(
      //   `Sent ${matchStats.investmentLocation.emailed} investment + location match emails`
      // );
    }

    // Calculate match counts
    const perfectMatchesCount = allMatches.filter(
      (m) => m.matchType === "perfect",
    ).length;
    const categoryAndInvestCount = allMatches.filter(
      (m) => m.matchType === "categoryAndInvest",
    ).length;
    const categoryAndLocationCount = allMatches.filter(
      (m) => m.matchType === "categoryAndLocation",
    ).length;
    const investmentAndLocationCount = allMatches.filter(
      (m) => m.matchType === "investmentAndLocation",
    ).length;
    const totalMatchesCount = allMatches.length;

    // Determine if any matches were sent
    const initialEmailSent = newLead.initialBrand?.emailSent || false;
    const anyMatchesSent =
      matchStats.perfect.emailed > 0 ||
      matchStats.categoryInvestment.emailed > 0 ||
      matchStats.categoryLocation.emailed > 0 ||
      matchStats.investmentLocation.emailed > 0;

    // Update lead with match data
    const updateData = {
      $push: { brandMatches: { $each: allMatches } },
      $set: {
        matchedBrandsCount: {
          perfect: perfectMatchesCount,
          categoryAndInvest: categoryAndInvestCount,
          categoryAndLocation: categoryAndLocationCount,
          investmentAndLocation: investmentAndLocationCount,
          total: totalMatchesCount + (initialEmailSent ? 1 : 0),
        },
        status: anyMatchesSent || initialEmailSent ? "matched" : "closed",
        emailStatus: {
          initialEmailSent,
          perfectMatchesSent: matchStats.perfect.emailed > 0,
          categoryAndInvestSent: matchStats.categoryInvestment.emailed > 0,
          categoryAndLocationSent: matchStats.categoryLocation.emailed > 0,
          investmentAndLocationSent: matchStats.investmentLocation.emailed > 0,
          lastEmailSentAt: new Date(),
        },
      },
    };

    await InstantApplyLead.findByIdAndUpdate(newLead._id, updateData);

    return {
      status: 200,
      message: `Matches processed successfully`,
      stats: {
        initialBrandEmailSent: initialEmailSent,
        perfectMatches: perfectMatchesCount,
        categoryAndInvestMatches: categoryAndInvestCount,
        categoryAndLocationMatches: categoryAndLocationCount,
        investmentAndLocationMatches: investmentAndLocationCount,
        totalMatches: totalMatchesCount + (initialEmailSent ? 1 : 0),
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
          "emailStatus.error": error.message,
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
