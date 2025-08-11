import BrandListing from "../../model/Brand/brandListingPage.js";
import { sendInstantApplyLeadLocation, sendPremiumPackageOfferEmail } from "../Centralized Email/centralizedEmail.js";
import InstantApplyInvestor from "../../model/NewIncomeInvestor/InstantApplyLocationSchema.js";
import BrandBatch from "../../model/NewIncomeInvestor/InstantApplyTrackSchema.js";
import BrandEmailCount from "../../model/NewIncomeInvestor/BrandEmailCountSchema .js";
import SystemConfig from "../../model/NewIncomeInvestor/SystemConfigSchema .js";
import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";

export const instantApplyLocationMatch = async (
  fullName,
  email,
  mobileNumber,
  brandName,
  brandId,
  brandEmail,
  mainCategory,
  subCategory,
  childCategory,
  state,
  district,
  city,
  investmentRange,
  planToInvest,
  readyToInvest,
  applyBy,
  applyId,
  brandLogo
) => {
console.log("Starting instantApplyLocationMatch with parameters:", {
  fullName,
  email,
  mobileNumber,
  brandName,        
  brandId,
  brandEmail,
  mainCategory,
  subCategory,
  childCategory,
  state,
  district,
  city,
  investmentRange,
  planToInvest,
  readyToInvest,
  applyBy,
  applyId,
  brandLogo
});

const config = await SystemConfig.findOne();
  const BATCH_SIZE = config?.batchSize || 7;
  const MAX_EMAILS_PER_MONTH = config?.maxEmailsPerMonth || 5;

  try {
    const OverAllBrandExists = await BrandListing.find({});
  
    
    const totalBrands = OverAllBrandExists.length;
      console.log("OverAllBrandExists: ", totalBrands);
    if (totalBrands === 0) throw new Error("No brands found in the database");

    let brandBatchDoc = await BrandBatch.findOne({ brandId });
    if (!brandBatchDoc) {
      brandBatchDoc = await BrandBatch.create({ brandId, batch: 0 });
    }

    let currentBatch = brandBatchDoc.batch;
    let brandsToSend = [];
    let brandsAtLimit = [];
    let foundMatch = false;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    for (let i = 0; i <= Math.ceil(totalBrands / BATCH_SIZE); i++) {
      const start = currentBatch * BATCH_SIZE;
      const end = start + BATCH_SIZE;

      const currentSlice = OverAllBrandExists.slice(start, end);
      console.log("Current Slice: ", currentSlice.length);
      const filtered = [];
      const limitReached = [];

      for (const brand of currentSlice) {
        const locations = brand.expansionLocationData?.expansionLocations?.domestic?.locations || [];
        const match = locations.some(loc => loc.state === state);
        if (!match) continue;

        let countDoc = await BrandEmailCount.findOne({
          brandId: brand._id,
          brandName: brand.brandDetails?.brandName || "",
          month: currentMonth,
          year: currentYear
        });

        if (!countDoc) {
          countDoc = await BrandEmailCount.create({
            brandId: brand._id,
            brandName: brand.brandDetails?.brandName || "",
            month: currentMonth,
            year: currentYear,
            emailCount: 0,
            emailRecords: [] // Initialize if not present
          });
        }

        if (countDoc.emailCount < MAX_EMAILS_PER_MONTH) {
          filtered.push({ brand, countDoc });
        } else {
          limitReached.push(brand);
        }
      }

      if (filtered.length > 0) {
        brandsToSend = filtered;
        foundMatch = true;
        break;
      } else if (limitReached.length > 0) {
        brandsAtLimit = limitReached;
        foundMatch = true;
        break;
      }

      currentBatch = (currentBatch + 1) % Math.ceil(totalBrands / BATCH_SIZE);
    }

    if (!foundMatch) {
      return { success: false, message: "No matched brands found" };
    }

    const brandsSent = [];
    if (brandsToSend.length > 0) {
      for (const item of brandsToSend) {
        const { brand, countDoc } = item;

        await sendInstantApplyLeadLocation("Sending instant apply email for brand:",
          fullName,
          email,
          mobileNumber,
          brand.brandDetails?.brandName || "",
          brand.brandDetails?.email || "",
          `${mainCategory},${subCategory},${childCategory}`,
          `${state},${district},${city}`,
          investmentRange,
          planToInvest,
          readyToInvest
        );

        countDoc.emailCount += 1;
        countDoc.emailRecords.push({ investorEmail: email }); // <-- Track each send
        await countDoc.save();

        brandsSent.push({
          brandId: brand._id,
          brandName: brand.brandDetails?.brandName || "",
          brandEmail: brand.brandDetails?.email || "",
          emailSent: true,
          emailSentAt: new Date(),
        });
      }
    }

    const brandsLimitReached = [];
    if (brandsAtLimit.length > 0) {
     for (const brand of brandsAtLimit) {
  // Get or update the countDoc again
  let countDoc = await BrandEmailCount.findOne({
    brandId: brand._id,
    month: currentMonth,
    year: currentYear
  });

  if (!countDoc) {
    countDoc = await BrandEmailCount.create({
      brandId: brand._id,
      brandName: brand.brandDetails?.brandName || "",
      month: currentMonth,
      year: currentYear,
      emailCount: 0,
      emailRecords: [],
      premiumOfferCount: 0,
      premiumOfferRecords: [],
    });
  }

  await sendPremiumPackageOfferEmail(
    "Sending premium package offer email for limit reached brand:",
    fullName,
    email,
    mobileNumber,
    brand.brandDetails?.brandName || "",
    `${mainCategory},${subCategory},${childCategory}`,
    `${state},${district},${city}`,
    investmentRange
  );

  countDoc.premiumOfferCount += 1;
  countDoc.premiumOfferRecords.push({ investorEmail: email });
  await countDoc.save();

  brandsLimitReached.push({
    brandId: brand._id,
    brandName: brand.brandDetails?.brandName || "",
    brandEmail: brand.brandDetails?.email || "",
    emailSent: false,
    limitReached: true,
    premiumOfferSent: true,
    premiumOfferSentAt: new Date(),
  });
}

    }

    const nextBatch = (currentBatch + 1) % Math.ceil(totalBrands / BATCH_SIZE);
    brandBatchDoc.batch = nextBatch;
    brandBatchDoc.updatedAt = new Date();
    await brandBatchDoc.save();

    await InstantApplyInvestor.create({
      investorEmail: email,
      investorName: fullName,
      investorPhone: mobileNumber,
      category: [{ main: mainCategory, sub: subCategory, child: childCategory }],
      location: { state, city, district },
      investmentRange,
      planToInvest,
      readyToInvest,
      apply: {
        applyBy: applyBy || "other",
        applyId: applyId || "other",
      },
      brandsSent: [...brandsSent, ...brandsLimitReached],
    });

    return {
      success: true,
      message: "Instant apply processed successfully",
      brandsSent: brandsSent.map(b => ({
        brandId: b.brandId,
        brandName: b.brandName,
        status: 'email_sent'
      })),
      brandsLimitReached: brandsLimitReached.map(b => ({
        brandId: b.brandId,
        brandName: b.brandName,
        status: 'limit_reached',
        premiumOfferSent: true
      })),
      batch: currentBatch,
      totalBrands,
    }; 

  } catch (error) {
    console.error("Error in instantApplyLocationMatch:", error);
    throw error;
  }
 };
 
export const getSystemConfig = async (req, res) => {
  try {
    const config = await SystemConfig.findOne();
    res.status(200).json(config);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const updateSystemConfig = async (req, res) => {
  try {
    const { batchSize, maxEmailsPerMonth, updatedBy } = req.body;

    const config = await SystemConfig.findOne();
    if (config) {
      if (batchSize !== undefined) config.batchSize = batchSize;
      if (maxEmailsPerMonth !== undefined) config.maxEmailsPerMonth = maxEmailsPerMonth;
      if (updatedBy) config.updatedBy = updatedBy;
      config.updatedAt = new Date();
      await config.save();
    } else {
      await SystemConfig.create({
        batchSize,
        maxEmailsPerMonth,
        updatedBy,
      });
    }

    res.status(200).json({ success: true, message: "System config updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

