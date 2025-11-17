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
  const paymentPackage = brand.brandDetails?.paymentPackage;

  if (!paymentPackage?.packageUpdatedTime) {
    console.log("⚠️ No packageUpdatedTime found");
    return;
  }

  const currentDate = new Date();
  const packageStart = new Date(paymentPackage.packageUpdatedTime);
  const totalMonths = paymentPackage.totalMonths || 1;

  // Build package end date
  const packageEnd = new Date(packageStart);
  packageEnd.setMonth(packageEnd.getMonth() + totalMonths);

  // Build monthly ranges
  const monthRanges = [];
  let cursor = new Date(packageStart);

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

  const format = (d) =>
    `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;

  const formattedRange = `${format(active.startDate)} → ${format(
    active.endDate
  )}`;

  // -------------------------------------------------
  // 1️⃣ FIND OR CREATE BRAND DOC
  // -------------------------------------------------
  let brandDoc = await CategoryInvestmentrangeLocationMatch.findOne({
    brandId: brand.uuid,
  });

  if (!brandDoc) {
    brandDoc = await CategoryInvestmentrangeLocationMatch.create({
      brandId: brand.uuid,
      brandName: brand.brandDetails?.brandName,

      categoryInvestmentrangeLocationMatchRecords: [
        {
          packageType: paymentPackage.packageType,
          packageStartDate: format(packageStart),
          packageEndDate: format(packageEnd),
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

    console.log("🟢 Created new CategoryInvestmentrangeLocationMatch brandDoc");
  }

  // -------------------------------------------------
  // 2️⃣ NEW PACKAGE DETECTED → PUSH NEW BLOCK
  // -------------------------------------------------
  const firstPkg = brandDoc.categoryInvestmentrangeLocationMatchRecords[0];

  if (firstPkg && firstPkg.packageStartDate !== format(packageStart)) {
    console.log("🟠 New package detected → pushing new package");

    await CategoryInvestmentrangeLocationMatch.updateOne(
      { _id: brandDoc._id },
      {
        $push: {
          categoryInvestmentrangeLocationMatchRecords: {
            packageType: paymentPackage.packageType,
            packageStartDate: format(packageStart),
            packageEndDate: format(packageEnd),
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

    brandDoc = await CategoryInvestmentrangeLocationMatch.findById(
      brandDoc._id
    );
  }

  // -------------------------------------------------
  // 3️⃣ FIND CURRENT PACKAGE INDEX
  // -------------------------------------------------
  const pkgIndex =
    brandDoc.categoryInvestmentrangeLocationMatchRecords.findIndex(
      (r) =>
        r.packageStartDate === format(packageStart) &&
        r.packageEndDate === format(packageEnd)
    );

  const updatePath = `categoryInvestmentrangeLocationMatchRecords.${pkgIndex}.records`;

  // -------------------------------------------------
  // 4️⃣ ENSURE MONTH ENTRY EXISTS
  // -------------------------------------------------
  const monthIndex = brandDoc.categoryInvestmentrangeLocationMatchRecords[
    pkgIndex
  ].records.findIndex((r) => r.monthYear === formattedRange);

  if (monthIndex === -1) {
    await CategoryInvestmentrangeLocationMatch.updateOne(
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

  // -------------------------------------------------
  // 5️⃣ PUSH LEAD ENTRY + INCREMENT COUNTS
  // -------------------------------------------------
  await CategoryInvestmentrangeLocationMatch.updateOne(
    {
      _id: brandDoc._id,
      [`${updatePath}.monthYear`]: formattedRange,
    },
    {
      $inc: {
        [`${updatePath}.$.count`]: 1,
        [`categoryInvestmentrangeLocationMatchRecords.${pkgIndex}.leadCount`]: 1,
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

  console.log("🔥 CategoryInvestmentrangeLocationMatch updated");
  return;
};

const CategoryInvestmentrangeMatchFunction = async (brand, investorData) => {
  const currentDate = new Date();
  const paymentPackage = brand.brandDetails?.paymentPackage;
  console.log("paymentPackage :", paymentPackage);

  if (!paymentPackage?.packageUpdatedTime) {
    console.log("⚠️ No packageUpdatedTime found");
    return;
  }

  const packageStartDate = paymentPackage?.packageUpdatedTime;
  const totalMonths = paymentPackage?.totalMonths || 1;
  const packageEndDate = new Date(packageStartDate);
  packageEndDate.setMonth(packageEndDate.getMonth() + totalMonths);

  let totalLeadsendcount = 0;
  let lastupdatedData = null;

  brand.categorylocationMatchData.forEach((r) => {
    const records = r.categorylocationMatchDataRecords;
    const lastRecord = records[records.length - 1];

    if (lastRecord) {
      console.log("**** LAST RECORD ****", lastRecord?.leadCount, "****");
      totalLeadsendcount += lastRecord?.leadCount;
      lastupdatedData = lastRecord;
    }
  });

  if (totalLeadsendcount >= paymentPackage?.totalLeads) {
    return;
  }
  // console.log("==== :",totalLeadsendcount)
  // console.log("==lastupdatedData== :",lastupdatedData)
  // console.log("==format(paymentPackage.packageUpdatedTime)== :",format(paymentPackage?.packageUpdatedTime))
  // console.log("==packageStartDate== :",packageStartDate)

  // console.log("==packageStartDate== :",packageStartDate)
  // console.log("==totalMonths== :",totalMonths)
  // console.log("==packageEndDate== :",packageEndDate)

  const monthRanges = [];

  for (let i = 0; i < totalMonths; i++) {
    const mStart = new Date(packageStartDate);
    mStart.setMonth(mStart.getMonth() + i);

    const mEnd = new Date(packageStartDate);
    mEnd.setMonth(mEnd.getMonth() + i + 1);

    monthRanges.push({
      monthNumber: i + 1,
      startDate: mStart,
      endDate: mEnd,
      isActive: currentDate >= mStart && currentDate < mEnd,
    });
  }

  const filterdata = monthRanges.filter((i) => i.isActive === true);

  // console.log("===monthRanges=== :",monthRanges)
  // console.log("===filterdata=== :",filterdata)
  // console.log("===filterdata=== :",format(filterdata[0].startDate))
  // console.log("===filterdata=== :",format(filterdata[0].endDate))

  const formattedRange = `${format(filterdata[0].startDate)} -> ${format(
    filterdata[0].endDate
  )}`;

  let brandDoc = await CategoryLocationMatch.findOne({
    brandId: brand.uuid,
  });

  if (!brandDoc) {
    brandDoc = await CategoryLocationMatch.create({
      brandId: brand.uuid,
      brandName: brand.brandDetails?.brandName,
      categorylocationMatchDataRecords: [
        {
          packageType: paymentPackage.packageType,
          packageStartDate: format(packageStartDate),
          packageEndDate: format(packageEndDate),
          leadCount: 1,
          records: [
            {
              range: formattedRange,
              monthNumber: filterdata[0]?.monthNumber || 1,
              count: 1,
              leadsRecords: [
                {
                  investorId: investorData?.applyId,
                  investorName: investorData?.fullName,
                  investorEmail: investorData?.email,
                  investorMobile: investorData?.mobileNumber,
                  sentAt: new Date(),
                },
              ],
            },
          ],
        },
      ],
    });
    return;
  }

  if (
    format(paymentPackage?.packageUpdatedTime) >
    lastupdatedData?.packageStartDate
  ) {
    console.log("true");
    await CategoryLocationMatch.updateOne(
      { _id: brandDoc._id },
      {
        $push: {
          categorylocationMatchDataRecords: {
            packageType: paymentPackage.packageType,
            packageStartDate: format(packageStartDate),
            packageEndDate: format(packageEndDate),
            leadCount: 1,
            records: [
              {
                range: formattedRange,
                monthNumber: filterdata[0]?.monthNumber || 1,
                count: 1,
                leadsRecords: [
                  {
                    investorId: investorData?.applyId,
                    investorName: investorData?.fullName,
                    investorEmail: investorData?.email,
                    investorMobile: investorData?.mobileNumber,
                    sentAt: new Date(),
                  },
                ],
              },
            ],
          },
        },
      }
    );

    return;
  }

  const recordsArr =
    brand?.categorylocationMatchData[0]?.categorylocationMatchDataRecords;
  const lastIndex = recordsArr.length - 1;

  console.log("===recordsArr=== :", recordsArr);
  console.log("===lastIndex=== :", lastIndex);
  const lastRecord = recordsArr[lastIndex];
  console.log("===lastRecord=== :", lastRecord);

  const innerLastIndex = lastRecord.records.length - 1;
  const innerLastRecord = lastRecord.records[innerLastIndex];

  if (
    Number(filterdata[0]?.monthNumber) === Number(innerLastRecord?.monthNumber)
  ) {
    console.log("Month matched. Updating leads...");

    const innerLastIndex = lastRecord.records.length - 1;

    await CategoryLocationMatch.updateOne(
      { _id: brandDoc._id },
      {
        $push: {
          [`categorylocationMatchDataRecords.${lastIndex}.records.${innerLastIndex}.leadsRecords`]:
            {
              investorId: investorData?.applyId,
              investorName: investorData?.fullName,
              investorEmail: investorData?.email,
              investorMobile: investorData?.mobileNumber,
              sentAt: new Date(),
            },
        },
        $inc: {
          [`categorylocationMatchDataRecords.${lastIndex}.records.${innerLastIndex}.count`]: 1,
          [`categorylocationMatchDataRecords.${lastIndex}.leadCount`]: 1,
        },
      }
    );

    return;
  } else if (
    Number(filterdata[0]?.monthNumber) > Number(innerLastRecord?.monthNumber)
  ) {
    console.log("New month detected. Creating new month record...");

    await CategoryLocationMatch.updateOne(
      { _id: brandDoc._id },
      {
        $push: {
          [`categorylocationMatchDataRecords.${lastIndex}.records`]: {
            range: formattedRange,
            monthNumber: filterdata[0]?.monthNumber || 1,
            count: 1,
            leadsRecords: [
              {
                investorId: investorData?.applyId,
                investorName: investorData?.fullName,
                investorEmail: investorData?.email,
                investorMobile: investorData?.mobileNumber,
                sentAt: new Date(),
              },
            ],
          },
        },

        $inc: {
          [`categorylocationMatchDataRecords.${lastIndex}.leadCount`]: 1,
        },
      }
    );

    return;
  }
};

const CategoryLocationMatchFunction = async (brand, investorData) => {
  const currentDate = new Date();
  const paymentPackage = brand.brandDetails?.paymentPackage;
  console.log("paymentPackage :", paymentPackage);

  if (!paymentPackage?.packageUpdatedTime) {
    console.log("⚠️ No packageUpdatedTime found");
    return;
  }

  const packageStartDate = paymentPackage?.packageUpdatedTime;
  const totalMonths = paymentPackage?.totalMonths || 1;
  const packageEndDate = new Date(packageStartDate);
  packageEndDate.setMonth(packageEndDate.getMonth() + totalMonths);

  let totalLeadsendcount = 0;
  let lastupdatedData = null;

  brand.categoryInvestmentrangeMatchData.forEach((r) => {
    const records = r.categoryInvestmentrangeMatchRecords;
    const lastRecord = records[records.length - 1];

    if (lastRecord) {
      console.log("**** LAST RECORD ****", lastRecord?.leadCount, "****");
      totalLeadsendcount += lastRecord?.leadCount;
      lastupdatedData = lastRecord;
    }
  });

  if (totalLeadsendcount >= paymentPackage?.totalLeads) {
    return;
  }
  // console.log("==== :",totalLeadsendcount)
  // console.log("==lastupdatedData== :",lastupdatedData)
  // console.log("==format(paymentPackage.packageUpdatedTime)== :",format(paymentPackage?.packageUpdatedTime))
  // console.log("==packageStartDate== :",packageStartDate)

  // console.log("==packageStartDate== :",packageStartDate)
  // console.log("==totalMonths== :",totalMonths)
  // console.log("==packageEndDate== :",packageEndDate)

  const monthRanges = [];

  for (let i = 0; i < totalMonths; i++) {
    const mStart = new Date(packageStartDate);
    mStart.setMonth(mStart.getMonth() + i);

    const mEnd = new Date(packageStartDate);
    mEnd.setMonth(mEnd.getMonth() + i + 1);

    monthRanges.push({
      monthNumber: i + 1,
      startDate: mStart,
      endDate: mEnd,
      isActive: currentDate >= mStart && currentDate < mEnd,
    });
  }

  const filterdata = monthRanges.filter((i) => i.isActive === true);

  // console.log("===monthRanges=== :",monthRanges)
  // console.log("===filterdata=== :",filterdata)
  // console.log("===filterdata=== :",format(filterdata[0].startDate))
  // console.log("===filterdata=== :",format(filterdata[0].endDate))

  const formattedRange = `${format(filterdata[0].startDate)} -> ${format(
    filterdata[0].endDate
  )}`;

  let brandDoc = await CategoryInvestmentrangeMatch.findOne({
    brandId: brand.uuid,
  });

  if (!brandDoc) {
    brandDoc = await CategoryInvestmentrangeMatch.create({
      brandId: brand.uuid,
      brandName: brand.brandDetails?.brandName,
      categoryInvestmentrangeMatchRecords: [
        {
          packageType: paymentPackage.packageType,
          packageStartDate: format(packageStartDate),
          packageEndDate: format(packageEndDate),
          leadCount: 1,
          records: [
            {
              range: formattedRange,
              monthNumber: filterdata[0]?.monthNumber || 1,
              count: 1,
              leadsRecords: [
                {
                  investorId: investorData?.applyId,
                  investorName: investorData?.fullName,
                  investorEmail: investorData?.email,
                  investorMobile: investorData?.mobileNumber,
                  sentAt: new Date(),
                },
              ],
            },
          ],
        },
      ],
    });
    return;
  }

  if (
    format(paymentPackage?.packageUpdatedTime) >
    lastupdatedData?.packageStartDate
  ) {
    console.log("true");
    await CategoryInvestmentrangeMatch.updateOne(
      { _id: brandDoc._id },
      {
        $push: {
          categoryInvestmentrangeMatchRecords: {
            packageType: paymentPackage.packageType,
            packageStartDate: format(packageStartDate),
            packageEndDate: format(packageEndDate),
            leadCount: 1,
            records: [
              {
                range: formattedRange,
                monthNumber: filterdata[0]?.monthNumber || 1,
                count: 1,
                leadsRecords: [
                  {
                    investorId: investorData?.applyId,
                    investorName: investorData?.fullName,
                    investorEmail: investorData?.email,
                    investorMobile: investorData?.mobileNumber,
                    sentAt: new Date(),
                  },
                ],
              },
            ],
          },
        },
      }
    );

    return;
  }

  const recordsArr =
    brand.categoryInvestmentrangeMatchData[0]
      .categoryInvestmentrangeMatchRecords;
  const lastIndex = recordsArr.length - 1;

  console.log("===recordsArr=== :", recordsArr);
  console.log("===lastIndex=== :", lastIndex);
  const lastRecord = recordsArr[lastIndex];
  console.log("===lastRecord=== :", lastRecord);

  const innerLastIndex = lastRecord.records.length - 1;
  const innerLastRecord = lastRecord.records[innerLastIndex];

  if (
    Number(filterdata[0]?.monthNumber) === Number(innerLastRecord?.monthNumber)
  ) {
    console.log("Month matched. Updating leads...");

    const innerLastIndex = lastRecord.records.length - 1;

    await CategoryInvestmentrangeMatch.updateOne(
      { _id: brandDoc._id },
      {
        $push: {
          [`categoryInvestmentrangeMatchRecords.${lastIndex}.records.${innerLastIndex}.leadsRecords`]:
            {
              investorId: investorData?.applyId,
              investorName: investorData?.fullName,
              investorEmail: investorData?.email,
              investorMobile: investorData?.mobileNumber,
              sentAt: new Date(),
            },
        },
        $inc: {
          [`categoryInvestmentrangeMatchRecords.${lastIndex}.records.${innerLastIndex}.count`]: 1,
          [`categoryInvestmentrangeMatchRecords.${lastIndex}.leadCount`]: 1,
        },
      }
    );

    return;
  } else if (
    Number(filterdata[0]?.monthNumber) > Number(innerLastRecord?.monthNumber)
  ) {
    console.log("New month detected. Creating new month record...");

    await CategoryInvestmentrangeMatch.updateOne(
      { _id: brandDoc._id },
      {
        $push: {
          [`categoryInvestmentrangeMatchRecords.${lastIndex}.records`]: {
            range: formattedRange,
            monthNumber: filterdata[0]?.monthNumber || 1,
            count: 1,
            leadsRecords: [
              {
                investorId: investorData?.applyId,
                investorName: investorData?.fullName,
                investorEmail: investorData?.email,
                investorMobile: investorData?.mobileNumber,
                sentAt: new Date(),
              },
            ],
          },
        },

        $inc: {
          [`categoryInvestmentrangeMatchRecords.${lastIndex}.leadCount`]: 1,
        },
      }
    );

    return;
  }
};


const LocationInvestmentRangeMatchFunction = async (brand, investorData) => {
  const paymentPackage = brand.brandDetails?.paymentPackage;
  if (!paymentPackage?.packageUpdatedTime) {
    console.log("⚠️ No packageUpdatedTime found");
    return;
  }

  const currentDate = new Date();
  const packageStart = new Date(paymentPackage.packageUpdatedTime);
  const totalMonths = paymentPackage.totalMonths || 1;

  // Build package end date
  const packageEnd = new Date(packageStart);
  packageEnd.setMonth(packageEnd.getMonth() + totalMonths);

  // ---- Build monthly ranges (same as other 2 functions) ----
  const monthRanges = [];
  let cursor = new Date(packageStart);

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

  const format = (d) =>
    `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;

  const formattedRange = `${format(active.startDate)} → ${format(
    active.endDate
  )}`;

  // -------------------------------------------------
  // 1️⃣ FIND OR CREATE BRAND DOC
  // -------------------------------------------------
  let brandDoc = await LocationInvestmentRangeMatch.findOne({
    brandId: brand.uuid,
  });

  if (!brandDoc) {
    brandDoc = await LocationInvestmentRangeMatch.create({
      brandId: brand.uuid,
      brandName: brand.brandDetails?.brandName,
      locationInvestmentRangeMatchRecords: [
        {
          packageType: paymentPackage.packageType,
          packageStartDate: format(packageStart),
          packageEndDate: format(packageEnd),
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

    console.log("🟢 Created new LocationInvestmentRangeMatch brandDoc");
  }

  // -------------------------------------------------
  // 2️⃣ NEW PACKAGE DETECTED? → PUSH NEW PACKAGE BLOCK
  // -------------------------------------------------
  const firstPkg = brandDoc.locationInvestmentRangeMatchRecords[0];

  if (firstPkg && firstPkg.packageStartDate !== format(packageStart)) {
    console.log("🟠 New package detected → pushing new package");

    await LocationInvestmentRangeMatch.updateOne(
      { _id: brandDoc._id },
      {
        $push: {
          locationInvestmentRangeMatchRecords: {
            packageType: paymentPackage.packageType,
            packageStartDate: format(packageStart),
            packageEndDate: format(packageEnd),
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

    brandDoc = await LocationInvestmentRangeMatch.findById(brandDoc._id);
  }

  // -------------------------------------------------
  // 3️⃣ FIND CURRENT PACKAGE INDEX
  // -------------------------------------------------
  const pkgIndex = brandDoc.locationInvestmentRangeMatchRecords.findIndex(
    (r) =>
      r.packageStartDate === format(packageStart) &&
      r.packageEndDate === format(packageEnd)
  );

  const updatePath = `locationInvestmentRangeMatchRecords.${pkgIndex}.records`;

  // -------------------------------------------------
  // 4️⃣ ENSURE CURRENT MONTH ENTRY EXISTS
  // -------------------------------------------------
  const monthIndex = brandDoc.locationInvestmentRangeMatchRecords[
    pkgIndex
  ].records.findIndex((r) => r.monthYear === formattedRange);

  if (monthIndex === -1) {
    await LocationInvestmentRangeMatch.updateOne(
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

  // -------------------------------------------------
  // 5️⃣ PUSH LEAD ENTRY + INCREMENT COUNTS
  // -------------------------------------------------
  await LocationInvestmentRangeMatch.updateOne(
    {
      _id: brandDoc._id,
      [`${updatePath}.monthYear`]: formattedRange,
    },
    {
      $inc: {
        [`${updatePath}.$.count`]: 1,
        [`locationInvestmentRangeMatchRecords.${pkgIndex}.leadCount`]: 1,
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

  console.log("🔥 LocationInvestmentRangeMatch updated");
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
      },
    );
  }
  if (matchType === "threeMatchTypes") {
    aggregationPipeline.push(
      {
        $lookup: {
          from: "categoryinvestmentrangelocationmatches",
          localField: "uuid",
          foreignField: "brandId",
          as: "categoryinvestmentrangelocationMatchData",
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
