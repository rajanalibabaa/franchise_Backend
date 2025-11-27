import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { CategoryInvestmentrangeLocationMatch } from "../../model/Leads/categoryInvestmentrangeLocationMatch.model.js";
import { CategoryInvestmentrangeMatch } from "../../model/Leads/categoryInvestmentrangeMatch.model.js";
import { CategoryLocationMatch } from "../../model/Leads/categoryLocationMatch.model.js";
import { LocationInvestmentRangeMatch } from "../../model/Leads/locationInvestmentRangeMatch.model.js";
import PaymentPackages from "../../model/Brand/AdvertigeHandlingModel.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import { PaymentPackageHistory } from "../../model/LeadPackage/PaymentPackageHistory.js";

export const format = (d) => {
  const day = String(d?.getDate()).padStart(2, "0");
  const month = String(d?.getMonth() + 1).padStart(2, "0");
  const year = d?.getFullYear();
  const hours = String(d?.getHours()).padStart(2, "0");
  const minutes = String(d?.getMinutes()).padStart(2, "0");
  const seconds = String(d?.getSeconds()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};
async function saveOldPackageToHistory(
  brand,
  packageEndTime,
  packageStartTime
) {
  if (!brand?.brandDetails?.paymentPackage) return;

  const oldPkg = brand.brandDetails.paymentPackage;

  const newHistoryEntry = {
    packageType: oldPkg.packageType,
    totalAmount: oldPkg.totalAmount,
    totalMonths: oldPkg.totalMonths,
    perMonthLead: oldPkg.perMonthLead,
    totalLeads: oldPkg.totalLeads,
    isActive: !oldPkg.isActive,
    packageStartTime: packageStartTime,
    packageEndTime: packageEndTime,
    sentLeadsPercentage: oldPkg.sentLeadsPercentage,
    timestamp: format(new Date()),
  };

  // Check if history for uuid exists
  const existing = await PaymentPackageHistory.findOne({ uuid: brand.uuid });

  if (existing) {
    await PaymentPackageHistory.updateOne( 
      { uuid: brand.uuid },
      {
        $push: {
          paymentPackage: newHistoryEntry,
        },
      }
    );

    return; // done
  }

  await PaymentPackageHistory.create({
    uuid: brand.uuid,
    brandName: brand.brandDetails.brandName,
    paymentPackage: [newHistoryEntry],
  });
}

export const leadPackageUpdate = async (req, res) => {
  try {
    const brandId = req.params.id;
    const upgradePacakgeType = req.body;

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

    console.log("Package Start Time:", packageEndTime);

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

    const balanceLeads = PackageLeadCount - totalLeadCount;

    console.log("balanceLeads :", balanceLeads);
    await saveOldPackageToHistory(brand, packageEndTime, packageStartTime);

    if (upgradePacakgeType) {
      // Fetch the main payment packages document
      const PaymentPackagesData = await PaymentPackages.findOne({}).lean();

      const selectedPackageName = upgradePacakgeType;
      let newUpgradePackage = null;

      // Find matching package in packages[]
      const matched = PaymentPackagesData.packages.find(
        (pkg) => pkg.packageName === selectedPackageName
      );

      if (matched) {
        newUpgradePackage = {
          ...matched,
          packageType: matched.packageName,
          isActive: true,
          packageUpdatedTime: new Date(),
        };
      }

      console.log("newUpgradePackage :", newUpgradePackage);

      if (!newUpgradePackage) {
        return res.json(new ApiResponse(404, {}, "Upgrade package not found"));
      }

      // Add balance leads
      newUpgradePackage = {
        ...newUpgradePackage,
        totalLeads: newUpgradePackage.totalLeads + balanceLeads,
        isActive: true,
      };

      console.log("=== newUpgradePackage ===:", newUpgradePackage);

      // Save to brand
      brand.brandDetails.paymentPackage = newUpgradePackage;

      const saved = await brand.save();
      if (!saved) {
        console.log("Error saving brand details");
        return res.json(new ApiResponse(500, {}, "Error saving brand details"));
      }

      console.log(
        "=== newUpgradePackageLast ===:",
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

  //   console.log(doc, "doc");

  // If no brand found inside this schema → skip
  if (!doc || !doc[foreignFieldName] || doc[foreignFieldName].length === 0) {
    return { found: false, leadCount: 0 };
  }

  // Get last index record
  const lastIndex = doc[foreignFieldName].length - 1;
  const lastRecord = doc[foreignFieldName][lastIndex];

  // console.log(lastRecord, "lastRecord");

  const pkgStart = lastRecord.packageStartDate;
  const pkgUpdated = packageStartTime;

  // console.log(pkgStart, "pkgStart");
  // console.log(pkgUpdated, "pkgUpdated");

  // If packageUpdatedTime does NOT match → skip
  if (pkgStart !== pkgUpdated) {
    return { found: false, leadCount: 0 };
  }

  return { found: true, leadCount: lastRecord.leadCount ?? 0 };
}
