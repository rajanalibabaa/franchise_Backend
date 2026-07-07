import {BrandPackages} from "../../model/BrandPackagePlans/brandPackagePlans.js";

export const getActivePackageLeadDetails = async (req, res) => {
  try {
    const { brandOwnerId } = req.params;

    if (!brandOwnerId) {
      return res.status(400).json({
        success: false,
        message: "brandOwnerId is required",
      });
    }

    const packageDoc = await BrandPackages.findOne({ brandOwnerId });

    if (!packageDoc) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    let activePackage = null;
    let activeInvestment = null;

    for (const pkg of packageDoc.packages) {
      const investment = pkg.investmetPackages.find(
        (item) => item.isActive && !item.isExperied
      );

      if (investment) {
        activePackage = pkg;
        activeInvestment = investment;
        break;
      }
    }

    if (!activeInvestment) {
      return res.status(404).json({
        success: false,
        message: "No active package found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        packageType: activePackage.packagesType,
        packageName: activeInvestment.packagesName,
        totalLeads: activeInvestment.totalLeads,
        sendingLeads: activeInvestment.sendingLeads,
        remainingLeads: activeInvestment.remainingLeads,
        sendingPercentage: activeInvestment.sendingPercentage,
        packageStartDate: activeInvestment.packageStartDate,
        packageEndDate: activeInvestment.packageEndDate,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const assignLeadToPackage = async (req, res) => {
  try {
    const { brandOwnerId, investorId } = req.body;

    if (!brandOwnerId ) {
      return res.status(400).json({
        success: false,
        message: "brandOwnerId and investorId are required",
      });
    }

    // Find Brand Package
    const packageDoc = await BrandPackages.findOne({ brandOwnerId });

    if (!packageDoc) {
      return res.status(404).json({
        success: false,
        message: "Brand package not found",
      });
    }

    // Find Active Investment Package
    let activePackage = null;
    let activeInvestment = null;

    for (const pkg of packageDoc.packages) {
      const investment = pkg.investmetPackages.find(
        (item) => item.isActive && !item.isExperied
      );

      if (investment) {
        activePackage = pkg;
        activeInvestment = investment;
        break;
      }
    }

    if (!activeInvestment) {
      return res.status(404).json({
        success: false,
        message: "No active package found",
      });
    }

    // Check Remaining Leads
    if (activeInvestment.remainingLeads <= 0) {
      return res.status(400).json({
        success: false,
        message: "Lead limit exceeded",
      });
    }

    // Prevent duplicate lead assignment (optional)
    if (!activeInvestment.sentLeadIds) {
      activeInvestment.sentLeadIds = [];
    }

    if (activeInvestment.sentLeadIds.includes(investorId)) {
      return res.status(400).json({
        success: false,
        message: "Lead already assigned",
      });
    }

    // Store Investor ID
    activeInvestment.sentLeadIds.push(investorId);

    // Update Counts
    activeInvestment.sendingLeads += 1;
    activeInvestment.remainingLeads -= 1;

    activeInvestment.sendingPercentage = Math.round(
      (activeInvestment.sendingLeads /
        activeInvestment.totalLeads) *
        100
    );

    await packageDoc.save();

    return res.status(200).json({
      success: true,
      message: "Lead assigned successfully",

      data: {
        packageType: activePackage.packagesType,
        packageName: activeInvestment.packagesName,

        totalLeads: activeInvestment.totalLeads,
        sentLeads: activeInvestment.sendingLeads,
        remainingLeads: activeInvestment.remainingLeads,
        sendingPercentage: activeInvestment.sendingPercentage,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};