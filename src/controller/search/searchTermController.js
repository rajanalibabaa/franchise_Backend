import { searchBrandsByName } from "../../helpers/getbrands.js";
import { getIndustryCatTags } from "../../helpers/getIndustry.js";
import {
  formatBrandResults,
  findCategories,
  findIndustries,
} from "../../helpers/match.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";

// ─────────────────────────────────────────────────────────
// ✅ LRU CACHE
// ─────────────────────────────────────────────────────────

const searchCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;
const CACHE_MAX = 300;

const getCached = (key) => {
  const entry = searchCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    searchCache.delete(key);
    return null;
  }
  searchCache.delete(key);
  searchCache.set(key, entry);
  return entry.data;
};

const setCache = (key, data) => {
  if (searchCache.size >= CACHE_MAX) {
    searchCache.delete(searchCache.keys().next().value);
  }
  searchCache.set(key, { data, timestamp: Date.now() });
};

// ─────────────────────────────────────────────────────────
// ✅ SAFE INPUT EXTRACTOR
// ─────────────────────────────────────────────────────────

const safeGet = (obj, key) => {
  try {
    if (!obj || typeof obj !== "object") return "";
    const val = obj[key];
    if (val === undefined || val === null) return "";
    return String(val)
      .trim()
      .replace(/[<>{}[\]\\]/g, "")
      .substring(0, 100);
  } catch {
    return "";
  }
};

// ─────────────────────────────────────────────────────────
// ✅ MAIN CONTROLLER
// ─────────────────────────────────────────────────────────

export const searchSuggestions = async (req, res) => {
  const START = Date.now();

  // ── Extract inputs ─────────────────────────────────────
  const searchTerm =
    safeGet(req.query, "searchTerm") || safeGet(req.body, "searchTerm") || "";

  const industry =
    safeGet(req.query, "industry") || safeGet(req.body, "industry") || "";

  console.log(`🔍 term="${searchTerm}" industry="${industry}"`); 

  // ── Validate ───────────────────────────────────────────
  if (!searchTerm || searchTerm.length < 2) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, {}, "Search term required — minimum 2 characters"),
      );
  }

  // ── Cache check ────────────────────────────────────────
  const cacheKey = `${searchTerm.toLowerCase()}__${industry.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`⚡ [CACHE HIT] "${searchTerm}" → ${Date.now() - START}ms`);
    return res.json(new ApiResponse(200, cached, "Suggestions (cached)"));
  }

  try {
    const t1 = Date.now();

    // ── Parallel: DB brand search + industry fetch ─────────
    const [matchedBrands, industryData] = await Promise.all([
      // ✅ Searches ALL brands in MongoDB — no 200 limit problem
      searchBrandsByName(searchTerm, industry, 10).catch((e) => {
        console.warn("⚠️ searchBrandsByName failed:", e.message);
        return [];
      }),

      // ✅ Industry has module-level cache — often 0ms
      getIndustryCatTags(industry).catch((e) => {
        console.warn("⚠️ getIndustryCatTags failed:", e.message);
        return [];
      }),
    ]);

    console.log(
      `📦 DB: ${Date.now() - t1}ms | ` +
        `brands=${matchedBrands.length} | industries=${industryData.length}`,
    );

    // ── Format + score results ─────────────────────────────
    const t2 = Date.now();

    const { brandNamesResults } = formatBrandResults(matchedBrands, searchTerm);
    const { categoryResults } = findCategories(industryData, searchTerm);
    const { industryResults } = findIndustries(industryData, searchTerm);

    console.log(`⚙️  Matching: ${Date.now() - t2}ms`);

    // ── Build result ───────────────────────────────────────
    const result = {
      brandNamesMatches: brandNamesResults, // max 10 — from ALL brands in DB
      categoriesMatches: categoryResults, // max 8
      industryMatches: industryResults, // max 5
    };

    const totalResults =
      brandNamesResults.length +
      categoryResults.length +
      industryResults.length;

    const totalMs = Date.now() - START;
    const speed =
      totalMs < 100
        ? "🟢 FAST"
        : totalMs < 300
          ? "🟡 MEDIUM"
          : totalMs < 600
            ? "🟠 SLOW"
            : "🔴 VERY SLOW";

    console.log(
      `✅ "${searchTerm}" → ${totalResults} results | ${totalMs}ms ${speed}`,
      {
        brands: brandNamesResults.length,
        categories: categoryResults.length,
        industries: industryResults.length,
      },
    );

    // ── No results ─────────────────────────────────────────
    if (totalResults === 0) {
      return res.json(
        new ApiResponse(
          200,
          {
            brandNamesMatches: [],
            categoriesMatches: [],
            industryMatches: [],
          },
          "No suggestions found",
        ),
      );
    }

    // ── Cache + respond ────────────────────────────────────
    setCache(cacheKey, result);
    return res.json(
      new ApiResponse(200, result, "Suggestions fetched successfully"),
    );
  } catch (error) {
    console.error(`❌ [ERROR] ${Date.now() - START}ms`, error);
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Internal server error"));
  }
};

// ─────────────────────────────────────────────────────────
// ✅ ADMIN UTILS
// ─────────────────────────────────────────────────────────

export const clearSearchCache = (_req, res) => {
  const count = searchCache.size;
  searchCache.clear();
  return res.json(new ApiResponse(200, { cleared: count }, "Cache cleared"));
};

export const getSearchCacheStats = (_req, res) => {
  return res.json(
    new ApiResponse(
      200,
      {
        cacheSize: searchCache.size,
        maxSize: CACHE_MAX,
        ttlMinutes: CACHE_TTL / 60000,
      },
      "Cache stats",
    ),
  );
};
