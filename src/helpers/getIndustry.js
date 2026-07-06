// helpers/getIndustry.js

import { IndustryManagement } from "../model/Admin/CMS/industryManagement.model.js";

// ✅ Module-level cache — persists for lifetime of server process
let _industryCache = null;
let _industryCacheTime = 0;
const INDUSTRY_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export const getIndustryCatTags = async (industryName = "") => {
  try {
    const now = Date.now();

    // ✅ Return module-level cache if fresh
    // Industry data rarely changes — safe to cache aggressively
    if (_industryCache && now - _industryCacheTime < INDUSTRY_CACHE_TTL) {
      console.log("⚡ [INDUSTRY CACHE HIT] — skipping DB query");
      return filterIndustries(_industryCache, industryName);
    }

    console.time("⏱️ getIndustryCatTags DB query");

    // ✅ Only fetch fields we actually need — much faster than full document
    const documents = await IndustryManagement.find(
      {},
      {
        "headings.industries.industry": 1,    // industry name
        "headings.industries.categories": 1,  // categories array
        _id: 0,                               // skip _id — not needed
      }
    ).lean(); // lean() = plain JS objects, ~2x faster than Mongoose docs

    console.timeEnd("⏱️ getIndustryCatTags DB query");
    console.log(`📦 Raw documents fetched: ${documents?.length || 0}`);

    if (!documents || documents.length === 0) return [];

    // ✅ Flatten once and cache at module level
    const flatIndustries = flattenIndustries(documents);

    console.log(`✅ Flattened industries: ${flatIndustries.length}`);

    // ✅ Store in module cache
    _industryCache = flatIndustries;
    _industryCacheTime = now;

    return filterIndustries(flatIndustries, industryName);
  } catch (error) {
    console.error("❌ Error fetching industry categories:", error);
    return [];
  }
};

// ─── Helpers ──────────────────────────────────────────────

/**
 * Flatten: documents → headings → industries
 */
const flattenIndustries = (documents) => {
  const flat = [];
  for (const doc of documents) {
    for (const heading of doc?.headings || []) {
      for (const industry of heading?.industries || []) {
        flat.push(industry);
      }
    }
  }
  return flat;
};

/**
 * Filter by industry name (case-insensitive) — or return all
 */
const filterIndustries = (flatIndustries, industryName) => {
  if (!industryName) return flatIndustries;

  const target = industryName.toLowerCase();
  return flatIndustries.filter(
    (ind) => ind?.industry?.toLowerCase() === target
  );
};

/**
 * Call this to manually bust the industry cache
 * (e.g., after admin updates industry data)
 */
export const bustIndustryCache = () => {
  _industryCache = null;
  _industryCacheTime = 0;
  console.log("🗑️ [INDUSTRY CACHE] Busted");
};