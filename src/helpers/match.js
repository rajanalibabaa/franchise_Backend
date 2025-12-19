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

  if (currentCount >= 10)
    return {
      companyNamesResults,
      brandNamesResults,
      // industryResults,
      // serviceTagsResults,
      // productTagsResults,
      // categoryResults
    };

  for (let i = 0; i < brand.length; i++) {
    if (currentCount >= 10) break;

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
        if (currentCount >= 10) break;

        if (Array.isArray(ind?.tags)) {
          for (const tag of ind.tags) {
            if (currentCount >= 10) break;

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
        if (currentCount >= 10) break;

        if (Array.isArray(ind?.tags)) {
          for (const tag of ind.tags) {
            if (currentCount >= 10) break;

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

export const findIndustryCategoriesAndTags = (data, searchTerm, count) => {
  console.log("data :", data);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  let industryResults = [];
  let categoryResults = [];
  let tagsList = [];

  data.map((d) => {
  
    if (d.industry.toLowerCase().includes(normalizedSearch)) {
      industryResults.push({ industry: d.industry });
    }

   
    d.categories.map((c) => {
      if (c.category.toLowerCase().includes(normalizedSearch)) {
        categoryResults.push({ category: c.category});
      }
    });

    
    d.productTags.map((t) => {
      t.tags.map((tagObj) => {
        const tagText = typeof tagObj === "string" ? tagObj : tagObj.tag; 
        if (tagText && tagText.toLowerCase().includes(normalizedSearch)) {
          tagsList.push({ tag: tagText });
        }
      });
    });
  });

  // console.log("industriesList :", industryResults);
  // console.log("categoryResults :", categoryResults);
  // console.log("tagsList :", tagsList);

  return {industryResults, categoryResults, tagsList };
};
