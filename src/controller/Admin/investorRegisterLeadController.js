import InvestorLead from "../../model/NewIncomeInvestor/leadsModel.js";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { sendBrandEmailPerfect } from "../../utils/Centralized Email/centralizedEmail.js";

export const newIncomerInvestorController = async (req, res) => {
  try {
    const {
      investorEmail,
      investorName,
      category,
      country,
      state,
      city,
      investmentRange,
    } = req.body;

    // Prepare query conditions
    const investorLocation = { country, state, city };
    const investorCategory = category.map((cat) => cat.child);
    // const investorCategorymain = category.map(cat => cat.main);
    // const investorCategorysub = category.map(cat => cat.sub);

    console.log("Controller input:", {
      investorEmail,
      investorName,
      category,
      country,
      state,
      city,
      investmentRange,
    });
    // Validate required fields
    const requiredFields = [
      investorEmail,
      investorName,
      category,
      country,
      state,
      city,
      investmentRange,
    ];

    const hasEmptyFields = requiredFields.some((field) => !field);
    if (hasEmptyFields) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // 1. Save new investor lead
    const newLead = new InvestorLead({
      investorEmail: investorEmail,
      investorName: investorName,
      category,
      location: {
        country,
        state,
        city,
      },
      investmentRange: investmentRange,
    });
    await newLead.save();
    console.log(`New investor lead saved: ${investorEmail}`);

    const emailedBrands = new Set();
    const results = [];
    const perfectMatchesData = [];
    const partialMatchesData = [];

    // Using child category from the input
    console.log("Investor location and category:", {
      investorLocation,
      investorCategory,
    });
    // 2. Find PERFECT matches (category, location, and investment range)
    const perfectMatches = await BrandListing.find({
      "personalDetails.brandCategories.child": investorCategory,
      "personalDetails.expansionLocation": {
        $elemMatch: {
          country: investorLocation.country,
          state: investorLocation.state,
          $or: [{ city: investorLocation.city }, { city: "Not available" }],
        },
      },
      "franchiseDetails.modelsOfFranchise.investmentRange": investmentRange,
      "personalDetails.email": { $ne: null },
    });
    console.log(
      `Found ${perfectMatches.length} perfect matches for investor: ${investorEmail}`
    );

    for (const brand of perfectMatches) {
      const brandEmail = brand.personalDetails.email;
      const brandCompanyName = brand.personalDetails.companyName;
      const emailSubject =
        'An investor has been found who matches your "InvestmentRange", "Category", and "Location" preferences exactly. Time to connect';

      if (!emailedBrands.has(brandEmail)) {
        try {
          await sendBrandEmailPerfect(
            brandEmail,
            brandCompanyName,
            investorName,
            investorCategory,
            `${investorLocation.city}, ${investorLocation.state}, ${investorLocation.country}`,
            investmentRange,
            emailSubject
          );
          emailedBrands.add(brandEmail);

          perfectMatchesData.push({
            email: brandEmail,
            companyName: brandCompanyName,
            brandId: brand._id,
          });

          results.push({
            companyName: brandCompanyName,
            email: brandEmail,
            location: `${investorLocation.city}, ${investorLocation.state}, ${investorLocation.country}`,
            category: investorCategory,
            investment: investmentRange,
            matchType: "perfect",
            brandId: brand._id,
          });

          console.log(`Perfect match email sent to: ${brandEmail}`);
        } catch (error) {
          console.error(
            `Failed to email perfect match: ${brandEmail}, error`,
            error
          );
        }
      }
    }

    // 3. Find PARTIAL matches (location and investment range only)
    const partialMatches = await BrandListing.find({
      "personalDetails.expansionLocation": {
        $elemMatch: {
          country: investorLocation.country,
          state: investorLocation.state,
          $or: [{ city: investorLocation.city }, { city: "Not available" }],
        },
      },
      "franchiseDetails.modelsOfFranchise.investmentRange": investmentRange,
      "personalDetails.email": { $ne: null },
      "personalDetails.email": { $nin: Array.from(emailedBrands) },
    });

    for (const brand of partialMatches) {
      const brandEmail = brand.personalDetails.email;
      const brandCompanyName = brand.personalDetails.companyName;
      const brandCategory =
        brand.personalDetails.brandCategories[0]?.child || "Not specified";
      const emailSubject =
        'We\'ve found an investor who matches your "InvestmentRange" and "Location" perfectly. The Category is slightly different, but this lead holds strong potential for your brand.';

      if (!emailedBrands.has(brandEmail)) {
        try {
          await sendBrandEmailPerfect(
            brandEmail,
            brandCompanyName,
            investorName,
            investorCategory,
            `${investorLocation.city}, ${investorLocation.state}, ${investorLocation.country}`,
            investmentRange,
            emailSubject
          );
          emailedBrands.add(brandEmail);

          partialMatchesData.push({
            email: brandEmail,
            companyName: brandCompanyName,
            brandId: brand._id,
          });

          results.push({
            companyName: brandCompanyName,
            email: brandEmail,
            location: `${investorLocation.city}, ${investorLocation.state}, ${investorLocation.country}`,
            category: brandCategory,
            investment: investmentRange,
            matchType: "partial",
            brandId: brand._id,
          });

          console.log(`Partial match email sent to: ${brandEmail}`);
        } catch (error) {
          console.error(
            `Failed to email partial match: ${brandEmail}, error`,
            error
          );
        }
      }
    }

    // 4. Update lead with match data
    await InvestorLead.findByIdAndUpdate(newLead._id, {
      $set: {
        brandPerfectMatches: perfectMatchesData,
        brandPartialMatches: partialMatchesData,
        matchedBrandsCount: {
          perfect: perfectMatchesData.length,
          partial: partialMatchesData.length,
          total: perfectMatchesData.length + partialMatchesData.length,
        },
      },
    });

    // 5. Final response
    if (results.length > 0) {
      return res.status(200).json({
        status: 200,
        message: `Matches found (${perfectMatchesData.length} perfect, ${partialMatchesData.length} partial)`,
        data: results,
        stats: {
          total: results.length,
          perfectMatches: perfectMatchesData.length,
          partialMatches: partialMatchesData.length,
        },
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "No matching brands found",
      });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
// get all investor lead

export const getNewInvestorLead = async (req, res) => {
  try {
    const allNewLead = await InvestorLead.find({});
    res.status(200).json(allNewLead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//get investor lead by id

export const getNewInvestorLeadById = async (req, res) => {
  try {
    const newLead = await InvestorLead.findById(req.params.id);
    if (!newLead)
      return res.status(404).json({ error: "NewInvestor not found" });
    res
      .status(200)
      .json({ message: "NewInvestor fetched successfully", data: newLead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  get investor lead by uuid

export const getNewInvestorLeadByUuid = async (req, res) => {
  try {
    const newLead = await InvestorLead.findOne({ uuid: req.params.uuid });
    if (!newLead)
      return res.status(404).json({ error: "NewInvestor not found" });
    res
      .status(200)
      .json({ message: "NewInvestor fetched successfully", data: newLead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
