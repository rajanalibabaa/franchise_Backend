// searchSuggestions.js
import { getBrandsHelperfuntion } from "../../helpers/getbrands.js";
import { getIndustryCatTags } from "../../helpers/getIndustry.js";
import {
  findIndustryCategoriesAndTags,
  searchBrandAndCompanyNames,
} from "../../helpers/match.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";

export const searchSuggestions = async (req, res) => {
  const searchTerm = req.query.searchTerm || req.body.searchTerm;
  const industry = req.query?.industry || req.body?.industry || "";

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
  let tagsMatches = [];
  let categoriesMatches = [];

  let count =
    brandNamesMatches?.length +
    companyNamesMatches?.length +
    industryMatches.length +
    categoriesMatches?.length +
    tagsMatches?.length;

  const pushWithLimit = (source, target) => {
    for (let i = 0; i < source?.length && count < 15; i++) {
      target.push(source[i]);
      count++;
    }
  };

  // Only create match if industry is provided
  const match =
    industry && industry?.length > 0
      ? { "franchiseDetails.franchiseDetails.brandCategories.main": industry }
      : undefined;

  const data = await getIndustryCatTags(industry); 
  let oneTimeFunction = true

  while (count < 15) {
    if (oneTimeFunction) {
      const { industryResults,categoryResults,tagsList } = findIndustryCategoriesAndTags(data, searchTerm, count);
     pushWithLimit(industryResults, industryMatches);
   pushWithLimit(categoryResults, categoriesMatches);
    pushWithLimit(tagsList, tagsMatches);
    oneTimeFunction = false
    }

   
    const brands = await getBrandsHelperfuntion(
      match,
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
      
      
    } = searchBrandAndCompanyNames(brands, searchTerm, count);

    pushWithLimit(companyNamesResults, companyNamesMatches);
    pushWithLimit(brandNamesResults, brandNamesMatches);
 

    skip += limit;
  }

  let result = {
    brandNamesMatches,
    companyNamesMatches,
    industryMatches,
    tagsMatches,
    categoriesMatches,
  };

  if (
    result.companyNamesMatches.length === 0 &&
    result.brandNamesMatches.length === 0 &&
    result.industryMatches.length === 0 &&
    result.tagsMatches.length === 0 &&
    result.categoriesMatches.length === 0
  ) {
    return res.json(new ApiResponse(200, [], "suggestions not match"));
  }

  return res.json(
    new ApiResponse(200, result, "Fetch suggestions successfully")
  );
};
