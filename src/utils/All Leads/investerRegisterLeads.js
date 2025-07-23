import InvestorLead from "../../model/NewIncomeInvestor/leadsModel.js";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { sendBrandEmailPerfect } from "../Centralized Email/centralizedEmail.js";

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
  { value: "Rs.5Cr-above", index: 10 }
];

// Helper function to get all investment ranges that are less than or equal to the given range
const getApplicableInvestmentRanges = (investmentRange) => {
  const validRanges = investmentRanges.map(r => r.value);
  if (!validRanges.includes(investmentRange)) {
    throw new Error(`Invalid investment range provided. Valid ranges are: ${validRanges.join(', ')}`);
  }
  
  const rangeIndex = investmentRanges.findIndex(range => range.value === investmentRange);
  return investmentRanges.slice(0, rangeIndex + 1).map(range => range.value);
};

// Helper function to safely get brand categories
const getBrandCategories = (brand) => {
  try {
    if (!brand?.franchiseDetails?.brandCategories) return [];
    return Array.isArray(brand.franchiseDetails.brandCategories) 
      ? brand.franchiseDetails.brandCategories.map(c => c.child).filter(Boolean)
      : [];
  } catch (error) {
    console.error("Error getting brand categories:", error);
    return [];
  }
};

// Helper function to build location query
const buildLocationQuery = (locationType, preferredCountry, preferredState, preferredDistrict, preferredCity) => {
  if (locationType === "domestic") {
    return {
      "expansionLocationData.expansionLocations.domestic.locations": {
        $elemMatch: {
          state: preferredState,
          districts: {
            $elemMatch: {
              district: preferredDistrict,
              cities: preferredCity
            }
          }
        }
      }
    };
  }
  
  const internationalQuery = {
    "expansionLocationData.expansionLocations.international.country": preferredCountry
  };
  
  if (preferredState) internationalQuery["expansionLocationData.expansionLocations.international.states"] = preferredState;
  if (preferredDistrict) internationalQuery["expansionLocationData.expansionLocations.international.district"] = preferredDistrict;
  if (preferredCity) internationalQuery["expansionLocationData.expansionLocations.international.cities"] = preferredCity;
  
  return internationalQuery;
};

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
    // Validate required fields
    if (!email || !firstName || !category || !locationType || !investmentRange) {
      throw new Error("Required fields are missing");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please provide a valid email address");
    }

    // Validate investment range
    const validRanges = investmentRanges.map(r => r.value);
    if (!validRanges.includes(investmentRange)) {
      throw new Error(`Invalid investment range provided. Valid ranges are: ${validRanges.join(', ')}`);
    }

    // Validate category structure
    if (!Array.isArray(category)) {
      throw new Error("Category should be an array");
    }

    // Get applicable investment ranges for partial matches
    const applicableRanges = getApplicableInvestmentRanges(investmentRange);

    // Prepare investor data
    const investorData = {
      investorEmail: email,
      investorName: firstName,
      category,
      location: {
        country: preferredCountry,
        state: preferredState,
        district: preferredDistrict,
        city: preferredCity,
      },
      locationType,
      investmentRange,
      status: 'processing'
    };

    // Save new investor lead
    const newLead = new InvestorLead(investorData);
    await newLead.save();

    const emailedBrands = new Set();
    const results = [];

    
    const perfectMatchesData = [];
    const partialMatchesData = [];

    // Prepare category values for querying
    const categoryValues = category.map(c => c.child).filter(Boolean);

    // Build base location query
    const locationQuery = buildLocationQuery(
      locationType,
      preferredCountry,
      preferredState,
      preferredDistrict,
      preferredCity
    );

    // 1. Find PERFECT matches (category, location, and investment range <= investor's range)
    const perfectMatchQuery = {
      ...locationQuery,
      "brandDetails.email": { $ne: null },
      "franchiseDetails.fico.investmentRange": { $in: applicableRanges }
    };

    // Add category filter only if we have valid categories
    if (categoryValues.length > 0) {
      perfectMatchQuery["franchiseDetails.brandCategories.child"] = { $in: categoryValues };
    }

    const perfectMatches = await BrandListing.find(perfectMatchQuery).lean();

    // Process perfect matches
    for (const brand of perfectMatches) {
      const brandEmail = brand.brandDetails?.email?.toLowerCase()?.trim();
      const brandCompanyName = brand.brandDetails?.brandName || "Unknown Company";
  console.log(`Emailing match: ${brandCompanyName}`);
      if (!brandEmail || emailedBrands.has(brandEmail)) continue;

      try {
        const emailSubject = 'An investor has been found who matches your "InvestmentRange", "Category", and "Location" preferences exactly. Time to connect';
        console.log(`Emailing perfect match: ${brandCompanyName}`);
        await sendBrandEmailPerfect(
          brandEmail,
          brandCompanyName,
          firstName,
          categoryValues.join(", "),
          `${preferredCity}, ${preferredDistrict}, ${preferredState}, ${preferredCountry}`,
          investmentRange,
          emailSubject
        );

        emailedBrands.add(brandEmail);
        
        perfectMatchesData.push({
          email: brandEmail,
          companyName: brandCompanyName,
          brandId: brand._id,
          emailSent: true,
          emailSentAt: new Date()
        });

        results.push({
          companyName: brandCompanyName,
          email: brandEmail,
          location: `${preferredCity}, ${preferredState}, ${preferredCountry}`,
          category: categoryValues.join(", "),
          investment: investmentRange,
          matchType: "perfect",
          brandId: brand._id
        });
      } catch (error) {
        console.error(`Failed to email perfect match: ${brandEmail}`, error);
        perfectMatchesData.push({
          email: brandEmail,
          companyName: brandCompanyName,
          brandId: brand._id,
          emailSent: false,
          emailError: error.message
        });
      }
    }

    // 2. Find PARTIAL matches (location and investment range <= investor's range, but not category)
    const partialMatchQuery = {
      ...locationQuery,
      "brandDetails.email": { $ne: null },
      "franchiseDetails.fico.investmentRange": { $in: applicableRanges },
      "brandDetails.email": { $nin: Array.from(emailedBrands) }
    };

    // Add category exclusion only if we have valid categories
    if (categoryValues.length > 0) {
      partialMatchQuery["franchiseDetails.brandCategories.child"] = { $nin: categoryValues };
    }

    const partialMatches = await BrandListing.find(partialMatchQuery).lean();

    // Process partial matches
    for (const brand of partialMatches) {
      const brandEmail = brand.brandDetails?.email?.toLowerCase()?.trim();
      const brandCompanyName = brand.brandDetails?.brandName || "Unknown Company";
      const brandCategories = getBrandCategories(brand);
      const brandCategoryStr = brandCategories.join(", ") || "Not specified";
      if (!brandEmail || emailedBrands.has(brandEmail)) continue;
      
      try {
        const emailSubject = 'We\'ve found an investor who matches your "InvestmentRange" and "Location" perfectly. The Category is slightly different, but this lead holds strong potential for your brand.';
        console.log("Partial match:", brandCompanyName, brandEmail);
        await sendBrandEmailPerfect(
          brandEmail,
          brandCompanyName,
          firstName,
          categoryValues.join(", "),
          `${preferredCity}, ${preferredDistrict}, ${preferredState}, ${preferredCountry}`,
          investmentRange,
          emailSubject
        );

        emailedBrands.add(brandEmail);
        
        partialMatchesData.push({
          email: brandEmail,
          companyName: brandCompanyName,
          brandId: brand._id,
          emailSent: true,
          emailSentAt: new Date()
        });

        results.push({
          companyName: brandCompanyName,
          email: brandEmail,
          location: `${preferredCity}, ${preferredState}, ${preferredCountry}`,
          category: brandCategoryStr,
          investment: investmentRange,
          matchType: "partial",
          brandId: brand._id
        });
      } catch (error) {
        console.error(`Failed to email partial match: ${brandEmail}`, error);
        partialMatchesData.push({
          email: brandEmail,
          companyName: brandCompanyName,
          brandId: brand._id,
          emailSent: false,
          emailError: error.message
        });
      }
    }

    // Update lead with match data
    const updateData = {
      brandPerfectMatches: perfectMatchesData,
      brandPartialMatches: partialMatchesData,
      matchedBrandsCount: {
        perfect: perfectMatchesData.length,
        partial: partialMatchesData.length,
        total: perfectMatchesData.length + partialMatchesData.length,
      },
      status: 'matched',
      emailStatus: {
        perfectMatchesSent: perfectMatchesData.length > 0,
        partialMatchesSent: partialMatchesData.length > 0,
        lastEmailSentAt: new Date()
      }
    };

    await InvestorLead.findByIdAndUpdate(newLead._id, { $set: updateData });

    // Return results
    if (results.length > 0) {
      return {
        status: 200,
        message: `Matches found (${perfectMatchesData.length} perfect, ${partialMatchesData.length} partial)`,
        data: results,
        stats: {
          total: results.length,
          perfectMatches: perfectMatchesData.length,
          partialMatches: partialMatchesData.length,
        },
      };
    } else {
      return {
        status: 404,
        message: "No matches found for the investor.",
      };
    }
  } catch (error) {
    console.error("Error in newIncomerInvestorController:", error);
    
    // Update lead status to indicate failure if it was created
    if (newLead) {
      await InvestorLead.findByIdAndUpdate(newLead._id, { 
        $set: { 
          status: 'closed',
          emailStatus: {
            perfectMatchesSent: false,
            partialMatchesSent: false,
            error: error.message
          }
        } 
      });
    }

    return {
      status: 500,
      message: "An error occurred while processing the request.",
      error: error.message,
    };
  }
};