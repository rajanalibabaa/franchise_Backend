
export const formatBrandResults = (brands, searchTerm) => {
  const brandNamesResults = [];
  if (!Array.isArray(brands) || !searchTerm) return { brandNamesResults };

  const term = searchTerm.toLowerCase().trim();
  const seen = new Set();

  for (const brand of brands) {
    const brandName = brand?.brandDetails?.brandName || "";
    if (!brandName) continue;

    const nameLower = brandName.toLowerCase();
    if (seen.has(nameLower)) continue;

    const id   = brand?.uuid || brand?._id;
    const logo =
      brand?.uploads?.uploads?.brandLogo?.[0] ||
      brand?.uploads?.brandLogo?.[0]           ||
      "";

    // ✅ Score for sorting (DB already filtered matches)
    let score = 0;
    if (nameLower === term)                              score = 100;
    else if (nameLower.startsWith(term))                score = 85;
    else if (startsWithWordBoundary(nameLower, term))   score = 65;
    else if (nameLower.includes(term))                  score = 45;
    else                                                score = 20; // fuzzy (DB found it)

    seen.add(nameLower);
    brandNamesResults.push({
      brandName,
      logo,
      id,
      score,
      matchType: getMatchType(score),
    });
  }

  // ✅ Best match first
  brandNamesResults.sort((a, b) => b.score - a.score);
  return { brandNamesResults };
};


// ─────────────────────────────────────────────────────────
// ✅ Keep original for fallback (used nowhere now but kept)
// ─────────────────────────────────────────────────────────

export const searchBrandNames = (brands, searchTerm) => {
  const brandNamesResults = [];
  if (!Array.isArray(brands) || !searchTerm) return { brandNamesResults };

  const term    = searchTerm.toLowerCase().trim();
  const seen    = new Set();

  for (const brand of brands) {
    if (brandNamesResults.length >= 10) break;

    const brandName = brand?.brandDetails?.brandName || "";
    if (!brandName) continue;

    const nameLower = brandName.toLowerCase();
    if (seen.has(nameLower)) continue;

    const id   = brand?.uuid || brand?._id;
    const logo =
      brand?.uploads?.uploads?.brandLogo?.[0] ||
      brand?.uploads?.brandLogo?.[0]           ||
      "";

    let score = 0;
    if (nameLower === term)                            score = 100;
    else if (nameLower.startsWith(term))               score = 85;
    else if (startsWithWordBoundary(nameLower, term))  score = 65;
    else if (nameLower.includes(term))                 score = 45;
    else if (term.length >= 4 && isFuzzyMatch(nameLower, term)) score = 20;
    else continue;

    seen.add(nameLower);
    brandNamesResults.push({ brandName, logo, id, score, matchType: getMatchType(score) });
  }

  brandNamesResults.sort((a, b) => b.score - a.score);
  return { brandNamesResults };
};


// ─────────────────────────────────────────────────────────
// ✅ CATEGORY SEARCH
// ─────────────────────────────────────────────────────────

export const findCategories = (data, searchTerm) => {
  const categoryResults = [];
  if (!Array.isArray(data) || !searchTerm) return { categoryResults };

  const term = searchTerm.toLowerCase().trim();
  const seen = new Set();

  for (const industry of data) {
    if (categoryResults.length >= 8) break;

    for (const category of industry?.categories || []) {
      if (categoryResults.length >= 8) break;

      const categoryName = category?.category || "";
      if (!categoryName) continue;

      const catLower = categoryName.toLowerCase();
      if (seen.has(catLower)) continue;

      let score = 0;
      if (catLower === term)                             score = 100;
      else if (catLower.startsWith(term))                score = 85;
      else if (startsWithWordBoundary(catLower, term))   score = 65;
      else if (catLower.includes(term))                  score = 45;
      else if (term.length >= 4 && isFuzzyMatch(catLower, term)) score = 20;
      else continue;

      seen.add(catLower);
      categoryResults.push({
        category:  categoryName,
        industry:  industry?.industry || null,
        score,
        matchType: getMatchType(score),
      });
    }
  }

  categoryResults.sort((a, b) => b.score - a.score);
  return { categoryResults };
};


// ─────────────────────────────────────────────────────────
// ✅ INDUSTRY SEARCH
// ─────────────────────────────────────────────────────────

export const findIndustries = (data, searchTerm) => {
  const industryResults = [];
  if (!Array.isArray(data) || !searchTerm) return { industryResults };

  const term = searchTerm.toLowerCase().trim();
  const seen = new Set();

  for (const industry of data) {
    if (industryResults.length >= 5) break;

    const industryName = industry?.industry || "";
    if (!industryName) continue;

    const indLower = industryName.toLowerCase();
    if (seen.has(indLower)) continue;

    let score = 0;
    if (indLower === term)                             score = 100;
    else if (indLower.startsWith(term))                score = 85;
    else if (startsWithWordBoundary(indLower, term))   score = 65;
    else if (indLower.includes(term))                  score = 45;
    else if (term.length >= 4 && isFuzzyMatch(indLower, term)) score = 20;
    else continue;

    seen.add(indLower);
    industryResults.push({
      industry:  industryName,
      score,
      matchType: getMatchType(score),
    });
  }

  industryResults.sort((a, b) => b.score - a.score);
  return { industryResults };
};


// ─────────────────────────────────────────────────────────
// ✅ UTILITIES
// ─────────────────────────────────────────────────────────

const startsWithWordBoundary = (text, term) => {
  const words = text.split(/[\s\-_&/,]+/);
  return words.some((w) => w.startsWith(term));
};

const isFuzzyMatch = (text, term, maxDistance = 2) => {
  if (text.length < term.length - maxDistance) return false;
  for (let i = 0; i <= text.length - term.length + maxDistance; i++) {
    const slice = text.substring(i, i + term.length + 1);
    if (levenshtein(slice, term) <= maxDistance) return true;
  }
  return false;
};

const levenshtein = (a, b) => {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] =
        a[i - 1] === b[j - 1]
          ? prev[j - 1]
          : 1 + Math.min(prev[j - 1], curr[j - 1], prev[j]);
    }
    prev = curr;
  }
  return prev[b.length];
};

const getMatchType = (score) => {
  if (score >= 100) return "exact";
  if (score >= 80)  return "startsWith";
  if (score >= 60)  return "wordBoundary";
  if (score >= 40)  return "contains";
  return "fuzzy";
};