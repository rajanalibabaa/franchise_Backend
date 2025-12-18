export const searchBrandAndCompanyNames = (
  brand,
  searchTerm,
  existsCount = 0
) => {
  const brandNamesResults = [];
  const companyNamesResults = [];
  const serviceTagsResults = [];
  const productTagsResults = [];
  const industryResults = [];

  const normalizedSearch = searchTerm.trim().toLowerCase();

  let currentCount =
    brandNamesResults.length +
    companyNamesResults.length +
    industryResults.length +
    serviceTagsResults.length +
    productTagsResults.length +
    existsCount;

  if (currentCount >= 10)
    return {
      companyNamesResults,
      brandNamesResults,
      industryResults,
      serviceTagsResults,
      productTagsResults,
    };

  for (let i = 0; i < brand.length; i++) {
    if (currentCount >= 10) break;

    const companyName = brand[i]?.brandDetails?.companyName;
    const brandName = brand[i]?.brandDetails?.brandName;
    const id = brand[i]?.uuid;
    const industry =
      brand[i]?.franchiseDetails?.franchiseDetails?.brandCategories;

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

    if (
      industry?.main &&
      industry.main.toLowerCase().includes(normalizedSearch) &&
      !industryResults.some((i) => i.industry === industry.main)
    ) {
      industryResults.push({ industry: industry.main, logo, id });
      currentCount++;
    }

    if (Array.isArray(industry?.serviceTags)) {
      for (const ind of industry.serviceTags) {
        if (currentCount >= 10) break;

        if (Array.isArray(ind?.tags)) {
          for (const tag of ind.tags) {
            if (currentCount >= 10) break;

            if (
              tag &&
              tag.toLowerCase().includes(normalizedSearch) 
            ) {
              serviceTagsResults.push({ tag, logo, id });
              currentCount++;
              break
            }
          }
        }
      }
    }

    if (Array.isArray(industry?.productTags)) {
      for (const ind of industry.productTags) {
        if (currentCount >= 10) break;

        if (Array.isArray(ind?.tags)) {
          for (const tag of ind.tags) {
            if (currentCount >= 10) break;

            if (
              tag &&
              tag.toLowerCase().includes(normalizedSearch)
            ) {
              productTagsResults.push({ tag, logo, id });
              currentCount++;
              break
            }
          }
        }
      }
    }
  }

  return {
    companyNamesResults,
    brandNamesResults,
    industryResults,
    serviceTagsResults,
    productTagsResults,
  };
};
