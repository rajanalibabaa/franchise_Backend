import InstantApplyInvestor from "../../model/NewIncomeInvestor/InstantApplyLocationSchema.js";
import BrandBatch from "../../model/NewIncomeInvestor/InstantApplyTrackSchema.js";
import SystemConfig from "../../model/NewIncomeInvestor/SystemConfigSchema.js";
import BrandEmailCount from "../../model/NewIncomeInvestor/BrandEmailCountSchema.js";
import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { paidLeadHelperFunction } from "./instantApplyPaidLeads.js";

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
  // console.log("Starting instantApplyLocationMatch with parameters:", {
  //   fullName,
  //   email,
  //   mobileNumber,
  //   brandName,
  //   brandId,
  //   brandEmail,
  //   mainCategory,
  //   subCategory,
  //   childCategory,
  //   state,
  //   district,
  //   city,
  //   investmentRange,
  //   planToInvest,
  //   readyToInvest,
  //   applyBy,
  //   applyId,
  //   brandLogo,
  // });
  // console.log(
  //   "data",
  //   email,
  //   mobileNumber,
  //   brandName,
  //   brandId,
  //   brandEmail,
  //   mainCategory,
  //   subCategory,
  //   childCategory,
  //   state,
  //   district,
  //   city,
  //   investmentRange,
  //   planToInvest,
  //   readyToInvest,
  //   applyBy,
  //   applyId,
  //   brandLogo
  // );

  const config = await SystemConfig.findOne();
  const BATCH_SIZE = config?.batchSize || 7;
  const MAX_EMAILS_PER_MONTH = config?.maxEmailsPerMonth || 5;

  // Ensure required params are present
  if (!state) {
    throw new Error("State is required for instantApplyLocationMatch");
  }

  const now = new Date();

  // Ensure brandBatchDoc exists before accessing its properties
  let brandBatchDoc = await BrandBatch.findOne({});
  if (!brandBatchDoc) {
    brandBatchDoc = await BrandBatch.create({
      batch: 0,
      isFreeLeadsBrandPaused: false,
      isPaidLeadsBrandPaused: false,
    });
  }

  try {
    let brandsSent = [];
    if (!brandBatchDoc.isFreeLeadsBrandPaused) {
      const aggregationPipeline = [
        {
          $match: {
            "brandDetails.isBrandPause": { $ne: true },
            "brandDetails.payment": false,
          },
        },
        {
          $lookup: {
            from: "brandfranchisedetails",
            localField: "uuid",
            foreignField: "brandOwnerId",
            as: "franchiseDetails",
          },
        },
        {
          $lookup: {
            from: "branduploads",
            localField: "uuid",
            foreignField: "brandOwnerId",
            as: "uploads",
          },
        },
        {
          $lookup: {
            from: "brandexpansionlocationdatas",
            localField: "uuid",
            foreignField: "brandOwnerId",
            as: "expansionLocationDatas",
          },
        },
        {
          $unwind: {
            path: "$franchiseDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$uploads",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$expansionLocationDatas",
            preserveNullAndEmptyArrays: true,
          },
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
            updatedAt: 1,
          },
        },
      ];

      const OverAllBrandExists = await BrandDetails.aggregate(
        aggregationPipeline
      );
      console.log(
        "free Leads: Total eligible brands =",
        OverAllBrandExists.length
      );

      if (OverAllBrandExists.length > 0) {
        if (!brandBatchDoc) {
          brandBatchDoc = await BrandBatch.create({ batch: 0 });
        }

        // Calculate current batch slice
        let currentBatch = brandBatchDoc?.batch;
        const start = currentBatch * BATCH_SIZE;
        const end = start + BATCH_SIZE;
        const currentSlice = OverAllBrandExists.slice(start, end);

        // console.log(`Processing batch ${currentBatch} with ${currentSlice.length} brands`);

        const brandsToSend = [];

        for (const brand of currentSlice) {
          // console.log("Checking brand:", brand.brandDetails?.brandName);

          // Improved location extraction with proper null checks
          const expansionData =
            brand.expansionLocationDatas?.expansionLocationData;
          const domesticLocations = expansionData?.expansionLocations?.domestic;

          // console.log("domesticLocations", domesticLocations);

          // Handle both array and object formats for locations
          let locations = [];
          if (Array.isArray(domesticLocations?.locations)) {
            locations = domesticLocations.locations
              .map((loc) => (typeof loc === "string" ? loc : loc?.state))
              .filter(Boolean);
          } else if (domesticLocations?.locations?.state) {
            locations = Array.isArray(domesticLocations.locations.state)
              ? domesticLocations.locations.state
              : [domesticLocations.locations.state];
          }

          // console.log("Locations for brand:", locations);

          if (locations.length === 0) {
            continue; // Skip if no locations to match
          }

          // Case-insensitive state matching
          const normalizedState = state.toLowerCase();
          const match = locations.some((loc) => {
            if (!loc) return false;
            return loc.toString().toLowerCase() === normalizedState;
          });

          if (!match) continue;

          // OLD CODE - COMMENTED OUT
          const monthYear = new Date().toLocaleString("default", {
            month: "short",
            year: "numeric",
          });

          let brandDoc = await BrandEmailCount.findOne({
            brandId: brand.uuid,
            brandName: brand.brandDetails?.brandName || "",
          });

          if (!brandDoc) {
            brandDoc = await BrandEmailCount.create({
              brandId: brand.uuid,
              brandName: brand.brandDetails?.brandName || "",
              FreeEmailCount: 0,
              freeEmailRecords: [],
            });
          }

          let monthRecord = brandDoc.freeEmailRecords.find(
            (r) => r.monthYear === monthYear
          );

          console.log(monthRecord, "monthRecord");
          if (!monthRecord) {
            monthRecord = {
              monthYear,
              count: 0,
              records: [],
            };
            brandDoc.freeEmailRecords.push(monthRecord);
          }

          // ✅ Now safely push investor record
          const investorData = {
            investorId: applyId || "",
            investorName: fullName,
            investorEmail: email,
            investorMobile: mobileNumber,
            sentAt: now,  
          };

          // ⚠️ Mongoose doesn’t auto-track deep nested array mutation sometimes,
          // so we reassign after mutation to ensure change tracking.
          const monthIndex = brandDoc.freeEmailRecords.findIndex(
            (r) => r.monthYear === monthYear
          );
          brandDoc.freeEmailRecords[monthIndex].records.push(investorData);
          brandDoc.freeEmailRecords[monthIndex].count += 1;

          // ✅ Increment total count
          brandDoc.freeEmailCount += 1;

          // 🚀 Force mongoose to detect nested change
          brandDoc.markModified("freeEmailRecords");

          // 💾 Finally save
          await brandDoc.save();

          console.log(
            "✅ Investor record stored successfully for",
            brandDoc.brandName
          );
          if (brandDoc.freeEmailCount < MAX_EMAILS_PER_MONTH) {
            brandsToSend.push({ brand, brandDoc });
          }
        }

        if (brandsToSend?.length === 0) {
          // Move to next batch if no matches in current batch
          currentBatch =
            (currentBatch + 1) %
            Math.ceil(OverAllBrandExists.length / BATCH_SIZE);
          brandBatchDoc.batch = currentBatch;
          await brandBatchDoc.save();
        }

        if (brandsToSend.length > 0) {
          for (const { brand, currentStats } of brandsToSend) {
            // await sendInstantApplyLeadLocation(
            //   fullName,
            //   email,
            //   mobileNumber,
            //   brand.brandDetails?.email || "",
            //   brand.brandDetails?.brandName || "",
            //   `${mainCategory},${subCategory},${childCategory}`,
            //   `${state},${district},${city}`,
            //   investmentRange,
            //   planToInvest,
            //   readyToInvest
            // );

            brandsSent.push({
              brandId: brand.uuid,
              brandName: brand.brandDetails?.brandName || "",
              brandEmail: brand.brandDetails?.email || "",
              emailSent: true,
              emailSentAt: new Date(),
              leadMatchBy: ["location"],
            });
          }

          // Update to next batch for next run
          const nextBatch =
            (currentBatch + 1) %
            Math.ceil(OverAllBrandExists.length / BATCH_SIZE);
          brandBatchDoc.batch = nextBatch;
          brandBatchDoc.updatedAt = new Date();
          await brandBatchDoc.save();
        }
      }
    }
    let catogory = {
      mainCategory,
      subCategory,
      childCategory,
    };
    let location = {
      state,
      district,
      city,
    };
    const investerData = {
      fullName,
      email,
      mobileNumber,
      planToInvest,
      readyToInvest,
      applyBy,
      applyId,
      location,
      catogory,
      investmentRange,
    };

    if (!brandBatchDoc.isPaidCategoryInvestmentrangeLocationLeadsPaused) {
      const result = await paidLeadHelperFunction(
        investmentRange,
        catogory,
        location,
        investerData,
        "CategoryInvestmentrangeLocation",
        "threeMatchTypes"
      );

      // console.log("threeMatchTypes result:", result);
      if (result.length > 0) {
        result.forEach((d) => {
          const existingIndex = brandsSent.findIndex(
            (i) => i.brandId === d.brandId
          );

          if (existingIndex === -1) {
            brandsSent.push(d);
          } else {
            const existing = brandsSent[existingIndex];

            d.leadMatchBy.forEach((type) => {
              if (!existing.leadMatchBy.includes(type)) {
                existing.leadMatchBy.push(type);
              }
            });
          }
        });
      }
    }
    if (!brandBatchDoc.isPaidCategoryLocationPaused) {
      const result = await paidLeadHelperFunction(
        false,
        catogory,
        location,
        investerData,
        "CategoryLocation",
        "twoMatchTypes"
      );
      // console.log("twoMatchTypes result:", result);
      if (result.length > 0) {
        result.forEach((d) => {
          const existingIndex = brandsSent.findIndex(
            (i) => i.brandId === d.brandId
          );

          if (existingIndex === -1) {
            brandsSent.push(d);
          } else {
            const existing = brandsSent[existingIndex];

            d.leadMatchBy.forEach((type) => {
              if (!existing.leadMatchBy.includes(type)) {
                existing.leadMatchBy.push(type);
              }
            });
          }
        });
      }
    }
    if (!brandBatchDoc.isPaidCategoryInvestmentrangePaused) {
      const result = await paidLeadHelperFunction(
        false,
        catogory,
        false,
        investerData,
        "CategoryInvestmentrange",
        "twoMatchTypes"
      );
      // console.log("twoMatchTypes result:", result);
      if (result.length > 0) {
        result.forEach((d) => {
          const existingIndex = brandsSent.findIndex(
            (i) => i.brandId === d.brandId
          );

          if (existingIndex === -1) {
            brandsSent.push(d);
          } else {
            const existing = brandsSent[existingIndex];

            d.leadMatchBy.forEach((type) => {
              if (!existing.leadMatchBy.includes(type)) {
                existing.leadMatchBy.push(type);
              }
            });
          }
        });
      }
    }
    if (!brandBatchDoc.isPaidLocationInvestmentRangeLeadsPaused) {
      const result = await paidLeadHelperFunction(
        investmentRange,
        false,
        location,
        investerData,
        "LocationInvestmentRange",
        "twoMatchTypes"
      );
      // console.log("twoMatchTypes result:", result);
      if (result.length > 0) {
        result.forEach((d) => {
          const existingIndex = brandsSent.findIndex(
            (i) => i.brandId === d.brandId
          );

          if (existingIndex === -1) {
            brandsSent.push(d);
          } else {
            const existing = brandsSent[existingIndex];

            d.leadMatchBy.forEach((type) => {
              if (!existing.leadMatchBy.includes(type)) {
                existing.leadMatchBy.push(type);
              }
            });
          }
        });
      }
    }
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
      brandsSent: brandsSent,
    });
  } catch (error) {
    console.error("Error in instantApplyLocationMatch:", error);
    throw error;
  }
};
