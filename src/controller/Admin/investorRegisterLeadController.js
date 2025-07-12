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

    // console.log("Search Parameters:", {
    //   email,
    //   firstName,
    //   category,
    //   locationType,
    //   preferredCountry,
    //   preferredState,
    //   preferredDistrict,
    //   preferredCity,
    //   investmentRange
    // });

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