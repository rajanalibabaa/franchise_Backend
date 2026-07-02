// // searchSuggestions.js
// import { getBrandsHelperfuntion } from "../../helpers/getbrands.js";
// import { getIndustryCatTags } from "../../helpers/getIndustry.js";
// import {
//   findIndustryCategoriesAndTags,
//   searchBrandAndCompanyNames,
// } from "../../helpers/match.js";
// import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";

// export const searchSuggestions = async (req, res) => {
//   const searchTerm = req.query.searchTerm || req.body.searchTerm;
//   const industry = req.query?.industry || req.body?.industry || "";

//   if (!searchTerm || searchTerm.trim().length < 2) {
//     return res.json(
//       new ApiResponse(
//         404,
//         {},
//         "search term required and must be minimum 2 letters",
//       ),
//     );
//   }

//   const limit = 30;
//   let skip = 0;

//   let companyNamesMatches = [];
//   let brandNamesMatches = [];
//   let industryMatches = [];
//   let tagsMatches = [];
//   let categoriesMatches = [];

//   let count =
//     brandNamesMatches?.length +
//     companyNamesMatches?.length +
//     industryMatches.length +
//     categoriesMatches?.length +
//     tagsMatches?.length;

//   const pushWithLimit = (source, target) => {
//     for (let i = 0; i < source?.length && count < 15; i++) {
//       target.push(source[i]);
//       count++;
//     }
//   };

//   // Only create match if industry is provided
//   const match =
//     industry && industry?.length > 0
//       ? { "franchiseDetails.franchiseDetails.brandCategories.main": industry }
//       : undefined;

//   const data = await getIndustryCatTags(industry);
//   let oneTimeFunction = true;

//   while (count < 15) {
//     if (oneTimeFunction) {
//       const { industryResults, categoryResults, tagsList } =
//         findIndustryCategoriesAndTags(data, searchTerm, count);
//       pushWithLimit(industryResults, industryMatches);
//       pushWithLimit(categoryResults, categoriesMatches);
//       pushWithLimit(tagsList, tagsMatches);
//       oneTimeFunction = false;
//     }

//     const brands = await getBrandsHelperfuntion(
//       match,
//       undefined,
//       limit,
//       skip,
//       true,
//       true,
//     );

//     if (!brands || brands.length === 0) break;

//     const { companyNamesResults, brandNamesResults } =
//       searchBrandAndCompanyNames(brands, searchTerm, count);

//     pushWithLimit(companyNamesResults, companyNamesMatches);
//     pushWithLimit(brandNamesResults, brandNamesMatches);

//     skip += limit;
//   }

//   let result = {
//     brandNamesMatches,
//     companyNamesMatches,
//     industryMatches,
//     tagsMatches,
//     categoriesMatches,
//   };

//   if (
//     result.companyNamesMatches.length === 0 &&
//     result.brandNamesMatches.length === 0 &&
//     result.industryMatches.length === 0 &&
//     result.tagsMatches.length === 0 &&
//     result.categoriesMatches.length === 0
//   ) {
//     return res.json(new ApiResponse(200, [], "suggestions not match"));
//   }

//   return res.json(
//     new ApiResponse(200, result, "Fetch suggestions successfully"),
//   );
// };

// searchSuggestions.js
import { getBrandsHelperfuntion } from "../../helpers/getbrands.js";
import { getIndustryCatTags } from "../../helpers/getIndustry.js";
import {
  findIndustryCategoriesAndTags,
  searchBrandAndCompanyNames,
} from "../../helpers/match.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";

// ✅ In-memory cache
const searchCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedResult = (key) => {
  const cached = searchCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    searchCache.delete(key);
    return null;
  }
  return cached.data;
};

const setCacheResult = (key, data) => {
  if (searchCache.size >= 200) {
    // ✅ evict oldest
    const oldestKey = searchCache.keys().next().value;
    searchCache.delete(oldestKey);
  }
  searchCache.set(key, { data, timestamp: Date.now() });
};

export const searchSuggestions = async (req, res) => {
  const TOTAL_START = Date.now();

  const searchTerm = (
    req.query.searchTerm ||
    req.body.searchTerm ||
    ""
  ).trim();

  const industry = (
    req.query?.industry ||
    req.body?.industry ||
    ""
  ).trim();

  // ✅ Validate
  if (!searchTerm || searchTerm.length < 2) {
    return res.json(
      new ApiResponse(404, {}, "Search term required — minimum 2 letters")
    );
  }

  const cacheKey = `${searchTerm.toLowerCase()}__${industry.toLowerCase()}`;

  // ✅ Return cached result instantly
  const cached = getCachedResult(cacheKey);
  if (cached) {
    console.log(`⚡ [CACHE HIT] "${searchTerm}" → 0ms`);
    return res.json(
      new ApiResponse(200, cached, "Fetch suggestions successfully (cached)")
    );
  }

  console.log(`\n🔍 [SEARCH START] term="${searchTerm}" industry="${industry}"`);

  try {
    // ✅ Build match for brand query
    const match =
      industry.length > 0
        ? {
            "franchiseDetails.franchiseDetails.brandCategories.main": industry,
          }
        : undefined;

    // ✅ Run BOTH DB queries in PARALLEL
    console.time("⏱️ [PARALLEL] Both DB queries");

    const [industryData, brands] = await Promise.all([
      getIndustryCatTags(industry),
      getBrandsHelperfuntion(
        match,
        undefined,
        200, // ✅ Fetch enough at once - NO while loop needed
        0,
        true,
        true
      ),
    ]);

    console.timeEnd("⏱️ [PARALLEL] Both DB queries");
    console.log(`📦 Brands fetched: ${brands?.length || 0}`);
    console.log(`🏭 Industry docs fetched: ${industryData?.length || 0}`);

    // ✅ Process industry/category/tags
    console.time("⏱️ Processing matches");

    const { industryResults, categoryResults, tagsList } =
      findIndustryCategoriesAndTags(industryData, searchTerm, 0);

    // ✅ Process brand/company names
    const { companyNamesResults, brandNamesResults } =
      searchBrandAndCompanyNames(brands || [], searchTerm, 0);

    console.timeEnd("⏱️ Processing matches");

    // ✅ Build final result
    const result = {
      brandNamesMatches: brandNamesResults.slice(0, 10),
      companyNamesMatches: companyNamesResults.slice(0, 5),
      industryMatches: industryResults.slice(0, 5),
      tagsMatches: tagsList.slice(0, 5),
      categoriesMatches: categoryResults.slice(0, 5),
    };

    const totalResults =
      result.brandNamesMatches.length +
      result.companyNamesMatches.length +
      result.industryMatches.length +
      result.tagsMatches.length +
      result.categoriesMatches.length;

    const totalMs = Date.now() - TOTAL_START;

    // ✅ Speed indicator
    const speed =
      totalMs < 100 ? "🟢 FAST" :
      totalMs < 300 ? "🟡 MEDIUM" :
      totalMs < 600 ? "🟠 SLOW" : "🔴 VERY SLOW";

    console.log(
      `✅ [SEARCH DONE] "${searchTerm}" → ` +
      `${totalResults} results in ${totalMs}ms ${speed}`
    );
    console.log("📊 Result breakdown:", {
      brands: result.brandNamesMatches.length,
      companies: result.companyNamesMatches.length,
      industries: result.industryMatches.length,
      tags: result.tagsMatches.length,
      categories: result.categoriesMatches.length,
    });

    // ✅ No results
    if (totalResults === 0) {
      return res.json(
        new ApiResponse(200, [], "No suggestions matched")
      );
    }

    // ✅ Cache result
    setCacheResult(cacheKey, result);

    return res.json(
      new ApiResponse(200, result, "Fetch suggestions successfully")
    );
  } catch (error) {
    const totalMs = Date.now() - TOTAL_START;
    console.error(`❌ [SEARCH ERROR] after ${totalMs}ms:`, error);
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Internal server error"));
  }
};