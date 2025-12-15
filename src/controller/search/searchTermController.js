import { getBrandsHelperfuntion } from "../../helpers/getbrands.js";
import { searchBrandAndCompanyNames } from "../../helpers/match.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";

export const searchSuggestions = async (req, res) => {
  const searchTerm = req.query.searchTerm || req.body.searchTerm;

  if (!searchTerm || searchTerm.trim().length < 2) {
    return res.json(
      new ApiResponse(
        404,
        {},
        "search term required and must be minimum 2 letters"
      )
    );
  }

  const limit = 30;
  let skip = 0;
  let companyNamesMatches = [];
  let brandNamesMatches = [];

  
  const count = brandNamesMatches.length + companyNamesMatches.length

  while (count < 10) {
    const brands = await getBrandsHelperfuntion(
      undefined,
      undefined,
      limit,
      skip,
      false,
      true,
    );

    if (!brands || brands.length === 0) break;

    const {companyNamesResults,brandNamesResults} = searchBrandAndCompanyNames(
      brands,
      searchTerm,
      count
    );

    for (let i = 0; i < companyNamesResults?.length && count < 10; i++) {
      companyNamesMatches.push(companyNamesResults[i]);
    }
    for (let i = 0; i < brandNamesResults?.length && count < 10; i++) {
      brandNamesMatches.push(brandNamesResults[i]);
    }

    skip += limit;
  }

 

  let result = {
    brandNamesMatches,
    companyNamesMatches
  }

  if (result.companyNamesMatches.length === 0 && result.brandNamesMatches.length === 0) {
    return res.json(
      new ApiResponse(200, [], "suggestions not match")
    );
  }

  return res.json(
    new ApiResponse(200, result, "Fetch suggestions successfully")
  );
};

