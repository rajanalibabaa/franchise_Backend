import { IndustryManagement } from "../model/Admin/CMS/industryManagement.model.js";

export const getIndustryCatTags = async (industryName) => {
  try {
    const filter = industryName ? { industry: industryName } : {};
    const industriesList = await IndustryManagement.find(filter);


    
    return industriesList || [];
  } catch (error) {
    console.error("Error fetching industry categories and tags:", error);
    return [];
  }
};
