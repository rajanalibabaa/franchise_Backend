import { CategoryInvestmentrangeLocationMatch } from "../../model/Leads/categoryInvestmentrangeLocationMatch.model.js";
import { format } from "../../utils/AllLeads/instantApplyPaidLeads.js";
import {
  paidLeadInstantApplyEmail,
  sendInstantApplyLeadLocation,
} from "../../utils/Centralized Email/centralizedEmail.js";

export const CategoryInvestmentrangeLocationMatchFunction = async (
  brand,
  investorData,
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
    filterdata[0]?.endDate,
  )}`;

  let brandDoc = await CategoryInvestmentrangeLocationMatch.findOne({
    brandId: brand.uuid,
  });

  // await sendInstantApplyLeadLocation(
  //   investorData?.fullName,
  //   investorData?.email,
  //   investorData?.mobileNumber,
  //   brand.brandDetails?.email,
  //   brand.brandDetails?.companyName,
  //   investorData?.category,
  //   investorData?.location,
  //   investorData?.investmentRange,
  //   investorData?.planToInvest,
  //   investorData?.readyToInvest
  // );

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
      },
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
      },
    );

    return;
  } else if (
    Number(filterdata[0]?.monthNumber) > Number(innerLastRecord?.monthNumber)
  ) {
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
      },
    );

    return;
  }
};
