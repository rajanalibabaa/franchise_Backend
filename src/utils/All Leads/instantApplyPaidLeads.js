import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { CategoryInvestmentrangeLocationMatch } from "../../model/Leads/categoryInvestmentrangeLocationMatch.model.js";
import { paidLeadInstantApplyEmail } from "../Centralized Email/centralizedEmail.js";
import BrandBatch from "../../model/NewIncomeInvestor/InstantApplyTrackSchema.js";
import { CategoryInvestmentrangeMatch } from "../../model/Leads/categoryInvestmentrangeMatch.model.js";
import { CategoryLocationMatch } from "../../model/Leads/categoryLocationMatch.model.js";
import { LocationInvestmentRangeMatch } from "../../model/Leads/locationInvestmentRangeMatch.model.js";

const CategoryInvestmentrangeLocationMatchFunction = async (
  brand,
  investorData
) => {
  // console.log("brand :",brand);

  const currentDate = new Date();
  const date = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const monthYear = `${month}-${year}`;
  let brandDoc = await CategoryInvestmentrangeLocationMatch.findOne({
    brandId: brand.uuid,
  });

  if (!brandDoc) {
    brandDoc = await CategoryInvestmentrangeLocationMatch.create({
      brandId: brand.uuid,
      brandName: brand.brandDetails?.brandName || "",
      "currentMonthMatch.month": month,
    });
  }

  if (month > brandDoc.currentMonthMatch.month) {
    brandDoc = await CategoryInvestmentrangeLocationMatch.findByIdAndUpdate(
      brandDoc._id,
      {
        $set: {
          "currentMonthMatch.month": month,
          "currentMonthMatch.match": 0,
        },
        $push: {
          categoryInvestmentrangeLocationMatchRecords: {
            $each: [
              {
                monthYear: monthYear,
                count: 0,
                records: [],
              },
            ],
            $position: 0,
          },
        },
      },
      {
        new: true,
      }
    );
  }
  // console.log("brandDoc :", brandDoc);

  await paidLeadInstantApplyEmail(
    investorData?.fullName,
    investorData.email,
    investorData.mobileNumber,
    brand.brandDetails.email,
    brand.brandDetails.companyName,
    investorData.category,
    investorData.location,
    investorData.investmentRange,
    investorData.planToInvest,
    investorData.readyToInvest,
    "instantApply_LeadLocation_template"
  )

  brandDoc = await CategoryInvestmentrangeLocationMatch.findByIdAndUpdate(
    brandDoc._id,
    {
      $inc: {
        "currentMonthMatch.match": 1,
        "categoryInvestmentrangeLocationMatchRecords.0.count": 1,
        categoryInvestmentrangeLocationMatch: 1,
      },
      $push: {
        "categoryInvestmentrangeLocationMatchRecords.0.records": {
          $each: [
            {
              investorId: investorData?.applyId,
              investorName: investorData?.fullName,
              investorEmail: investorData?.email,
              investorMobile: investorData?.mobileNumber,
            },
          ],
          $position: 0,
        },
      },
    },
    {
      new: true,
    }
  );
  console.log("brandDoc :", brandDoc);

  return;
};
const CategoryInvestmentrangeMatchFunction = async (
  brand,
  investorData
) => {
  // console.log("brand :",brand);

  const currentDate = new Date();
  const date = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const monthYear = `${month}-${year}`;
  let brandDoc = await CategoryInvestmentrangeMatch.findOne({
    brandId: brand.uuid,
  });

  if (!brandDoc) {
    brandDoc = await CategoryInvestmentrangeMatch.create({
      brandId: brand.uuid,
      brandName: brand.brandDetails?.brandName || "",
      "currentMonthMatch.month": month,
    });
  }

  if (month > brandDoc.currentMonthMatch.month) {
    brandDoc = await CategoryInvestmentrangeLocationMatch.findByIdAndUpdate(
      brandDoc._id,
      {
        $set: {
          "currentMonthMatch.month": month,
          "currentMonthMatch.match": 0,
        },
        $push: {
          categoryInvestmentrangeMatchRecords: {
            $each: [
              {
                monthYear: monthYear,
                count: 0,
                records: [],
              },
            ],
            $position: 0,
          },
        },
      },
      {
        new: true,
      }
    );
  }

  // await paidLeadInstantApplyEmail(
  //   investorData?.fullName,
  //   investorData.email,
  //   investorData.mobileNumber,
  //   brand.brandDetails.email,
  //   brand.brandDetails.companyName,
  //   investorData.category,
  //   investorData.location,
  //   investorData.investmentRange,
  //   investorData.planToInvest,
  //   investorData.readyToInvest,
  //   "instantApply_LeadLocation_template"
  // )

  brandDoc = await CategoryInvestmentrangeMatch.findByIdAndUpdate(
    brandDoc._id,
    {
      $inc: {
        "currentMonthMatch.match": 1,
        "categoryInvestmentrangeMatchRecords.0.count": 1,
        categoryInvestmentrangeMatch: 1,
      },
      $push: {
        "categoryInvestmentrangeMatchRecords.0.records": {
          $each: [
            {
              investorId: investorData?.applyId,
              investorName: investorData?.fullName,
              investorEmail: investorData?.email,
              investorMobile: investorData?.mobileNumber,
            },
          ],
          $position: 0,
        },
      },
    },
    {
      new: true,
    }
  );
  console.log("brandDoc :", brandDoc);

  return;
};
const CategoryLocationMatchFunction = async (
  brand,
  investorData
) => {
  // console.log("brand :",brand);

  const currentDate = new Date();
  const date = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const monthYear = `${month}-${year}`;
  let brandDoc = await CategoryLocationMatch.findOne({
    brandId: brand.uuid,
  });

  if (!brandDoc) {
    brandDoc = await CategoryLocationMatch.create({
      brandId: brand.uuid,
      brandName: brand.brandDetails?.brandName || "",
      "currentMonthMatch.month": month,
    });
  }

  if (month > brandDoc.currentMonthMatch.month) {
    brandDoc = await CategoryInvestmentrangeLocationMatch.findByIdAndUpdate(
      brandDoc._id,
      {
        $set: {
          "currentMonthMatch.month": month,
          "currentMonthMatch.match": 0,
        },
        $push: {
          categoryLocationMatchRecords: {
            $each: [
              {
                monthYear: monthYear,
                count: 0,
                records: [],
              },
            ],
            $position: 0,
          },
        },
      },
      {
        new: true,
      }
    );
  }
  // console.log("brandDoc :", brandDoc);

  // await paidLeadInstantApplyEmail(
  //   investorData?.fullName,
  //   investorData.email,
  //   investorData.mobileNumber,
  //   brand.brandDetails.email,
  //   brand.brandDetails.companyName,
  //   investorData.category,
  //   investorData.location,
  //   investorData.investmentRange,
  //   investorData.planToInvest,
  //   investorData.readyToInvest,
  //   "instantApply_LeadLocation_template"
  // )

  brandDoc = await CategoryLocationMatch.findByIdAndUpdate(
    brandDoc._id,
    {
      $inc: {
        "currentMonthMatch.match": 1,
        "categoryLocationMatchRecords.0.count": 1,
        categoryLocationMatch: 1,
      },
      $push: {
        "categoryLocationMatchRecords.0.records": {
          $each: [
            {
              investorId: investorData?.applyId,
              investorName: investorData?.fullName,
              investorEmail: investorData?.email,
              investorMobile: investorData?.mobileNumber,
            },
          ],
          $position: 0,
        },
      },
    },
    {
      new: true,
    }
  );
  console.log("brandDoc :", brandDoc);

  return;
};
const LocationInvestmentRangeMatchFunction = async (
  brand,
  investorData
) => {
  // console.log("brand :",brand);

  const currentDate = new Date();
  const date = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const monthYear = `${month}-${year}`;
  let brandDoc = await LocationInvestmentRangeMatch.findOne({
    brandId: brand.uuid,
  });

  if (!brandDoc) {
    brandDoc = await LocationInvestmentRangeMatch.create({
      brandId: brand.uuid,
      brandName: brand.brandDetails?.brandName || "",
      "currentMonthMatch.month": month,
    });
  }

  if (month > brandDoc.currentMonthMatch.month) {
    brandDoc = await CategoryInvestmentrangeLocationMatch.findByIdAndUpdate(
      brandDoc._id,
      {
        $set: {
          "currentMonthMatch.month": month,
          "currentMonthMatch.match": 0,
        },
        $push: {
          locationInvestmentRangeMatchRecords: {
            $each: [
              {
                monthYear: monthYear,
                count: 0,
                records: [],
              },
            ],
            $position: 0,
          },
        },
      },
      {
        new: true,
      }
    );
  }
  // console.log("brandDoc :", brandDoc);

  // await paidLeadInstantApplyEmail(
  //   investorData?.fullName,
  //   investorData.email,
  //   investorData.mobileNumber,
  //   brand.brandDetails.email,
  //   brand.brandDetails.companyName,
  //   investorData.category,
  //   investorData.location,
  //   investorData.investmentRange,
  //   investorData.planToInvest,
  //   investorData.readyToInvest,
  //   "instantApply_LeadLocation_template"
  // )

  brandDoc = await LocationInvestmentRangeMatch.findByIdAndUpdate(
    brandDoc._id,
    {
      $inc: {
        "currentMonthMatch.match": 1,
        "locationInvestmentRangeMatchRecords.0.count": 1,
        locationInvestmentRangeMatch: 1,
      },
      $push: {
        "locationInvestmentRangeMatchRecords.0.records": {
          $each: [
            {
              investorId: investorData?.applyId,
              investorName: investorData?.fullName,
              investorEmail: investorData?.email,
              investorMobile: investorData?.mobileNumber,
            },
          ],
          $position: 0,
        },
      },
    },
    {
      new: true,
    }
  );
  console.log("brandDoc :", brandDoc);

  return;
};

export const paidLeadHelperFunction = async (
  investmentRange,
  category,
  location,
  investorData,
  check
) => {

  const aggregationPipeline = [
    {
      $match: {
        "brandDetails.isBrandPause": { $ne: true },
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
        "franchiseDetails.franchiseDetails.brandCategories.sub":
          category.subCategory,
      },
    });
  }

  if (location?.state && location?.district) {
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

  aggregationPipeline.push({
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
  });

  const OverAllBrandExists = await BrandDetails.aggregate(aggregationPipeline);
  console.log("Paid Leads: Total eligible brands =", OverAllBrandExists.length);

  let brandBatchDoc = await BrandBatch.findOne({});

  let brandsSent = [];

  if (OverAllBrandExists.length > 0) {
    for (const brand of OverAllBrandExists) {
      if (!brandBatchDoc.isPaidCategoryInvestmentrangeLocationLeadsPaused && "CategoryInvestmentrangeLocation" === check) {
        await CategoryInvestmentrangeLocationMatchFunction(
          brand,
          investorData
        );

        console.log("===000=== :",brand.uuid);
        brandsSent.push({
          brandId: brand.uuid,
          brandName: brand.brandDetails?.brandName || "",
          brandEmail: brand.brandDetails?.email || "",
          emailSent: true,
          emailSentAt: new Date(),
          paidBrand:Boolean(true),
          leadMatchBy:"Category_Investmentrange_LocationMatch"
        });
      }
      if (!brandBatchDoc.isPaidCategoryLocationPaused && "CategoryLocation" === check) {
        console.log("category &&  && location");
        await CategoryLocationMatchFunction(
          brand,
          investorData
        )
        brandsSent.push({
          brandId: brand.uuid,
          brandName: brand.brandDetails?.brandName || "",
          brandEmail: brand.brandDetails?.email || "",
          emailSent: true,
          emailSentAt: new Date(),
          paidBrand:Boolean(true),
          leadMatchBy:"Category_LocationMatch"

        });
      }
      if (!brandBatchDoc.isPaidCategoryInvestmentrangePaused && "CategoryInvestmentrange" === check) {
        console.log("category && investmentRange && ");
        await CategoryInvestmentrangeMatchFunction(
          brand,
          investorData
        )
        brandsSent.push({
          brandId: brand.uuid,
          brandName: brand.brandDetails?.brandName || "",
          brandEmail: brand.brandDetails?.email || "",
          emailSent: true,
          emailSentAt: new Date(),
          paidBrand:Boolean(true),
          leadMatchBy:"Category_Investmentrange"

        });
      }
      if (!brandBatchDoc.isPaidLocationInvestmentRangeLeadsPaused && "LocationInvestmentRange" === check) {
        console.log(" && investmentRange && location");
        await LocationInvestmentRangeMatchFunction(
          brand,
          investorData
        )
        brandsSent.push({
          brandId: brand.uuid,
          brandName: brand.brandDetails?.brandName || "",
          brandEmail: brand.brandDetails?.email || "",
          emailSent: true,
          emailSentAt: new Date(),
          paidBrand:Boolean(true),
          leadMatchBy:"Location_Investmentrange"
        });
      }
    }
  }
  return brandsSent
};
