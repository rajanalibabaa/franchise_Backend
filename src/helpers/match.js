export const searchBrandAndCompanyNames = (
  brand,
  searchTerm,
  existsCount = 0
) => {
  const brandNamesResults = [];
  const companyNamesResults = [];
  const industryResults = [];

  const normalizedSearch = searchTerm.trim().toLowerCase();

  let currentCount =
    brandNamesResults.length +
    companyNamesResults.length +
    industryResults.length +
    existsCount;

  if (currentCount >= 10)
    return { companyNamesResults, brandNamesResults, industryResults };

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
      brandNamesResults.push({ brandName, logo,id });
      currentCount++;
      continue;
    }

    if (
      companyName &&
      companyName.toLowerCase().includes(normalizedSearch) &&
      !companyNamesResults.some((c) => c.companyName === companyName)
    ) {
      companyNamesResults.push({ companyName, logo ,id});
      currentCount++;
      continue;
    }

    if (
      industry?.main &&
      industry.main.toLowerCase().includes(normalizedSearch) &&
      !industryResults.some((i) => i.industry === industry.main)
    ) {
      industryResults.push({ industry: industry.main, logo,id });
      currentCount++;
    }
  }

  return { companyNamesResults, brandNamesResults, industryResults };
};
