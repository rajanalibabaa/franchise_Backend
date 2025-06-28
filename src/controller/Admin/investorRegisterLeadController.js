import InvestorLead from "../../model/NewIncomeInvestor/leadsModel.js";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { sendBrandEmailPerfect } from "../../utils/Centralized Email/centralizedEmail.js";

export const newIncomerInvestorController = async (
  email,
  firstName,
  category,
  country,
  state,
  city,
  investmentRange
) => {
  try {
    const investorEmail = email;
    const investorName = firstName;

    const investorLocation = { country, state, city };
    const investorCategory = category.map((cat) => cat.child);

    // ✅ Validate required fields
    const requiredFields = [
      investorEmail,
      investorName,
      category,
      country,
      state,
      city,
      investmentRange,
    ];

    if (requiredFields.some((field) => !field || field.length === 0)) {
      console.warn("Missing required data for investor lead.");
      return;
    }

    // ✅ Save investor lead
    const newLead = new InvestorLead({
      investorEmail,
      investorName,
      category,
      location: investorLocation,
      investmentRange,
    });
    await newLead.save();

    const emailedBrands = new Set();
    const results = [];
    const perfectMatchesData = [];
    const partialMatchesData = [];

    // ✅ Find PERFECT matches
    const perfectMatches = await BrandListing.find({
      "personalDetails.brandCategories.child": { $in: investorCategory },
      "personalDetails.expansionLocation": {
        $elemMatch: {
          country,
          state,
          city: { $in: [city, "Not available"] },
        },
      },
      "franchiseDetails.modelsOfFranchise.investmentRange": investmentRange,
      "personalDetails.email": { $ne: null },
    });

    console.log("Perfect matches found:", perfectMatches.length);

    for (const brand of perfectMatches) {
      const brandEmail = brand.personalDetails.email;
      const brandCompanyName = brand.personalDetails.companyName;
      const emailSubject =
        'An investor has been found who matches your "Investment Range", "Category", and "Location" preferences exactly. Time to connect!';

      if (!emailedBrands.has(brandEmail)) {
        try {
          await sendBrandEmailPerfect(
            brandEmail,
            brandCompanyName,
            investorName,
            investorCategory,
            `${city}, ${state}, ${country}`,
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
            location: `${city}, ${state}, ${country}`,
            category: investorCategory,
            investment: investmentRange,
            matchType: "perfect",
            brandId: brand._id,
          });

          console.log(`Perfect match email sent to: ${brandEmail}`);
        } catch (error) {
          console.error(`Failed to email perfect match: ${brandEmail}`, error);
        }
      }
    }

    // ✅ Find PARTIAL matches
    const partialMatches = await BrandListing.find({
      "personalDetails.expansionLocation": {
        $elemMatch: {
          country,
          state,
          $or: [{ city }, { city: "Not available" }],
        },
      },
      "franchiseDetails.modelsOfFranchise.investmentRange": investmentRange,
      "personalDetails.email": { $nin: Array.from(emailedBrands) },
    });

    for (const brand of partialMatches) {
      const brandEmail = brand.personalDetails.email;
      const brandCompanyName = brand.personalDetails.companyName;
      const brandCategory =
        brand.personalDetails.brandCategories?.[0]?.child || "Not specified";
      const emailSubject =
        'We’ve found an investor who matches your "Investment Range" and "Location". Category differs slightly, but it’s a strong opportunity.';

      if (!emailedBrands.has(brandEmail)) {
        try {
          await sendBrandEmailPerfect(
            brandEmail,
            brandCompanyName,
            investorName,
            investorCategory,
            `${city}, ${state}, ${country}`,
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
            location: `${city}, ${state}, ${country}`,
            category: brandCategory,
            investment: investmentRange,
            matchType: "partial",
            brandId: brand._id,
          });

          console.log(`Partial match email sent to: ${brandEmail}`);
        } catch (error) {
          console.error(`Failed to email partial match: ${brandEmail}`, error);
        }
      }
    }

    // ✅ Update lead with match data
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

    console.log("Lead updated with brand match stats.");

    // Optional: Log summary
    console.log("Matched brands:", {
      perfect: perfectMatchesData.length,
      partial: partialMatchesData.length,
    });

  } catch (error) {
    console.error("newIncomerInvestorController error:", error);
  }
};

// get all investor lead

// export const getNewInvestorLead = async (req, res) => {
//   try {
//     const allNewLead = await InvestorLead.find({});
//     res.status(200).json(allNewLead);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// //get investor lead by id

// export const getNewInvestorLeadById = async (req, res) => {
//   try {
//     const newLead = await InvestorLead.findById(req.params.id);
//     if (!newLead)
//       return res.status(404).json({ error: "NewInvestor not found" });
//     res
//       .status(200)
//       .json({ message: "NewInvestor fetched successfully", data: newLead });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// //  get investor lead by uuid

// export const getNewInvestorLeadByUuid = async (req, res) => {
//   try {
//     const newLead = await InvestorLead.findOne({ uuid: req.params.uuid });
//     if (!newLead)
//       return res.status(404).json({ error: "NewInvestor not found" });
//     res
//       .status(200)
//       .json({ message: "NewInvestor fetched successfully", data: newLead });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
