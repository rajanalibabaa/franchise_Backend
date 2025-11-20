import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { CategoryInvestmentrangeLocationMatch } from "../../model/Leads/categoryInvestmentrangeLocationMatch.model.js";
import { CategoryInvestmentrangeMatch } from "../../model/Leads/categoryInvestmentrangeMatch.model.js";
import { CategoryLocationMatch } from "../../model/Leads/categoryLocationMatch.model.js";
import { LocationInvestmentRangeMatch } from "../../model/Leads/locationInvestmentRangeMatch.model.js";
import PaymentPackages from "../../model/Brand/AdvertigeHandlingModel.js";

export const format = (d) => {
  const day = String(d?.getDate()).padStart(2, "0");
  const month = String(d?.getMonth() + 1).padStart(2, "0");
  const year = d?.getFullYear();
  const hours = String(d?.getHours()).padStart(2, "0");
  const minutes = String(d?.getMinutes()).padStart(2, "0");
  const seconds = String(d?.getSeconds()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

export const leadPackageUpdate = async (req, res) => {
  try {
    const brandId = req.params.id;
    const upgradePacakgeType = "free";

    // Get brand details
    const brands = await BrandDetails.find({ uuid: brandId });

    if (!brands || brands.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    const brand = brands[0]; // Get first element from array
    const packageUpdatedTimes =
      brand.brandDetails.paymentPackage.packageUpdatedTime;
    const packageStartDate = new Date(packageUpdatedTimes); // Keep as Date object
    const packageStartTime = format(packageStartDate); // Format for display

    const totalMonths = brand.brandDetails.paymentPackage?.totalMonths || 0;

    // Calculate package end date
    const packageEndDate = new Date(packageStartDate);
    packageEndDate.setMonth(packageEndDate.getMonth() + totalMonths);
    const packageEndTime = format(packageEndDate);

    console.log("Package Start Time:", packageStartTime);

    if (!packageStartTime) {
      return res.status(400).json({
        success: false,
        message: "packageUpdatedTime not found in brandDetails.paymentPackage",
      });
    }

    // Get lead counts from all 4 match collections
    // const locCatInvCount = await getLeadCount(
    //   CategoryInvestmentrangeLocationMatch,
    //   "categoryInvestmentrangeLocationMatchRecords",
    //   brandId,
    //   packageStartTime
    // );

    const catInvCount = await getLeadCount(
      CategoryInvestmentrangeMatch,
      "categoryInvestmentrangeMatchRecords",
      brandId,
      packageStartTime
    );

    const catLocCount = await getLeadCount(
      CategoryLocationMatch,
      "categoryLocationMatchRecords",
      brandId,
      packageStartTime
    );

    // const locInvCount = await getLeadCount(  
    //   LocationInvestmentRangeMatch,
    //   "locationInvestmentRangeMatchRecords",
    //   brandId,
    //   packageStartTime
    // );

    const totalLeadCount = catInvCount.leadCount + catLocCount.leadCount;

    const PackageLeadCount = brand.brandDetails.paymentPackage.totalLeads;

    const balanceLeads = totalLeadCount - PackageLeadCount;

    console.log("balanceLeads :", balanceLeads);

    if (upgradePacakgeType) {
      const PaymentPackagesData = await PaymentPackages.findOne({}).lean();
      const selectedPackage = upgradePacakgeType;
      let newUpgradePackage = null;

      for (const key in PaymentPackagesData) {
        if (key === selectedPackage) {
          newUpgradePackage = {
            ...PaymentPackagesData[key],
            packageType: key,
            isActive: true,
            packageUpdatedTime: new Date(),
          };
        }
      }
      console.log("newUpgradePackage :", newUpgradePackage);

      newUpgradePackage = {
        ...newUpgradePackage,
        totalLeads: newUpgradePackage.totalLeads + balanceLeads,
        isActive: false,
      };

      console.log(
        "=== newUpgradePackage ===:",
        brand.brandDetails.paymentPackage
      );
      brand.brandDetails.paymentPackage = newUpgradePackage;
      //  await brand.save();
      console.log(
        "=== newUpgradePackageLast===:",
        brand.brandDetails.paymentPackage
      );
    }

    return res.status(200).json({
      success: true,
      message: "New package upgrade successfully ",
      data: {
        brandId,
        packageDates: {
          packageStartTime,
          packageEndTime,
          totalMonths,
        },
        counts: {
          // categoryInvestmentrangeLocationMatch: locCatInvCount,
          categoryInvestmentrangeMatch: catInvCount,
          categoryLocationMatch: catLocCount,
          // locationInvestmentRangeMatch: locInvCount,
        },
        totalLeadCount,
        balanceLeads,
      },
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

async function getLeadCount(
  model,
  foreignFieldName,
  brandId,
  packageStartTime
) {
  const doc = await model.findOne({ brandId });



  // If no brand found inside this schema → skip
  if (!doc || !doc[foreignFieldName] || doc[foreignFieldName].length === 0) {
    return { found: false, leadCount: 0 };
  }

  // Get last index record
  const lastIndex = doc[foreignFieldName].length - 1;
  const lastRecord = doc[foreignFieldName][lastIndex];



  const pkgStart = lastRecord.packageStartDate;
  const pkgUpdated = packageStartTime;



  // If packageUpdatedTime does NOT match → skip
  if (pkgStart !== pkgUpdated) {
    return { found: false, leadCount: 0 };
  }

  return { found: true, leadCount: lastRecord.leadCount ?? 0 };
}
