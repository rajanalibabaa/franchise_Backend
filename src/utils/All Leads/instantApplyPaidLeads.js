import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { CategoryInvestmentrangeLocationMatch } from "../../model/Leads/categoryInvestmentrangeLocationMatch.model.js";
import { paidLeadInstantApplyEmail } from "../Centralized Email/centralizedEmail.js";
import BrandBatch from "../../model/NewIncomeInvestor/InstantApplyTrackSchema.js";
import { CategoryInvestmentrangeMatch } from "../../model/Leads/categoryInvestmentrangeMatch.model.js";
import { CategoryLocationMatch } from "../../model/Leads/categoryLocationMatch.model.js";
import { LocationInvestmentRangeMatch } from "../../model/Leads/locationInvestmentRangeMatch.model.js";

const format = (d) => {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

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
// const CategoryInvestmentrangeMatchFunction = async (
//   brand,
//   investorData
// ) => {
//   console.log("brand :",brand.brandDetails.paymentPackage);

//   const currentDate = new Date();
//   const date = currentDate.getDate();
//   const month = currentDate.getMonth() + 1;
//   const year = currentDate.getFullYear();
//   const monthYear = `${month}-${year}`;
//   let brandDoc = await CategoryInvestmentrangeMatch.findOne({
//     brandId: brand.uuid,
//   });

//   if (!brandDoc) {
//     brandDoc = await CategoryInvestmentrangeMatch.create({
//       brandId: brand.uuid,
//       brandName: brand.brandDetails?.brandName || "",
//       "currentMonthMatch.month": month,
//     });
//   }

//   if (month > brandDoc.currentMonthMatch.month) {
//     brandDoc = await CategoryInvestmentrangeMatch.findByIdAndUpdate(
//       brandDoc._id,
//       {
//         $set: {
//           "currentMonthMatch.month": month,
//           "currentMonthMatch.match": 0,
//         },
//         $push: {
//           categoryInvestmentrangeMatchRecords: {
//             $each: [
//               {
//                 monthYear: monthYear,
//                 count: 0,
//                 records: [],
//               },
//             ],
//             $position: 0,
//           },
//         },
//       },
//       {
//         new: true,
//       }
//     );
//   }

//   // await paidLeadInstantApplyEmail(
//   //   investorData?.fullName,
//   //   investorData.email,
//   //   investorData.mobileNumber,
//   //   brand.brandDetails.email,
//   //   brand.brandDetails.companyName,
//   //   investorData.category,
//   //   investorData.location,
//   //   investorData.investmentRange,
//   //   investorData.planToInvest,
//   //   investorData.readyToInvest,
//   //   "instantApply_LeadLocation_template"
//   // )

//   brandDoc = await CategoryInvestmentrangeMatch.findByIdAndUpdate(
//     brandDoc._id,
//     {
//       $inc: {
//         "currentMonthMatch.match": 1,
//         "categoryInvestmentrangeMatchRecords.0.count": 1,
//         categoryInvestmentrangeMatch: 1,
//       },
//       $push: {
//         "categoryInvestmentrangeMatchRecords.0.records": {
//           $each: [
//             {
//               investorId: investorData?.applyId,
//               investorName: investorData?.fullName,
//               investorEmail: investorData?.email,
//               investorMobile: investorData?.mobileNumber,
//             },
//           ],
//           $position: 0,
//         },
//       },
//     },
//     {
//       new: true,
//     }
//   );
//   console.log("brandDoc :", brandDoc);

//   return;
// };

const CategoryInvestmentrangeMatchFunction = async (brand, investorData) => {
  console.log("brand :", brand);

  const currentDate = new Date();
  const paymentPackage = brand.brandDetails?.paymentPackage;

  if (!paymentPackage?.packageUpdatedTime) {
    console.log("⚠️ No packageUpdatedTime found");
    return;
  }

  // Package start & end dates
  const packageStartDate = new Date(paymentPackage.packageUpdatedTime);
  const totalMonths = paymentPackage.totalMonths || 1;

  const packageEndDate = new Date(packageStartDate);
  packageEndDate.setMonth(packageEndDate.getMonth() + totalMonths);

  // Prepare all monthly ranges
  const monthRanges = [];
  let cursor = new Date(packageStartDate);

  for (let i = 0; i < totalMonths; i++) {
    const mStart = new Date(cursor);
    const mEnd = new Date(cursor);
    mEnd.setMonth(mEnd.getMonth() + 1);

    monthRanges.push({
      monthNumber: i + 1,
      startDate: mStart,
      endDate: mEnd,
      isActive: currentDate >= mStart && currentDate < mEnd,
    });

    cursor = new Date(mEnd);
  }

  const active = monthRanges.find((m) => m.isActive);
  if (!active) return;

  const formattedRange = `${format(active.startDate)} → ${format(
    active.endDate
  )}`;

  // -------------------------------
  // 1️⃣ FETCH BRAND DOC
  // -------------------------------
  let brandDoc = await CategoryInvestmentrangeMatch.findOne({
    brandId: brand.uuid,
  });

  // -------------------------------
  // 1a️⃣ CREATE IF NOT EXISTS
  // -------------------------------
  if (!brandDoc) {
    brandDoc = await CategoryInvestmentrangeMatch.create({
      brandId: brand.uuid,
      brandName: brand.brandDetails?.brandName,

      categoryInvestmentrangeMatchRecords: [
        {
          packageType: paymentPackage.packageType,
          packageStartDate: format(packageStartDate),
          packageEndDate: format(packageEndDate),
          leadCount: 0,
          records: [
            {
              monthYear: formattedRange,
              count: 0,
              leadsRecords: [],
            },
          ],
        },
      ],
    });

    console.log("🟢 Created new brandDoc");
  }

  // -----------------------------------------------------------------------
  // 1b️⃣ NEW LOGIC: If first packageStartDate is different → PUSH NEW PACKAGE
  // -----------------------------------------------------------------------
  if (
    brandDoc.categoryInvestmentrangeMatchRecords.length > 0 &&
    brandDoc.categoryInvestmentrangeMatchRecords[0].packageStartDate !==
      format(packageStartDate)
  ) {
    console.log("🟠 Different packageStartDate detected → pushing new package");

    await CategoryInvestmentrangeMatch.updateOne(
      { _id: brandDoc._id },
      {
        $push: {
          categoryInvestmentrangeMatchRecords: {
            packageType: paymentPackage.packageType,
            packageStartDate: format(packageStartDate),
            packageEndDate: format(packageEndDate),
            leadCount: 0,
            records: [
              {
                monthYear: formattedRange,
                count: 0,
                leadsRecords: [],
              },
            ],
          },
        },
      }
    );

    brandDoc = await CategoryInvestmentrangeMatch.findById(brandDoc._id);
  }

  // -------------------------------
  // 2️⃣ FIND PACKAGE INDEX
  // -------------------------------
  const pkgIndex = brandDoc.categoryInvestmentrangeMatchRecords.findIndex(
    (r) =>
      r.packageStartDate === format(packageStartDate) &&
      r.packageEndDate === format(packageEndDate)
  );

  const updatePath = `categoryInvestmentrangeMatchRecords.${pkgIndex}.records`;

  // -------------------------------
  // 3️⃣ CHECK MONTH ENTRY
  // -------------------------------
  const monthIndex = brandDoc.categoryInvestmentrangeMatchRecords[
    pkgIndex
  ].records.findIndex((r) => r.monthYear === formattedRange);

  if (monthIndex === -1) {
    await CategoryInvestmentrangeMatch.updateOne(
      { _id: brandDoc._id },
      {
        $push: {
          [updatePath]: {
            monthYear: formattedRange,
            count: 0,
            leadsRecords: [],
          },
        },
      }
    );
  }

  // -------------------------------
  // 4️⃣ ADD LEAD ENTRY + COUNTS
  // -------------------------------
  await CategoryInvestmentrangeMatch.updateOne(
    {
      _id: brandDoc._id,
      [`${updatePath}.monthYear`]: formattedRange,
    },
    {
      $inc: {
        [`${updatePath}.$.count`]: 1,
        [`categoryInvestmentrangeMatchRecords.${pkgIndex}.leadCount`]: 1,
      },
      $push: {
        [`${updatePath}.$.leadsRecords`]: {
          investorId: investorData?.applyId,
          investorName: investorData?.fullName,
          investorEmail: investorData?.email,
          investorMobile: investorData?.mobileNumber,
          sentAt: new Date(),
        },
      },
    }
  );

  console.log("🔥 Data updated successfully");
  return;
};

const CategoryLocationMatchFunction = async (brand, investorData) => {
  const paymentPackage = brand.brandDetails?.paymentPackage;
  if (!paymentPackage?.packageUpdatedTime) {
    console.log("⚠️ No packageUpdatedTime found");
    return;
  }

  const currentDate = new Date();
  const startDate = new Date(paymentPackage.packageUpdatedTime);
  const totalMonths = paymentPackage.totalMonths || 1;

  const monthRanges = [];
  let currentStart = new Date(startDate);
  let activeMonth = null;

  for (let i = 0; i < totalMonths; i++) {
    const monthStart = new Date(currentStart);
    const monthEnd = new Date(currentStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const isActive = currentDate >= monthStart && currentDate < monthEnd;
    if (isActive) activeMonth = i + 1;

    monthRanges.push({
      monthNumber: i + 1,
      startDate: monthStart,
      endDate: monthEnd,
      isActive,
    });

    currentStart = new Date(monthEnd);
  }

  for (const m of monthRanges) {
    if (!m.isActive) continue;

    const isInRange = currentDate >= m.startDate && currentDate <= m.endDate;
    const monthYear = `${
      m.startDate.getMonth() + 1
    }-${m.startDate.getFullYear()}`;

    let brandDoc = await CategoryLocationMatch.findOne({
      brandId: brand.uuid,
    });

    if (!brandDoc) {
      brandDoc = await CategoryLocationMatch.create({
        brandId: brand.uuid,
        brandName: brand.brandDetails?.brandName || "",
        categoryLocationMatchRecords: [
          {
            monthYear: monthYear,
            count: 0,
            records: [],
          },
        ],
      });
    } else {
      const existingMonth = brandDoc.categoryLocationMatchRecords[0]?.monthYear;

      if (existingMonth !== monthYear) {
        await CategoryLocationMatch.findByIdAndUpdate(
          brandDoc._id,
          {
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
            $set: { "currentMonthMatch.match": 0 },
          },
          { new: true }
        );
      }
    }

    if (isInRange) {
      brandDoc = await CategoryLocationMatch.findOneAndUpdate(
        { brandId: brand.uuid },
        {
          $inc: {
            "categoryLocationMatchRecords.0.count": 1,
          },
          $push: {
            "categoryLocationMatchRecords.0.records": {
              investorId: investorData?.applyId,
              investorName: investorData?.fullName,
              investorEmail: investorData?.email,
              investorMobile: investorData?.mobileNumber,
            },
          },
        },
        { new: true }
      );

      console.log("🔥 Location match updated (current month)");
    }
  }

  return;
};

const LocationInvestmentRangeMatchFunction = async (brand, investorData) => {
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
    brandDoc = await LocationInvestmentRangeMatch.findByIdAndUpdate(
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
  check,
  matchType
) => {
  let brandBatchDoc = await BrandBatch.findOne({});

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
  if (matchType) {
    aggregationPipeline.push(
      {
        $lookup: {
          from: "categoryinvestmentrangematchs",
          localField: "uuid",
          foreignField: "brandId",
          as: "categoryInvestmentrangeMatchData",
        },
      },
      {
        $unwind: {
          path: "$franchiseDetails",
          preserveNullAndEmptyArrays: true,
        },
      }
    );
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

  if (matchType) {
    projectStage.categoryInvestmentrangeMatchData = 1;
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
          leadMatchBy: "Category_Investmentrange_LocationMatch",
        });
      }
      if (
        !brandBatchDoc.isPaidCategoryLocationPaused &&
        "CategoryLocation" === check
      ) {
        console.log("category &&  && location");
        await CategoryLocationMatchFunction(brand, investorData);
        brandsSent.push({
          brandId: brand.uuid,
          brandName: brand.brandDetails?.brandName || "",
          brandEmail: brand.brandDetails?.email || "",
          emailSent: true,
          emailSentAt: new Date(),
          paidBrand: Boolean(true),
          leadMatchBy: "Category_LocationMatch",
        });
      }
      if (
        !brandBatchDoc.isPaidCategoryInvestmentrangePaused &&
        "CategoryInvestmentrange" === check
      ) {
        console.log("category && investmentRange && ");
        await CategoryInvestmentrangeMatchFunction(brand, investorData);
        brandsSent.push({
          brandId: brand.uuid,
          brandName: brand.brandDetails?.brandName || "",
          brandEmail: brand.brandDetails?.email || "",
          emailSent: true,
          emailSentAt: new Date(),
          paidBrand: Boolean(true),
          leadMatchBy: "Category_Investmentrange",
        });
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
          leadMatchBy: "Location_Investmentrange",
        });
      }
    }
  }
  return brandsSent;
};
