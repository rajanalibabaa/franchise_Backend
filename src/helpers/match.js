export const searchBrandAndCompanyNames = (
  brand,
  searchTerm,
  existsCount = 0
) => {
  const brandNamesResults = [];
  const companyNamesResults = [];
  // const serviceTagsResults = [];
  // const productTagsResults = [];
  // const industryResults = [];
  const categoryResults = [];

  const normalizedSearch = searchTerm.trim().toLowerCase();

  let currentCount = brandNamesResults.length + companyNamesResults.length;
  // + industryResults.length +
  // + serviceTagsResults.length +
  // + productTagsResults.length +
  // + categoryResults.length +
  // + existsCount;

  // let industrySet = new Set();

  if (currentCount >= 15)
    return {
      companyNamesResults,
      brandNamesResults,
      // industryResults,
      // serviceTagsResults,
      // productTagsResults,
      // categoryResults
    };

  for (let i = 0; i < brand.length; i++) {
    if (currentCount >= 15) break;

    const companyName = brand[i]?.brandDetails?.companyName;
    const brandName = brand[i]?.brandDetails?.brandName;
    const id = brand[i]?.uuid;
    // const industry =
    //   brand[i]?.franchiseDetails?.franchiseDetails?.brandCategories;

    const logo = brand[i]?.uploads?.uploads?.brandLogo?.[0];

    if (
      brandName &&
      brandName.toLowerCase().includes(normalizedSearch) &&
      !brandNamesResults.some((b) => b.brandName === brandName)
    ) {
      brandNamesResults.push({ brandName, logo, id });
      currentCount++;
      continue;
    }

    if (
      companyName &&
      companyName.toLowerCase().includes(normalizedSearch) &&
      !companyNamesResults.some((c) => c.companyName === companyName)
    ) {
      companyNamesResults.push({ companyName, logo, id });
      currentCount++;
      continue;
    }

    /*
    // Industry and Category
    if (
      industry?.main &&
      industry.main.toLowerCase().includes(normalizedSearch) &&
      !industrySet.has(industry.main)
    ) {
      industrySet.add(industry.main);
      industryResults.push({ industry: industry.main });
      currentCount++;
    }

    if (
      industry?.sub &&
      industry.sub.toLowerCase().includes(normalizedSearch) &&
      !industrySet.has(industry.sub)
    ) {
      industrySet.add(industry.sub);
      categoryResults.push({ category: industry.sub, logo, id });
      currentCount++;
    }

    // Service Tags
    if (Array.isArray(industry?.serviceTags)) {
      for (const ind of industry.serviceTags) {
        if (currentCount >= 15) break;

        if (Array.isArray(ind?.tags)) {
          for (const tag of ind.tags) {
            if (currentCount >= 15) break;

            if (tag && tag.toLowerCase().includes(normalizedSearch)) {
              serviceTagsResults.push({ tag });
              currentCount++;
              break;
            }
          }
        }
      }
    }

    // Product Tags
    if (Array.isArray(industry?.productTags)) {
      for (const ind of industry.productTags) {
        if (currentCount >= 15) break;

        if (Array.isArray(ind?.tags)) {
          for (const tag of ind.tags) {
            if (currentCount >= 15) break;

            if (tag && tag.toLowerCase().includes(normalizedSearch)) {
              productTagsResults.push({ tag });
              currentCount++;
              break;
            }
          }
        }
      }
    }
    */
  }

  return {
    companyNamesResults,
    brandNamesResults,
    // industryResults,
    // serviceTagsResults,
    // productTagsResults,
    // categoryResults
  };
};

export const findIndustryCategoriesAndTags = (data, searchTerm, count = 0) => {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const industryResults = [];
  const categoryResults = [];
  const tagsList = [];

  for (const d of data) {
    if (d.industry?.toLowerCase().includes(normalizedSearch)) {
      industryResults.push({ industry: d.industry });
      count++;
      if (count >= 15) break;
    }

    for (const c of d.categories || []) {
      if (c.category?.toLowerCase().includes(normalizedSearch)) {
        categoryResults.push({ category: c.category });
        count++;
        if (count >= 15) break;
      }
    }
    if (count >= 15) break;

    
    for (const t of d.productTags || []) {
      for (const tagObj of t.tags || []) {
        const tagText = typeof tagObj === "string" ? tagObj : tagObj?.tag;
        if (tagText?.toLowerCase().includes(normalizedSearch)) {
          tagsList.push({ tag: tagText });
          count++;
          if (count >= 15) break;
        }
      }
      if (count >= 15) break;
    }
    // for (const t of d.serviceTags || []) {
    //   for (const tagObj of t.tags || []) {
    //     const tagText = typeof tagObj === "string" ? tagObj : tagObj?.tag;
    //     if (tagText?.toLowerCase().includes(normalizedSearch)) {
    //       tagsList.push({ tag: tagText });
    //       count++;
    //       if (count >= 15) break;
    //     }
    //   }
    //   if (count >= 15) break;
    // }
    if (count >= 15) break;
  }

  return { industryResults, categoryResults, tagsList, count };
};

