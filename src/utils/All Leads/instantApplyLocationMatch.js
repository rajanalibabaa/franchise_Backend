import BrandListing from "../../model/Brand/brandListingPage.js";
import { sendInstantApplyLeadLocation, sendPremiumPackageOfferEmail } from "../Centralized Email/centralizedEmail.js";
import InstantApplyInvestor from "../../model/NewIncomeInvestor/InstantApplyLocationSchema.js";
import BrandBatch from "../../model/NewIncomeInvestor/InstantApplyTrackSchema.js";
import BrandEmailCount from "../../model/NewIncomeInvestor/BrandEmailCountSchema.js";
import SystemConfig from "../../model/NewIncomeInvestor/SystemConfigSchema.js";
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
  console.log(
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
    applyId
  )

  const config             = await SystemConfig.findOne();
  const BATCH_SIZE         = config?.batchSize         || 7;
  const MAX_EMAILS_PER_MTH = config?.maxEmailsPerMonth || 5;

  let   brandBatchDoc = await BrandBatch.findOne({});
  const ignoreEmail   = [];  

  try {
 
    if (!brandBatchDoc?.isFreeLeadsBrandPaused) {

      const overAllBrands = await BrandDetails.aggregate([
        { $match: { "brandDetails.isBrandPause": { $ne: true },
                    "brandDetails.payment"     : false } },
        { $lookup: { from: "brandfranchisedetails",
                     localField: "uuid", foreignField: "brandOwnerId",
                     as: "franchiseDetails" } },
        { $lookup: { from: "branduploads",
                     localField: "uuid", foreignField: "brandOwnerId",
                     as: "uploads" } },
        { $lookup: { from: "brandexpansionlocationdatas",
                     localField: "uuid", foreignField: "brandOwnerId",
                     as: "expansionLocationDatas" } },
        { $unwind: { path: "$expansionLocationDatas", preserveNullAndEmptyArrays: true } }
      ]);

      if (overAllBrands.length) {

        /* 1-b  determine current batch window */
        if (!brandBatchDoc) brandBatchDoc = await BrandBatch.create({ batch: 0 });

        let currentBatch = brandBatchDoc.batch;
        const sliceStart = currentBatch * BATCH_SIZE;
        const sliceEnd   = sliceStart + BATCH_SIZE;
        const currentSlice = overAllBrands.slice(sliceStart, sliceEnd);

        const now          = new Date();
      const currMonth = now.getMonth() + 1;
        const currYear     = now.getFullYear();
        const brandsToSend = [];

        for (const br of currentSlice) {

          /* match investor state with brand's expansion states */
          const expansion   = br.expansionLocationDatas?.expansionLocationData;
          const domestic    = expansion?.expansionLocations?.domestic;
          const rawStates   = Array.isArray(domestic?.locations)
                                ? domestic.locations
                                : (domestic?.locations?.state
                                    ? [].concat(domestic.locations.state)
                                    : []);
          const states      = rawStates.map(s => (typeof s === "string" ? s : s?.state)).filter(Boolean);

          if (!states.length) continue;
          if (!states.some(s => s.toLowerCase() === state.toLowerCase())) continue;

          /* check / create BrandEmailCount doc for THIS month */
          let countDoc = await BrandEmailCount.findOne({
            brandId: br.uuid, month: currMonth, year: currYear,
          });
          if (!countDoc) {
            countDoc = await BrandEmailCount.create({
              brandId : br.uuid,
              brandName: br.brandDetails?.brandName || "",
              month   : currMonth,
              year    : currYear,
            });
          }

          if (countDoc.emailCount < MAX_EMAILS_PER_MTH) {
            brandsToSend.push(br);
          }
        } // end for-brands

        /* 1-c  send & count */
        const brandsSentAudit = [];

        for (const br of brandsToSend) {
          await sendInstantApplyLeadLocation(
            fullName,
            email,
            mobileNumber,
            br.brandDetails?.email || "",
            br.brandDetails?.brandName || "",
            `${mainCategory},${subCategory},${childCategory}`,
            `${state},${district},${city}`,
            investmentRange,
            planToInvest,
            readyToInvest
          );

          /* bump BRAND counters (free) */
          await bumpBrandStats({
            brandId       : br.uuid,
            brandName     : br.brandDetails?.brandName || "",
            investorEmail : email,
            kind          : "free",
            senderId      : applyId || applyBy || "unknown",
          });

          brandsSentAudit.push({
            brandId   : br.uuid,
            brandName : br.brandDetails?.brandName || "",
            brandEmail: br.brandDetails?.email  || "",
            emailSent : true,
            emailSentAt: new Date(),
          });

          ignoreEmail.push(br.brandDetails?.email);
        }

        /* 1-d  shift batch pointer  */
        const nextBatch = (currentBatch + 1) % Math.ceil(overAllBrands.length / BATCH_SIZE);
        brandBatchDoc.batch     = nextBatch;
        brandBatchDoc.updatedAt = new Date();
        await brandBatchDoc.save();

        /* 1-e  persist investor log  */
        if (brandsSentAudit.length) {
          await InstantApplyInvestor.create({
            investorEmail : email,
            investorName  : fullName,
            investorPhone : mobileNumber,
            category      : [{ main: mainCategory, sub: subCategory, child: childCategory }],
            location      : { state, city, district },
            investmentRange,
            planToInvest,
            readyToInvest,
            apply   : { applyBy: applyBy || "other", applyId: applyId || "other" },
            brandsSent: brandsSentAudit,
          });
        }

        /* optional response object
        return {
          success      : true,
          message      : "Instant apply processed (free leads).",
          brandsSent   : brandsSentAudit.map(b => ({ brandId: b.brandId, brandName: b.brandName })),
          batch        : currentBatch,
          totalBrands  : overAllBrands.length
        }; */
      }
    } // end FREE branch



    if (!brandBatchDoc?.isPaidLeadsBrandPaused) {

      const paidBrands = await BrandDetails.aggregate([
        { $match: { "brandDetails.isBrandPause": { $ne: true },
                    "brandDetails.payment"     : true,
                    "brandDetails.email"       : { $nin: ignoreEmail } } },
        { $lookup: { from: "brandexpansionlocationdatas",
                     localField: "uuid", foreignField: "brandOwnerId",
                     as: "expansionLocationDatas" } },
        { $unwind: { path: "$expansionLocationDatas", preserveNullAndEmptyArrays: true } }
      ]);

      const now       = new Date();
      const m         = now.getMonth();
      const y         = now.getFullYear();
      const pToSend   = [];

      for (const br of paidBrands) {
        const expansion   = br.expansionLocationDatas?.expansionLocationData;
        const domestic    = expansion?.expansionLocations?.domestic;
        const rawStates   = Array.isArray(domestic?.locations)
                              ? domestic.locations
                              : (domestic?.locations?.state
                                  ? [].concat(domestic.locations.state) : []);
        const states      = rawStates.map(s => (typeof s === "string" ? s : s?.state)).filter(Boolean);
        if (!states.length) continue;
        if (!states.some(s => s.toLowerCase() === state.toLowerCase())) continue;

        pToSend.push(br);
      }

      const paidAudit = [];

      for (const br of pToSend) {
        await sendInstantApplyLeadLocation(
          fullName,
          email,
          mobileNumber,
          br.brandDetails?.email || "",
          br.brandDetails?.brandName || "",
          `${mainCategory},${subCategory},${childCategory}`,
          `${state},${district},${city}`,
          investmentRange,
          planToInvest,
          readyToInvest
        );

        /* bump BRAND counters (premium) */
        await bumpBrandStats({
          brandId       : br.uuid,
          brandName     : br.brandDetails?.brandName || "",
          investorEmail : email,
          kind          : "premium",
          senderId      : applyId || applyBy || "unknown",
        });

        paidAudit.push({
          brandId   : br.uuid,
          brandName : br.brandDetails?.brandName || "",
          brandEmail: br.brandDetails?.email  || "",
          emailSent : true,
          emailSentAt: new Date(),
        });
      }

      /* investor log (paid)  */
      await InstantApplyPaidUserLeadsData.create({
        investorEmail : email,
        investorName  : fullName,
        investorPhone : mobileNumber,
        category      : [{ main: mainCategory, sub: subCategory, child: childCategory }],
        location      : { state, city, district },
        investmentRange,
        planToInvest,
        readyToInvest,
        apply   : { applyBy: applyBy || "other", applyId: applyId || "other" },
        brandsSent: paidAudit,
      });

      /* optional response
      return {
        success    : true,
        message    : "Instant apply processed (paid leads).",
        brandsSent : paidAudit.map(b => ({ brandId: b.brandId, brandName: b.brandName })),
      }; */
    }

  } catch (err) {
    console.error("Error in instantApplyLocationMatch:", err);
    throw err;  // bubble up to job / route handler
  }
};