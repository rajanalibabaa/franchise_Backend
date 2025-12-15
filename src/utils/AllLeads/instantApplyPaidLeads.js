import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { CategoryInvestmentrangeLocationMatch } from "../../model/Leads/categoryInvestmentrangeLocationMatch.model.js";
import { paidLeadInstantApplyEmail } from "../Centralized Email/centralizedEmail.js";
import BrandBatch from "../../model/NewIncomeInvestor/InstantApplyTrackSchema.js";
import { CategoryInvestmentrangeMatch } from "../../model/Leads/categoryInvestmentrangeMatch.model.js";
import { CategoryLocationMatch } from "../../model/Leads/categoryLocationMatch.model.js";
import { LocationInvestmentRangeMatch } from "../../model/Leads/locationInvestmentRangeMatch.model.js";
import { CategoryInvestmentrangeLocationMatchFunction } from "../../controller/Leads/CategoryInvestmentrangeLocationMatch.js";
import { CategoryInvestmentrangeMatchFunction } from "../../controller/Leads/CategoryInvestmentrangeMatch.js";
import { CategoryLocationMatchFunction } from "../../controller/Leads/CategoryLocationMatch.js";
import { LocationInvestmentRangeMatchFunction } from "../../controller/Leads/LocationInvestmentRangeMatch.js";

export const format = (d) => {
  const day = String(d?.getDate()).padStart(2, "0");
  const month = String(d?.getMonth() + 1).padStart(2, "0");
  const year = d?.getFullYear();
  const hours = String(d?.getHours()).padStart(2, "0");
  const minutes = String(d?.getMinutes()).padStart(2, "0");
  const seconds = String(d?.getSeconds()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}; 

export const twoMatchTypesleadcount = async (brand, investorData) => {
  let totalLeadsendcount = 0;
  let exists = false;

  await brand?.categorylocationMatchData?.forEach((r) => {
    if (exists) return;
    const records = r?.categoryLocationMatchRecords;
    const lastRecord = records[records?.length - 1];

    if (lastRecord) {
      if (
        String(lastRecord?.packageStartDate) ===
        String(format(brand.brandDetails?.paymentPackage?.packageUpdatedTime))
      ) {
        lastRecord.records.forEach((monthRec) => {
          if (exists) return;

          monthRec.leadsRecords.forEach((lead) => {
            if (exists) return;

            // console.log("Investor ID categorylocationMatchData =>", lead.investorId);

            if (
              lead.investorId === investorData?.applyId ||
              lead.investorEmail === investorData?.email
            ) {
              exists = true;
              console.log("======categorylocationMatchData stop=======");
              return;
            }
          });
        });

        if (!exists) {
          totalLeadsendcount += lastRecord?.leadCount;
        }
      }
    }
  });

  if (exists === true) {
    console.log("======stop=======");
    return { totalLeadsendcount, exists };
  }

  await brand?.categoryInvestmentrangeMatchData?.forEach((r) => {
    if (exists) return;

    const records = r.categoryInvestmentrangeMatchRecords;
    const lastRecord = records[records?.length - 1];

    if (lastRecord) {
      if (
        String(lastRecord?.packageStartDate) ===
        String(format(brand.brandDetails?.paymentPackage?.packageUpdatedTime))
      ) {
        lastRecord.records.forEach((monthRec) => {
          if (exists) return;

          monthRec.leadsRecords.forEach((lead) => {
            if (exists) return;

            // console.log(
            //   "Investor ID categoryInvestmentrangeMatchData=>",
            //   lead.investorId
            // );

            if (
              lead.investorId === investorData?.applyId ||
              lead.investorEmail === investorData?.email
            ) {
              exists = true;
              console.log("======categoryInvestmentrangeMatchData stop=======");
              return;
            }
          });
        });

        if (!exists) {
          totalLeadsendcount += lastRecord?.leadCount;
        }
      }
    }
  });

  if (exists === true) {
    return { totalLeadsendcount, exists };
  }

  console.log("==== twoMatchTypesleadcount ==== :", totalLeadsendcount);
  return { totalLeadsendcount, exists };
};

export const generateSentLeadsPercentage = async (brand,totalLeadsendcount) => {
  const percentage =
    ((totalLeadsendcount + 1) / brand?.brandDetails?.paymentPackage?.totalLeads) * 100;

  const p = await BrandDetails.findByIdAndUpdate(
     brand._id,
    {
      $set: {
        "brandDetails.paymentPackage.sentLeadsPercentage": `${(
          percentage.toFixed(2)
        )}%`,
        "brandDetails.overAllLeads": brand.brandDetails.overAllLeads + 1,
      },
    },
    {
      new: true,
    }
  );

  // console.log("===p===", p.brandDetails.paymentPackage);
};

export const paidLeadHelperFunction = async (
  investmentRange,
  category,
  location,
  investorData,
  check,
  matchType
) => {
  let brandBatchDoc = await BrandBatch.findOne({});

  const aggregationPipeline = [
    {
      $match: {
        "brandDetails.isBrandPause": { $ne: true },
        "brandDetails.isPaidBrandLeadPaused": { $ne: true },
        "brandDetails.payment": true,
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
  ];

  if (investmentRange) {
    aggregationPipeline.push({
      $match: {
        "franchiseDetails.franchiseDetails.fico.0.investmentRange":
          investmentRange,
      },
    });
  }

  if (category) {
    aggregationPipeline.push({
      $match: {
        "franchiseDetails.franchiseDetails.brandCategories.main":
          category.mainCategory,
        // "franchiseDetails.franchiseDetails.brandCategories.sub":
        //   category.subCategory,
      },
    });
  }

  if (location?.state && !brandBatchDoc.isDistrictMatchPaused) {
    aggregationPipeline.push({
      $match: {
        "expansionLocationDatas.expansionLocationData.expansionLocations.domestic.locations":
          {
            $elemMatch: {
              state: location.state,
              districts: {
                $elemMatch: {
                  district: location.district,
                },
              },
            },
          },
      },
    });
  } else if (location?.state) {
    aggregationPipeline.push({
      $match: {
        "expansionLocationDatas.expansionLocationData.expansionLocations.domestic.locations.state":
          location.state,
      },
    });
  }
  if (matchType === "twoMatchTypes") {
    aggregationPipeline.push(
      {
        $lookup: {
          from: "categoryinvestmentrangematches",
          localField: "uuid",
          foreignField: "brandId",
          as: "categoryInvestmentrangeMatchData",
        },
      },
      {
        $lookup: {
          from: "categorylocationmatches",
          localField: "uuid",
          foreignField: "brandId",
          as: "categorylocationMatchData",
        },
      },
      {
        $lookup: {
          from: "locationinvestmentrangematches",
          localField: "uuid",
          foreignField: "brandId",
          as: "LocationInvestmentRangeMatchData",
        },
      }
    );
  }
  if (matchType === "threeMatchTypes") {
    aggregationPipeline.push({
      $lookup: {
        from: "categoryinvestmentrangelocationmatches",
        localField: "uuid",
        foreignField: "brandId",
        as: "categoryinvestmentrangelocationMatchData",
      },
    });
  }

  const projectStage = {
    _id: 1,
    uuid: 1,
    brandID: 1,
    brandDetails: 1,
    franchiseDetails: 1,
    uploads: 1,
    expansionLocationDatas: 1,
    createdAt: 1,
    updatedAt: 1,
  };

  if (matchType === "twoMatchTypes") {
    projectStage.categoryInvestmentrangeMatchData = 1;
    projectStage.categorylocationMatchData = 1;
    projectStage.LocationInvestmentRangeMatchData = 1;
  }
  if (matchType === "threeMatchTypes") {
    projectStage.categoryinvestmentrangelocationMatchData = 1;
  }

  aggregationPipeline.push({ $project: projectStage });

  const OverAllBrandExists = await BrandDetails.aggregate(aggregationPipeline);
  console.log("Paid Leads: Total eligible brands =", OverAllBrandExists.length);

  let brandsSent = [];

  if (OverAllBrandExists.length > 0) {
    for (const brand of OverAllBrandExists) {
      if (
        !brandBatchDoc.isPaidCategoryInvestmentrangeLocationLeadsPaused &&
        "CategoryInvestmentrangeLocation" === check
      ) {
        await CategoryInvestmentrangeLocationMatchFunction(brand, investorData);

        console.log("===000=== :", brand.uuid);
        brandsSent.push({
          brandId: brand.uuid,
          brandName: brand.brandDetails?.brandName || "",
          brandEmail: brand.brandDetails?.email || "",
          emailSent: true,
          emailSentAt: new Date(),
          paidBrand: Boolean(true),
          leadMatchBy: ["Category_Investmentrange_LocationMatch"],
        });
      }
      if (
        !brandBatchDoc.isPaidCategoryLocationPaused &&
        "CategoryLocation" === check
      ) {
        console.log("category &&  && location");
        const exists = await CategoryLocationMatchFunction(brand, investorData);
        if (!exists) {
          
          brandsSent.push({
          brandId: brand.uuid,
          brandName: brand.brandDetails?.brandName || "",
          brandEmail: brand.brandDetails?.email || "",
          emailSent: true,
          emailSentAt: new Date(),
          paidBrand: Boolean(true),
          leadMatchBy: ["Category_LocationMatch"],
        });
        
        }
        console.log("======stop brandsSent=======")
        
      }
      if (
        !brandBatchDoc.isPaidCategoryInvestmentrangePaused &&
        "CategoryInvestmentrange" === check
      ) {
        console.log("category && investmentRange && ");
        const exists = await CategoryInvestmentrangeMatchFunction(brand, investorData);
        if (!exists) {
          brandsSent.push({
          brandId: brand.uuid,
          brandName: brand.brandDetails?.brandName || "",
          brandEmail: brand.brandDetails?.email || "",
          emailSent: true,
          emailSentAt: new Date(),
          paidBrand: Boolean(true),
          leadMatchBy: ["Category_Investmentrange"],
        }); 
        }
                  console.log("======stop brandsSent=======")

        
      }
      if (
        !brandBatchDoc.isPaidLocationInvestmentRangeLeadsPaused &&
        "LocationInvestmentRange" === check
      ) {
        console.log(" && investmentRange && location");
        await LocationInvestmentRangeMatchFunction(brand, investorData);
        brandsSent.push({
          brandId: brand.uuid,
          brandName: brand.brandDetails?.brandName || "",
          brandEmail: brand.brandDetails?.email || "",
          emailSent: true,
          emailSentAt: new Date(),
          paidBrand: Boolean(true),
          leadMatchBy: ["Location_Investmentrange"],
        });
      }
    }
  }
  return brandsSent;
};
