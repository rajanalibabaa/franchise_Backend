import { CategoryLocationMatch } from "../../model/Leads/categoryLocationMatch.model.js";
import { format } from "../../utils/AllLeads/instantApplyPaidLeads.js";
import { twoMatchTypesleadcount } from "../../utils/AllLeads/instantApplyPaidLeads.js";

export const CategoryLocationMatchFunction = async (brand, investorData) => {
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