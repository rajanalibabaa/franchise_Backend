import BrandListing from "../../model/Brand/brandListingPage.js";
import { sendInstantApplyLeadLocation, sendPremiumPackageOfferEmail } from "../Centralized Email/centralizedEmail.js";
import InstantApplyInvestor from "../../model/NewIncomeInvestor/InstantApplyLocationSchema.js";
import BrandBatch from "../../model/NewIncomeInvestor/InstantApplyTrackSchema.js";
import BrandEmailCount from "../../model/NewIncomeInvestor/BrandEmailCountSchema .js";
import SystemConfig from "../../model/NewIncomeInvestor/SystemConfigSchema .js";
import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";

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
    const aggregationPipeline = [
      {
        $lookup: {
          from: "brandfranchisedetails",
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "franchiseDetails"
        }
      },
      {
        $lookup: {
          from: "branduploads",
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "uploads"
        }
      },
      {
        $lookup: {
          from: "brandexpansionlocationdatas",
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "expansionLocationDatas"
        }
      },
      { 
        $unwind: { 
          path: "$franchiseDetails", 
          preserveNullAndEmptyArrays: true 
        } 
      },
      { 
        $unwind: { 
          path: "$uploads", 
          preserveNullAndEmptyArrays: true 
        } 
      },
      { 
        $unwind: { 
          path: "$expansionLocationDatas", 
          preserveNullAndEmptyArrays: true 
        } 
      },
      {
        $project: {
          _id: 1,
          uuid: 1,
          brandID: 1,
          brandDetails: 1,
          franchiseDetails: 1,
          uploads: 1,
          expansionLocationDatas: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ];

    const OverAllBrandExists = await BrandDetails.aggregate(aggregationPipeline);
    console.log(`Total brands found: ${OverAllBrandExists.length}`);
    
    if (OverAllBrandExists.length === 0) {
      throw new Error("No brands found in the database");
    }

    // Get or create batch document for this brand
    let brandBatchDoc = await BrandBatch.findOne({});
    if (!brandBatchDoc) {
      brandBatchDoc = await BrandBatch.create({ batch: 0 });
    }

    // Calculate current batch slice
    let currentBatch = brandBatchDoc.batch;
    const start = currentBatch * BATCH_SIZE;
    const end = start + BATCH_SIZE;
    const currentSlice = OverAllBrandExists.slice(start, end);
    
    // console.log(`Processing batch ${currentBatch} with ${currentSlice.length} brands`);

    const brandsToSend = [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    for (const brand of currentSlice) {
      console.log("Checking brand:", brand.brandDetails?.brandName);

      // Improved location extraction with proper null checks
      const expansionData = brand.expansionLocationDatas?.expansionLocationData;
      const domesticLocations = expansionData?.expansionLocations?.domestic;
      
      // Handle both array and object formats for locations
      let locations = [];
      if (Array.isArray(domesticLocations?.locations)) {
        locations = domesticLocations.locations.map(loc => 
          typeof loc === 'string' ? loc : loc?.state
        ).filter(Boolean);
      } else if (domesticLocations?.locations?.state) {
        locations = Array.isArray(domesticLocations.locations.state) 
          ? domesticLocations.locations.state
          : [domesticLocations.locations.state];
      }
      
      console.log("Locations for brand:", locations);

      if (locations.length === 0) {
        continue; // Skip if no locations to match
      }

      // Case-insensitive state matching
      const normalizedState = state.toLowerCase();
      const match = locations.some(loc => {
        if (!loc) return false;
        return loc.toString().toLowerCase() === normalizedState;
      });

      if (!match) continue;

      let countDoc = await BrandEmailCount.findOne({
        brandId: brand.uuid,
        brandName: brand.brandDetails?.brandName || "",
        month: currentMonth,
        year: currentYear
      });

      if (!countDoc) {
        countDoc = await BrandEmailCount.create({
          brandId: brand.uuid,
          brandName: brand.brandDetails?.brandName || "",
          month: currentMonth,
          year: currentYear,
          emailCount: 0,
          emailRecords: []
        });
      }

      if (countDoc.emailCount < MAX_EMAILS_PER_MONTH) {
        brandsToSend.push({ brand, countDoc });
      }
    }

    if (brandsToSend.length === 0) {
      // Move to next batch if no matches in current batch
      currentBatch = (currentBatch + 1) % Math.ceil(OverAllBrandExists.length / BATCH_SIZE);
      brandBatchDoc.batch = currentBatch;
      await brandBatchDoc.save();

      return { 
        success: false, 
        message: "No matched brands found in current batch",
        batch: currentBatch
      };
    }

    const brandsSent = [];
    for (const { brand, countDoc } of brandsToSend) {
      await sendInstantApplyLeadLocation(
        fullName,
        email,
        mobileNumber,
        brand.brandDetails?.email || "",
        brand.brandDetails?.brandName || "",  
        `${mainCategory},${subCategory},${childCategory}`,
        `${state},${district},${city}`,
        investmentRange,
        planToInvest,
        readyToInvest
      );

      countDoc.emailCount += 1;
      countDoc.emailRecords.push({ investorEmail: email, sentAt: new Date() });
      await countDoc.save();

      brandsSent.push({
        brandId: brand.uuid,
        brandName: brand.brandDetails?.brandName || "",
        brandEmail: brand.brandDetails?.email || "",
        emailSent: true,
        emailSentAt: new Date(),
      });
    }

    // Update to next batch for next run
    const nextBatch = (currentBatch + 1) % Math.ceil(OverAllBrandExists.length / BATCH_SIZE);
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
      brandsSent: brandsSent,
    });

    return {
      success: true,
      message: "Instant apply processed successfully",
      brandsSent: brandsSent.map(b => ({
        brandId: b.brandId,
        brandName: b.brandName,
        status: 'email_sent'
      })),
      batch: currentBatch,
      totalBrands: OverAllBrandExists.length,
    };

  } catch (error) {
    console.error("Error in instantApplyLocationMatch:", error);
    throw error;
  }
};