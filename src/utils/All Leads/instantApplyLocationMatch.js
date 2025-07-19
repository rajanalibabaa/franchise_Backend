import BrandListing from "../../model/Brand/brandListingPage.js";
import { sendInstantApplyEmail } from "../Centralized Email/centralizedEmail.js";
import InstantApplyInvestor from "../../model/NewIncomeInvestor/InstantApplyLocationSchema.js";
import BrandBatch from "../../model/NewIncomeInvestor/InstantApplyTrackSchema.js"; // <--- NEW IMPORT

const BATCH_SIZE = 7

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
  try {
    const OverAllBrandExists = await BrandListing.find({});
    if (OverAllBrandExists.length === 0) {
      throw new Error("No brands found in the database");
    }

    // Get all brands matching the investor's location
    const matchedBrands = await BrandListing.find({
      "expansionLocationData.expansionLocations.domestic.locations": {
        $elemMatch: { state },
      },
    });

    if (matchedBrands.length === 0) {
      return {
        success: false,
        message: "No matched brands found for the location",
      };
    }

    // Get or initialize batch info for this brand
    let brandBatchDoc = await BrandBatch.findOne({ brandId });

    if (!brandBatchDoc) {
      brandBatchDoc = await BrandBatch.create({ brandId, batch: 0 });
    }

    let currentBatch = brandBatchDoc.batch ;
    console.log("Current batch:", currentBatch);

    // Calculate slicing range
    const start = currentBatch * BATCH_SIZE;
    console.log("Start index:", start);
    const end = start + BATCH_SIZE;
    console.log("End index:", end);

    let brandsToSend = matchedBrands.slice(start, end);

    // If no brands left in this batch, reset to batch 0
    if (brandsToSend.length === 0) {
      currentBatch = 0;
      brandsToSend = matchedBrands.slice(0, BATCH_SIZE);
    }

    const brandsSent = [];
    for (const brand of brandsToSend) {
       console.log(
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

      brandsSent.push({
        brandId: brand._id,
        brandName: brand.brandDetails?.brandName || "",
        brandEmail: brand.brandDetails?.email || "",
        emailSent: true,
        emailSentAt: new Date(),
      });
    }

    // Update or reset brand batch
    const nextBatch =
      brandsToSend.length < BATCH_SIZE ? 0 : currentBatch + 1;

    brandBatchDoc.batch = nextBatch;
    brandBatchDoc.updatedAt = new Date();
    await brandBatchDoc.save();

    // Store investor record
    await InstantApplyInvestor.create({
      investorEmail: email,
      investorName: fullName,
      investorPhone: mobileNumber,
      category: [
        { main: mainCategory, sub: subCategory, child: childCategory },
      ],
      location: { state, city, district },
      investmentRange,
      planToInvest,
      readyToInvest,
      apply: {
        applyBy: applyBy || "other",
        applyId: applyId || "other",
      },
      brandsSent,
    });

    return {
      success: true,
      message: "Instant apply processed successfully",
      brands: brandsToSend,
      batch: currentBatch,
      totalBrands: matchedBrands.length,
    };
  } catch (error) {
    console.error("Error in instantApplyLocationMatch:", error);
    throw error;
  }
};
