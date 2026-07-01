// export const searchBrandAndCompanyNames = (
//   brand,
//   searchTerm,
//   existsCount = 0,
// ) => {
//   const brandNamesResults = [];
//   const companyNamesResults = [];
//   // const serviceTagsResults = [];
//   // const productTagsResults = [];
//   // const industryResults = [];
//   const categoryResults = [];

//   const normalizedSearch = searchTerm.trim().toLowerCase();

//   let currentCount = brandNamesResults.length + companyNamesResults.length;
//   // + industryResults.length +
//   // + serviceTagsResults.length +
//   // + productTagsResults.length +
//   // + categoryResults.length +
//   // + existsCount;

//   // let industrySet = new Set();

//   if (currentCount >= 15)
//     return {
//       companyNamesResults,
//       brandNamesResults,
//       // industryResults,
//       // serviceTagsResults,
//       // productTagsResults,
//       // categoryResults
//     };

//   for (let i = 0; i < brand.length; i++) {
//     if (currentCount >= 15) break;

//     const companyName = brand[i]?.brandDetails?.companyName;
//     const brandName = brand[i]?.brandDetails?.brandName;
//     const id = brand[i]?.uuid;
//     // const industry =
//     //   brand[i]?.franchiseDetails?.franchiseDetails?.brandCategories;

//     const logo = brand[i]?.uploads?.uploads?.brandLogo?.[0];

//     if (
//       brandName &&
//       brandName.toLowerCase().includes(normalizedSearch) &&
//       !brandNamesResults.some((b) => b.brandName === brandName)
//     ) {
//       brandNamesResults.push({ brandName, logo, id });
//       currentCount++;
//       continue;
//     }

//     if (
//       companyName &&
//       companyName.toLowerCase().includes(normalizedSearch) &&
//       !companyNamesResults.some((c) => c.companyName === companyName)
//     ) {
//       companyNamesResults.push({ companyName, logo, id });
//       currentCount++;
//       continue;
//     }

//     /*
//     // Industry and Category
//     if (
//       industry?.main &&
//       industry.main.toLowerCase().includes(normalizedSearch) &&
//       !industrySet.has(industry.main)
//     ) {
//       industrySet.add(industry.main);
//       industryResults.push({ industry: industry.main });
//       currentCount++;
//     }

//     if (
//       industry?.sub &&
//       industry.sub.toLowerCase().includes(normalizedSearch) &&
//       !industrySet.has(industry.sub)
//     ) {
//       industrySet.add(industry.sub);
//       categoryResults.push({ category: industry.sub, logo, id });
//       currentCount++;
//     }

//     // Service Tags
//     if (Array.isArray(industry?.serviceTags)) {
//       for (const ind of industry.serviceTags) {
//         if (currentCount >= 15) break;

//         if (Array.isArray(ind?.tags)) {
//           for (const tag of ind.tags) {
//             if (currentCount >= 15) break;

//             if (tag && tag.toLowerCase().includes(normalizedSearch)) {
//               serviceTagsResults.push({ tag });
//               currentCount++;
//               break;
//             }
//           }
//         }
//       }
//     }

//     // Product Tags
//     if (Array.isArray(industry?.productTags)) {
//       for (const ind of industry.productTags) {
//         if (currentCount >= 15) break;

//         if (Array.isArray(ind?.tags)) {
//           for (const tag of ind.tags) {
//             if (currentCount >= 15) break;

//             if (tag && tag.toLowerCase().includes(normalizedSearch)) {
//               productTagsResults.push({ tag });
//               currentCount++;
//               break;
//             }
//           }
//         }
//       }
//     }
//     */
//   }

//   return {
//     companyNamesResults,
//     brandNamesResults,
//     // industryResults,
//     // serviceTagsResults,
//     // productTagsResults,
//     // categoryResults
//   };
// };

// export const findIndustryCategoriesAndTags = (data, searchTerm, count = 0) => {
//   const normalizedSearch = searchTerm.trim().toLowerCase();

//   const industryResults = [];
//   const categoryResults = [];
//   const tagsList = [];

//   for (const d of data) {
//     if (d.industry?.toLowerCase().includes(normalizedSearch)) {
//       industryResults.push({ industry: d.industry });
//       count++;
//       if (count >= 15) break;
//     }

//     for (const c of d.categories || []) {
//       if (c.category?.toLowerCase().includes(normalizedSearch)) {
//         categoryResults.push({ category: c.category });
//         count++;
//         if (count >= 15) break;
//       }
//     }
//     if (count >= 15) break;

//     for (const t of d.productTags || []) {
//       for (const tagObj of t.tags || []) {
//         const tagText = typeof tagObj === "string" ? tagObj : tagObj?.tag;
//         if (tagText?.toLowerCase().includes(normalizedSearch)) {
//           tagsList.push({ tag: tagText });
//           count++;
//           if (count >= 15) break;
//         }
//       }
//       if (count >= 15) break;
//     }
//     // for (const t of d.serviceTags || []) {
//     //   for (const tagObj of t.tags || []) {
//     //     const tagText = typeof tagObj === "string" ? tagObj : tagObj?.tag;
//     //     if (tagText?.toLowerCase().includes(normalizedSearch)) {
//     //       tagsList.push({ tag: tagText });
//     //       count++;
//     //       if (count >= 15) break;
//     //     }
//     //   }
//     //   if (count >= 15) break;
//     // }
//     if (count >= 15) break;
//   }

//   return { industryResults, categoryResults, tagsList, count };
// };


// helpers/match.js

// ✅ Search brand and company names
export const searchBrandAndCompanyNames = (brands, searchTerm, existsCount = 0) => {
  const brandNamesResults = [];
  const companyNamesResults = [];

  if (!brands || !Array.isArray(brands)) {
    console.warn("⚠️ searchBrandAndCompanyNames: brands is not array");
    return { companyNamesResults, brandNamesResults };
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();
  let currentCount = existsCount;

  console.log(`🔍 Searching ${brands.length} brands for: "${normalizedSearch}"`);

  for (let i = 0; i < brands.length; i++) {
    if (currentCount >= 15) break;

    const brand = brands[i];

    // ✅ Safe access with fallbacks
    const companyName = brand?.brandDetails?.companyName || "";
    const brandName = brand?.brandDetails?.brandName || "";
    const id = brand?.uuid || brand?._id;

    // ✅ Fix logo path - check correct nested path
    const logo =
      brand?.uploads?.uploads?.brandLogo?.[0] ||
      brand?.uploads?.brandLogo?.[0] ||
      brand?.uploads?.logo ||
      "";

    // ✅ Match brand name
    if (
      brandName &&
      brandName.toLowerCase().includes(normalizedSearch) &&
      !brandNamesResults.some((b) => b.brandName === brandName)
    ) {
      brandNamesResults.push({ brandName, logo, id });
      currentCount++;
      continue;
    }

    // ✅ Match company name
    if (
      companyName &&
      companyName.toLowerCase().includes(normalizedSearch) &&
      !companyNamesResults.some((c) => c.companyName === companyName)
    ) {
      companyNamesResults.push({ companyName, logo, id });
      currentCount++;
    }
  }

  console.log(
    `✅ Found: ${brandNamesResults.length} brands, ${companyNamesResults.length} companies`
  );

  return { companyNamesResults, brandNamesResults };
};

// ✅ Fixed: handles FLATTENED industry array correctly
export const findIndustryCategoriesAndTags = (data, searchTerm, count = 0) => {
  if (!data || !Array.isArray(data)) {
    console.warn("⚠️ findIndustryCategoriesAndTags: data is not array");
    return { industryResults: [], categoryResults: [], tagsList: [], count };
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const industryResults = [];
  const categoryResults = [];
  const tagsList = [];

  // ✅ Track duplicates
  const seenIndustries = new Set();
  const seenCategories = new Set();
  const seenTags = new Set();

  console.log(`🏭 Searching ${data.length} industries for: "${normalizedSearch}"`);

  for (const d of data) {
    if (count >= 15) break;

    // ✅ Match industry name
    const industryName = d?.industry || "";
    if (
      industryName &&
      industryName.toLowerCase().includes(normalizedSearch) &&
      !seenIndustries.has(industryName)
    ) {
      seenIndustries.add(industryName);
      industryResults.push({ industry: industryName });
      count++;
      if (count >= 15) break;
    }

    // ✅ Match categories
    const categories = d?.categories || [];
    for (const c of categories) {
      if (count >= 15) break;

      const categoryName = c?.category || "";
      if (
        categoryName &&
        categoryName.toLowerCase().includes(normalizedSearch) &&
        !seenCategories.has(categoryName)
      ) {
        seenCategories.add(categoryName);
        categoryResults.push({ category: categoryName });
        count++;
      }
    }

    if (count >= 15) break;

    // ✅ Match product tags
    const productTags = d?.productTags || [];
    for (const tagGroup of productTags) {
      if (count >= 15) break;

      const tags = tagGroup?.tags || [];
      for (const tagObj of tags) {
        if (count >= 15) break;

        // ✅ Handle both string and object tag formats
        const tagText =
          typeof tagObj === "string"
            ? tagObj
            : tagObj?.tag || "";

        if (
          tagText &&
          tagText.toLowerCase().includes(normalizedSearch) &&
          !seenTags.has(tagText)
        ) {
          seenTags.add(tagText);
          tagsList.push({ tag: tagText });
          count++;
        }
      }
    }

    if (count >= 15) break;

    // ✅ Also match service tags
    const serviceTags = d?.serviceTags || [];
    for (const tagGroup of serviceTags) {
      if (count >= 15) break;

      const tags = tagGroup?.tags || [];
      for (const tagObj of tags) {
        if (count >= 15) break;

        const tagText =
          typeof tagObj === "string"
            ? tagObj
            : tagObj?.tag || "";

        if (
          tagText &&
          tagText.toLowerCase().includes(normalizedSearch) &&
          !seenTags.has(tagText)
        ) {
          seenTags.add(tagText);
          tagsList.push({ tag: tagText });
          count++;
        }
      }
    }
  }

  console.log(
    `✅ Industry matches: ${industryResults.length} | ` +
    `Category matches: ${categoryResults.length} | ` +
    `Tag matches: ${tagsList.length}`
  );

  return { industryResults, categoryResults, tagsList, count };
};

