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
  let industryMatches = [];
  let serviceTagsMatches = [];
  let productTagsMatches = [];

  let count =
    brandNamesMatches.length +
    companyNamesMatches.length +
    industryMatches.length +
    serviceTagsMatches.length +
    productTagsMatches.length;

 
  const pushWithLimit = (source, target) => {
    for (let i = 0; i < source.length && count < 10; i++) {
      target.push(source[i]);
      count++;
    }
  };

  while (count < 10) {
    const brands = await getBrandsHelperfuntion(
      undefined,
      undefined,
      limit,
      skip,
      true,
      true
    );

    if (!brands || brands.length === 0) break;

    const {
      companyNamesResults,
      brandNamesResults,
      industryResults,
      serviceTagsResults,
      productTagsResults,
    } = searchBrandAndCompanyNames(brands, searchTerm, count);

    pushWithLimit(companyNamesResults, companyNamesMatches);
    pushWithLimit(brandNamesResults, brandNamesMatches);
    pushWithLimit(industryResults, industryMatches);
    pushWithLimit(serviceTagsResults, serviceTagsMatches);
    pushWithLimit(productTagsResults, productTagsMatches);

    skip += limit;
  }

  let result = {
    brandNamesMatches,
    companyNamesMatches,
    industryMatches,
    serviceTagsMatches,
    productTagsMatches,
  };

  if (
    result.companyNamesMatches.length === 0 &&
    result.brandNamesMatches.length === 0 &&
    result.industryMatches.length === 0 &&
    result.serviceTagsMatches.length === 0 &&
    result.productTagsMatches.length === 0
  ) {
    return res.json(new ApiResponse(200, [], "suggestions not match"));
  }

  return res.json(
    new ApiResponse(200, result, "Fetch suggestions successfully")
  );
};
