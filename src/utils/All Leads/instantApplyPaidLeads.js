import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { CategoryInvestmentrangeLocationMatch } from "../../model/Leads/categoryInvestmentrangeLocationMatch.model.js";
import { paidLeadInstantApplyEmail } from "../Centralized Email/centralizedEmail.js";
import BrandBatch from "../../model/NewIncomeInvestor/InstantApplyTrackSchema.js";
import { CategoryInvestmentrangeMatch } from "../../model/Leads/categoryInvestmentrangeMatch.model.js";
import { CategoryLocationMatch } from "../../model/Leads/categoryLocationMatch.model.js";
import { LocationInvestmentRangeMatch } from "../../model/Leads/locationInvestmentRangeMatch.model.js";

export const format = (d) => {
  const day = String(d?.getDate()).padStart(2, "0");
  const month = String(d?.getMonth() + 1).padStart(2, "0");
  const year = d?.getFullYear();
  const hours = String(d?.getHours()).padStart(2, "0");
  const minutes = String(d?.getMinutes()).padStart(2, "0");
  const seconds = String(d?.getSeconds()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

const twoMatchTypesleadcount = async (brand) => {
  let totalLeadsendcount = 0;
  await brand?.categorylocationMatchData?.forEach((r) => {
    const records = r?.categoryLocationMatchRecords;
    const lastRecord = records[records?.length - 1];

    if (lastRecord) {
      if (
        String(lastRecord?.packageStartDate) ===
        String(format(brand.brandDetails?.paymentPackage?.packageUpdatedTime))
      ) {
        console.log("**** LAST RECORD categorylocationMatchData ****", lastRecord?.leadCount, "****");

        totalLeadsendcount += lastRecord?.leadCount;
      }
    }
  });
  await brand?.categoryInvestmentrangeMatchData?.forEach((r) => {
    const records = r.categoryInvestmentrangeMatchRecords;
    const lastRecord = records[records?.length - 1];

    if (lastRecord) {
      if (
        String(lastRecord?.packageStartDate) ===
        String(format(brand.brandDetails?.paymentPackage?.packageUpdatedTime))
      ) {
        console.log("**** LAST RECORD categoryInvestmentrangeMatchData ****", lastRecord?.leadCount, "****");

        totalLeadsendcount += lastRecord?.leadCount;
      }
    }
  });
  await brand?.LocationInvestmentRangeMatchData?.forEach((r) => {
    const records = r.locationInvestmentRangeMatchRecords;
    const lastRecord = records[records.length - 1];

    if (lastRecord) {
      if (
        String(lastRecord?.packageStartDate) ===
        String(format(brand.brandDetails?.paymentPackage?.packageUpdatedTime))
      ) {
        console.log("**** LAST RECORD locationInvestmentRangeMatchRecords ****", lastRecord?.leadCount, "****");

        totalLeadsendcount += lastRecord?.leadCount;
      }
    }
  });

  console.log("==== twoMatchTypesleadcount ==== :",totalLeadsendcount);
  return totalLeadsendcount
};

const CategoryInvestmentrangeLocationMatchFunction = async (
  brand,
  investorData
) => {
  const currentDate = new Date();
  const paymentPackage = brand.brandDetails?.paymentPackage;

  if (!paymentPackage?.packageUpdatedTime) {
    console.log("⚠️ No packageUpdatedTime found");
    return;
  }

  // console.log("brand :", brand);
  // console.log("brand :", brand.categoryinvestmentrangelocationMatchData);
  const packageStartDate = paymentPackage?.packageUpdatedTime;
  const totalMonths = paymentPackage?.totalMonths || 1;
  const packageEndDate = new Date(packageStartDate);
  packageEndDate.setMonth(packageEndDate.getMonth() + totalMonths);

  console.log("packageStartDate :", packageStartDate);
  console.log("packageStartDate :", format(packageStartDate));

  let totalLeadsendcount = 0;
  let lastupdatedData = null;

  brand?.categoryinvestmentrangelocationMatchData?.forEach((r) => {
    const records = r?.categoryInvestmentrangeLocationMatchRecords;
    const lastRecord = records[records?.length - 1];

    if (lastRecord) {
      console.log("**** LAST RECORD ****", lastRecord, "****");
      if (
        String(lastRecord?.packageStartDate) ===
        String(format(packageStartDate))
      ) {
        totalLeadsendcount += lastRecord?.leadCount;
      }

      lastupdatedData = lastRecord;
    }
  });

  console.log("totalLeadsendcount :", totalLeadsendcount);

  if (totalLeadsendcount >= paymentPackage?.totalLeads) {
    return;
  }

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

  const filterdata = monthRanges?.filter((i) => i.isActive === true);
  const formattedRange = `${format(filterdata[0]?.startDate)} -> ${format(
    filterdata[0]?.endDate
  )}`;

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
    await CategoryInvestmentrangeLocationMatch.updateOne(
      { _id: brandDoc._id },
      {
        $push: {
          categoryInvestmentrangeLocationMatchRecords: {
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
    brand.categoryinvestmentrangelocationMatchData[0]
      ?.categoryInvestmentrangeLocationMatchRecords ||
    brand.categoryinvestmentrangelocationMatchData
      ?.categoryInvestmentrangeLocationMatchRecords ||
    [];
  const lastIndex = recordsArr?.length - 1;

  // console.log("===recordsArr=== :", recordsArr);
  // console.log("===lastIndex=== :", lastIndex);
  const lastRecord = recordsArr[lastIndex];
  // console.log("===lastRecord=== :", lastRecord);

  const innerLastIndex = lastRecord?.records?.length - 1;
  const innerLastRecord = lastRecord?.records?.[innerLastIndex];

  if (
    Number(filterdata[0]?.monthNumber) === Number(innerLastRecord?.monthNumber)
  ) {
    console.log("Month matched. Updating leads...");

    const innerLastIndex = lastRecord?.records?.length - 1;

    await CategoryInvestmentrangeLocationMatch.updateOne(
      { _id: brandDoc._id },
      {
        $push: {
          [`categoryInvestmentrangeLocationMatchRecords.${lastIndex}.records.${innerLastIndex}.leadsRecords`]:
            {
              investorId: investorData?.applyId,
              investorName: investorData?.fullName,
              investorEmail: investorData?.email,
              investorMobile: investorData?.mobileNumber,
              sentAt: new Date(),
            },
        },
        $inc: {
          [`categoryInvestmentrangeLocationMatchRecords.${lastIndex}.records.${innerLastIndex}.count`]: 1,
          [`categoryInvestmentrangeLocationMatchRecords.${lastIndex}.leadCount`]: 1,
        },
      }
    );

    return;
  } else if (
    Number(filterdata[0]?.monthNumber) > Number(innerLastRecord?.monthNumber)
  ) {
    console.log("New month detected. Creating new month record...");

    await CategoryInvestmentrangeLocationMatch.updateOne(
      { _id: brandDoc._id },
      {
        $push: {
          [`categoryInvestmentrangeLocationMatchRecords.${lastIndex}.records`]:
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
        },

        $inc: {
          [`categoryInvestmentrangeLocationMatchRecords.${lastIndex}.leadCount`]: 1,
        },
      }
    );

    return;
  }
};

const CategoryInvestmentrangeMatchFunction = async (brand, investorData) => {
  const currentDate = new Date();
  const paymentPackage = brand.brandDetails?.paymentPackage;
  // console.log("paymentPackage :", paymentPackage);

  if (!paymentPackage?.packageUpdatedTime) {
    console.log("⚠️ No packageUpdatedTime found");
    return;
  }

  const packageStartDate = paymentPackage?.packageUpdatedTime;
  const totalMonths = paymentPackage?.totalMonths || 1;
  const packageEndDate = new Date(packageStartDate);
  packageEndDate.setMonth(packageEndDate.getMonth() + totalMonths);

 
  let lastupdatedData = null;

  let totalLeadsendcount = await twoMatchTypesleadcount(brand)

  brand.categoryInvestmentrangeMatchData.forEach((r) => {
    const records = r.categoryInvestmentrangeMatchRecords;
    const lastRecord = records[records.length - 1];

    if (lastRecord) {
      lastupdatedData = lastRecord;
    }
  });

  if (totalLeadsendcount >= paymentPackage?.totalLeads) {
    console.log("===expired===")
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
    brand?.categoryInvestmentrangeMatchData[0]?.categoryInvestmentrangeMatchRecords;
  const lastIndex = recordsArr.length - 1;

  // console.log("===recordsArr=== :", recordsArr);
  // console.log("===lastIndex=== :", lastIndex);
  const lastRecord = recordsArr[lastIndex];
  // console.log("===lastRecord=== :", lastRecord);

  const innerLastIndex = lastRecord.records.length - 1;
  const innerLastRecord = lastRecord.records[innerLastIndex];

  if (
    Number(filterdata[0]?.monthNumber) > Number(innerLastRecord?.monthNumber)
  ) {
    // console.log("Month matched. Updating leads...");

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
    Number(filterdata[0]?.monthNumber) === Number(innerLastRecord?.monthNumber)
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

const CategoryLocationMatchFunction = async (brand, investorData) => {
  const currentDate = new Date();
  const paymentPackage = brand.brandDetails?.paymentPackage;
  // console.log("paymentPackage :", paymentPackage);

  if (!paymentPackage?.packageUpdatedTime) {
    console.log("⚠️ No packageUpdatedTime found");
    return;
  }

  const packageStartDate = paymentPackage?.packageUpdatedTime;
  const totalMonths = paymentPackage?.totalMonths || 1;
  const packageEndDate = new Date(packageStartDate);
  packageEndDate.setMonth(packageEndDate.getMonth() + totalMonths);

   let totalLeadsendcount = await twoMatchTypesleadcount(brand)
  let lastupdatedData = null;

  brand?.categorylocationMatchData?.forEach((r) => {
    const records = r?.categoryLocationMatchRecords;
    const lastRecord = records[records?.length - 1];

    if (lastRecord) {
      lastupdatedData = lastRecord;
    }
  });

  if (totalLeadsendcount >= paymentPackage?.totalLeads) {
    console.log("===expired===")
    return;
  }
  // console.log("==== :",totalLeadsendcount)
  // console.log("==lastupdatedData== :", lastupdatedData);
  // console.log(
  //   "==format(paymentPackage.packageUpdatedTime)== :",
  //   format(paymentPackage?.packageUpdatedTime)
  // );
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
      categoryLocationMatchRecords: [
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
          categoryLocationMatchRecords: {
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

  // console.log("brand.categoryLocationMatchData[0] :", brand);

  const recordsArr =
    brand.categorylocationMatchData[0]?.categoryLocationMatchRecords ||
    brand.categoryLocationMatchData?.categoryLocationMatchRecords ||
    [];
  const lastIndex = recordsArr?.length - 1;

  // console.log("===recordsArr=== :", recordsArr);
  // console.log("===lastIndex=== :", lastIndex);
  const lastRecord = recordsArr[lastIndex];
  // console.log("===lastRecord=== :", lastRecord);

  const innerLastIndex = lastRecord?.records?.length - 1;
  const innerLastRecord = lastRecord?.records?.[innerLastIndex];

  if (
    Number(filterdata[0]?.monthNumber) === Number(innerLastRecord?.monthNumber)
  ) {
    // console.log("Month matched. Updating leads...");

    const innerLastIndex = lastRecord?.records?.length - 1;

    await CategoryLocationMatch.updateOne(
      { _id: brandDoc._id },
      {
        $push: {
          [`categoryLocationMatchRecords.${lastIndex}.records.${innerLastIndex}.leadsRecords`]:
            {
              investorId: investorData?.applyId,
              investorName: investorData?.fullName,
              investorEmail: investorData?.email,
              investorMobile: investorData?.mobileNumber,
              sentAt: new Date(),
            },
        },
        $inc: {
          [`categoryLocationMatchRecords.${lastIndex}.records.${innerLastIndex}.count`]: 1,
          [`categoryLocationMatchRecords.${lastIndex}.leadCount`]: 1,
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
          [`categoryLocationMatchRecords.${lastIndex}.records`]: {
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
          [`categoryLocationMatchRecords.${lastIndex}.leadCount`]: 1,
        },
      }
    );

    return;
  }
};

const LocationInvestmentRangeMatchFunction = async (brand, investorData) => {
  const currentDate = new Date();
  const paymentPackage = brand.brandDetails?.paymentPackage;

  if (!paymentPackage?.packageUpdatedTime) {
    console.log("⚠️ No packageUpdatedTime found");
    return;
  }

  const packageStartDate = paymentPackage?.packageUpdatedTime;
  const totalMonths = paymentPackage?.totalMonths || 1;
  const packageEndDate = new Date(packageStartDate);
  packageEndDate.setMonth(packageEndDate.getMonth() + totalMonths);

  let totalLeadsendcount = await twoMatchTypesleadcount(brand)
  let lastupdatedData = null;

  brand?.LocationInvestmentRangeMatchData?.forEach((r) => {
    const records = r?.locationInvestmentRangeMatchRecords;
    const lastRecord = records[records?.length - 1];

    if (lastRecord) {
      lastupdatedData = lastRecord;
    }
  });

  if (totalLeadsendcount >= paymentPackage?.totalLeads) {
    console.log("===expired===")
    return;
  }
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
  const formattedRange = `${format(filterdata[0].startDate)} -> ${format(
    filterdata[0].endDate
  )}`;

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
    await LocationInvestmentRangeMatch.updateOne(
      { _id: brandDoc._id },
      {
        $push: {
          locationInvestmentRangeMatchRecords: {
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
    brand.LocationInvestmentRangeMatchData[0]
      ?.locationInvestmentRangeMatchRecords ||
    brand.LocationInvestmentRangeMatchData
      ?.locationInvestmentRangeMatchRecords ||
    [];
  const lastIndex = recordsArr?.length - 1;

  // console.log("===recordsArr=== :", recordsArr);
  // console.log("===lastIndex=== :", lastIndex);
  const lastRecord = recordsArr[lastIndex];
  // console.log("===lastRecord=== :", lastRecord);

  const innerLastIndex = lastRecord?.records?.length - 1;
  const innerLastRecord = lastRecord?.records?.[innerLastIndex];

  if (
    Number(filterdata[0]?.monthNumber) === Number(innerLastRecord?.monthNumber)
  ) {
    // console.log("Month matched. Updating leads...");

    const innerLastIndex = lastRecord?.records?.length - 1;

    await LocationInvestmentRangeMatch.updateOne(
      { _id: brandDoc._id },
      {
        $push: {
          [`locationInvestmentRangeMatchRecords.${lastIndex}.records.${innerLastIndex}.leadsRecords`]:
            {
              investorId: investorData?.applyId,
              investorName: investorData?.fullName,
              investorEmail: investorData?.email,
              investorMobile: investorData?.mobileNumber,
              sentAt: new Date(),
            },
        },
        $inc: {
          [`locationInvestmentRangeMatchRecords.${lastIndex}.records.${innerLastIndex}.count`]: 1,
          [`locationInvestmentRangeMatchRecords.${lastIndex}.leadCount`]: 1,
        },
      }
    );

    return;
  } else if (
    Number(filterdata[0]?.monthNumber) > Number(innerLastRecord?.monthNumber)
  ) {
    // console.log("New month detected. Creating new month record...");

    await LocationInvestmentRangeMatch.updateOne(
      { _id: brandDoc._id },
      {
        $push: {
          [`locationInvestmentRangeMatchRecords.${lastIndex}.records`]: {
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
          [`locationInvestmentRangeMatchRecords.${lastIndex}.leadCount`]: 1,
        },
      }
    );

    return;
  }
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
        await CategoryLocationMatchFunction(brand, investorData);
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
          leadMatchBy: ["Category_Investmentrange"],
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
          leadMatchBy: ["Location_Investmentrange"],
        });
      }
    }
  }
  return brandsSent;
};
