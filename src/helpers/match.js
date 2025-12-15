export const searchBrandAndCompanyNames = (brands, searchTerm, existsCount = 0) => {
  const brandNamesResults = [];
  const companyNamesResults = [];
  const normalizedSearch = searchTerm.trim().toLowerCase();

  let currentCount = companyNamesResults.length + brandNamesResults.length + existsCount;

  if (currentCount >= 10) return results;

  for (let i = 0; i < brands.length; i++) {
    if (currentCount >= 10) break;

    const companyName = brands[i]?.brandDetails?.companyName;
    const brandName = brands[i]?.brandDetails?.brandName;

    if (
      brandName &&
      brandName.toLowerCase().includes(normalizedSearch) &&
      !brandNamesResults.includes(brandName) &&
      !companyNamesResults.includes(companyName)
    ) {
      brandNamesResults.push({brandName,"logo":brands?.[0]?.uploads?.uploads?.brandLogo?.[0]});
      currentCount++;
      continue; 
    }
   
    if (
      companyName &&
      companyName.toLowerCase().includes(normalizedSearch) &&
      !companyNamesResults.includes(companyName) &&
      !brandNamesResults.includes(brandName)
    ) {
      companyNamesResults.push({companyName,"logo":brands?.[0]?.uploads?.uploads?.brandLogo?.[0]});
      currentCount++;
      
    }

    
    
  }

  return {companyNamesResults,brandNamesResults};
};
