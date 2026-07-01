  // import { IndustryManagement } from "../model/Admin/CMS/industryManagement.model.js";

  // export const getIndustryCatTags = async (industryName) => {
  //   try {
  //     const filter = industryName ? { industry: industryName } : {};
  //     const industriesList = await IndustryManagement.find(filter);

  //     return industriesList || [];
  //   } catch (error) {
  //     console.error("Error fetching industry categories and tags:", error);
  //     return [];
  //   }
  // };


  // helpers/getIndustry.js
import { IndustryManagement } from "../model/Admin/CMS/industryManagement.model.js";

export const getIndustryCatTags = async (industryName) => {
  try {
    console.time("⏱️ getIndustryCatTags DB query");

    // ✅ Fetch all industry management documents
    const documents = await IndustryManagement.find({}).lean(); // lean() = faster

    console.timeEnd("⏱️ getIndustryCatTags DB query");
    console.log(`📦 Raw documents fetched: ${documents.length}`);

    if (!documents || documents.length === 0) return [];

    // ✅ Flatten: documents -> headings -> industries
    const flatIndustries = [];

    for (const doc of documents) {
      for (const heading of doc.headings || []) {
        for (const industry of heading.industries || []) {
          // ✅ Filter by industryName if provided
          if (
            industryName &&
            industry.industry?.toLowerCase() !== industryName.toLowerCase()
          ) {
            continue;
          }
          flatIndustries.push(industry);
        }
      }
    }

    console.log(`✅ Flattened industries count: ${flatIndustries.length}`);

    // 🔍 Debug: log first industry shape
    if (flatIndustries.length > 0) {
      console.log("🔍 Sample industry:", JSON.stringify(flatIndustries[0], null, 2));
    }

    return flatIndustries;
  } catch (error) {
    console.error("❌ Error fetching industry categories and tags:", error);
    return [];
  }
};