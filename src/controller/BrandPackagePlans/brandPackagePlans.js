import { BrandPackages } from "../../model/BrandPackagePlans/brandPackagePlans.js";
import mongoose from "mongoose";


export const createIntialPackages = async (brandOwnerId, packages) => {
  /* ================= VALIDATION ================= */
  if (!brandOwnerId) {
    throw new Error("brandOwnerId is required");
  }

  if (!packages || !Array.isArray(packages) || packages.length === 0) {
    throw new Error("packages array is required");
  }

  /* ================= PREPARE PACKAGES ================= */
  const preparedPackages = packages.map((pkg, i) => {
    const { packagesType, packagesName, planUniqueId, InvestmetPackages } = pkg;

    if (!packagesType || !packagesName) {
      throw new Error(`Missing package fields at index ${i}`);
    }

    /* ===== VALIDATE TYPE ===== */
    const type = packagesType.toUpperCase();
    if (!["FREE", "LEAD", "LISTING"].includes(type)) {
      throw new Error(`Invalid packagesType at index ${i}`);
    }

    /* ===== PROCESS INVESTMENT PACKAGES ===== */
    const processedInvestments = (InvestmetPackages || []).map((inv, j) => {
      if (!inv) {
        throw new Error(`InvestmetPackages missing at index ${i}-${j}`);
      }

      const validityDays = Number(inv.Validity) || 0;

      const startDate = inv.StartDate
        ? new Date(inv.StartDate)
        : new Date();

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + validityDays);

      /* ===== TYPE BASED LOGIC ===== */
      let totalLeads = Number(inv.TotalLeads) || 0;
      let remainingLeads = Number(inv.remainingLeads) || totalLeads;
      let totalAmount = Number(inv.TotalAmount) || 0;

      if (type === "FREE") {
        totalAmount = 0;
      }

      if (type === "LISTING") {
        totalLeads = 0;
        remainingLeads = 0;
      }

      if (type === "LEAD" && totalLeads === 0) {
        throw new Error(`totalLeads required for LEAD at index ${i}-${j}`);
      }

      return {
        InvestmetRageLabel: inv.InvestmetRageLabel || "",

        investmentranges: (inv.investmentranges || []).map((range) => ({
          selectedPlanInvestmetrange:
            range.selectedPlanInvestmetrange || "",
          selectedPlanState: range.selectedPlanState || []
        })),

        Validity: String(validityDays),

        TotalLeads: totalLeads,
        remainingLeads: remainingLeads,
        TotalAmount: totalAmount,

        StartDate: startDate,
        EndDate: endDate,

        isExperied: inv.isExperied || false,
        isActive: inv.isActive ?? true
      };
    });

    return {
      packagesType: type,
      packagesName,
      planUniqueId: planUniqueId || "",
      InvestmetPackages: processedInvestments
    };
  });

  /* ================= CREATE OR APPEND ================= */
  const result = await BrandPackages.findOneAndUpdate(
    { brandOwnerId },
    {
      $push: {
        packages: { $each: preparedPackages }
      }
    },
    {
      new: true,
      upsert: true
    }
  );

  return result;
};

export const upgradeBrandPackages = async (req, res) => {
  try {
    const { brandOwnerId, planUniqueId, InvestmetRageLabel } = req.body;

    if (!brandOwnerId || !planUniqueId || !InvestmetRageLabel) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const brand = await BrandPackages.findOne({ brandOwnerId });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found"
      });
    }

    let updated = false;

    brand.packages.forEach(pkg => {
      if (pkg.planUniqueId === planUniqueId) {
        pkg.InvestmetPackages.forEach(inv => {
          if (inv._id.toString() === investmetPackageId) {
            inv.isActive = true;
            inv.isExperied = false;
            updated = true;
          }
        });
      }
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Investment package not found"
      });
    }

    await brand.save();

    return res.status(200).json({
      success: true,
      message: "Package upgraded successfully",
      data: brand
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};





export const updateBrandPackages = async (req, res) => {
  try {
    const {
      brandOwnerId,
      planId,
      investmetPackageId,
      updates = [],
      newRanges = [],
      deleteRangeIds = []   // ✅ NEW
    } = req.body;

    if (!brandOwnerId || !planId || !investmetPackageId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const investPkgId = new mongoose.Types.ObjectId(investmetPackageId);

    /* ================= UPDATE EXISTING ================= */
    for (const item of updates) {
      const {
        investmentRangeId,
        selectedPlanInvestmetrange,
        addStates = [],
        removeStates = []
      } = item;

      if (!investmentRangeId) continue;

      const invRangeId = new mongoose.Types.ObjectId(investmentRangeId);

      const arrayFilters = [
        { "pkg.planId": planId },
        { "invPkg._id": investPkgId },
        { "invRange._id": invRangeId }
      ];

      // 1. update range
      if (selectedPlanInvestmetrange) {
        await BrandPackages.updateOne(
          { brandOwnerId },
          {
            $set: {
              "packages.$[pkg].InvestmetPackages.$[invPkg].investmentranges.$[invRange].selectedPlanInvestmetrange":
                selectedPlanInvestmetrange
            }
          },
          { arrayFilters }
        );
      }

      // 2. remove states
      if (removeStates.length > 0) {
        await BrandPackages.updateOne(
          { brandOwnerId },
          {
            $pull: {
              "packages.$[pkg].InvestmetPackages.$[invPkg].investmentranges.$[invRange].selectedPlanState": {
                $in: removeStates
              }
            }
          },
          { arrayFilters }
        );
      }

      // 3. add states
      if (addStates.length > 0) {
        await BrandPackages.updateOne(
          { brandOwnerId },
          {
            $addToSet: {
              "packages.$[pkg].InvestmetPackages.$[invPkg].investmentranges.$[invRange].selectedPlanState": {
                $each: addStates
              }
            }
          },
          { arrayFilters }
        );
      }
    }

    /* ================= DELETE RANGES (NEW) ================= */
    if (deleteRangeIds.length > 0) {
      await BrandPackages.updateOne(
        { brandOwnerId },
        {
          $pull: {
            "packages.$[pkg].InvestmetPackages.$[invPkg].investmentranges": {
              _id: {
                $in: deleteRangeIds.map(id => new mongoose.Types.ObjectId(id))
              }
            }
          }
        },
        {
          arrayFilters: [
            { "pkg.planId": planId },
            { "invPkg._id": investPkgId }
          ]
        }
      );
    }

    /* ================= ADD NEW RANGES ================= */
    if (newRanges.length > 0) {
      const formatted = newRanges.map(r => ({
        _id: new mongoose.Types.ObjectId(),
        selectedPlanInvestmetrange: r.selectedPlanInvestmetrange,
        selectedPlanState: r.selectedPlanState || []
      }));

      await BrandPackages.updateOne(
        { brandOwnerId },
        {
          $push: {
            "packages.$[pkg].InvestmetPackages.$[invPkg].investmentranges": {
              $each: formatted
            }
          }
        },
        {
          arrayFilters: [
            { "pkg.planId": planId },
            { "invPkg._id": investPkgId }
          ]
        }
      );
    }

    const updatedDoc = await BrandPackages.findOne({ brandOwnerId });

    return res.status(200).json({
      success: true,
      message: "Update / Add / Delete operations completed",
      data: updatedDoc
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};