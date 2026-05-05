import { BrandPackages } from "../../model/BrandPackagePlans/brandPackagePlans.js";



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

export const createBrandPackage = async (req, res) => {
  try {
    const { brandOwnerId, Industry, Category, packages } = req.body;

    /* ========= BASIC VALIDATION ========= */
    if (!brandOwnerId) {
      return res.status(400).json({
        success: false,
        message: "brandOwnerId is required"
      });
    }

    if (!packages || !Array.isArray(packages) || packages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "packages array is required"
      });
    }

    /* ========= FORMAT DATA (NO STRUCTURE CHANGE) ========= */
    const formattedPackages = packages.map((pkg, i) => ({
      packagesType: pkg.packagesType || "",
      packagesName: pkg.packagesName || "",
      planUniqueId: pkg.planUniqueId || "",

      InvestmetPackages: (pkg.InvestmetPackages || []).map((inv, j) => {
        if (!inv) {
          throw new Error(`InvestmetPackages missing at package ${i}`);
        }

        return {
          InvestmetRageLabel: inv.InvestmetRageLabel || "",

          investmentranges: (inv.investmentranges || []).map((range) => ({
            selectedPlanInvestmetrange:
              range.selectedPlanInvestmetrange || "",
            selectedPlanState: range.selectedPlanState || []
          })),

          /* ===== TYPE FIX ===== */
          Validity: inv.Validity || "",

          TotalLeads: Number(inv.TotalLeads) || 0,
          remainingLeads: Number(inv.remainingLeads) || 0,
          TotalAmount: Number(inv.TotalAmount) || 0,

          StartDate: inv.StartDate ? new Date(inv.StartDate) : null,
          EndDate: inv.EndDate ? new Date(inv.EndDate) : null,

          isExperied: inv.isExperied || false,
          isActive: inv.isActive ?? true
        };
      })
    }));

    /* ========= CHECK EXISTING ========= */
    let existing = await BrandPackages.findOne({ brandOwnerId });

    let result;

    if (existing) {
      // APPEND NEW PACKAGES
      existing.Industry = Industry || existing.Industry;
      existing.Category = Category || existing.Category;

      existing.packages.push(...formattedPackages);

      result = await existing.save();
    } else {
      // CREATE NEW
      result = await BrandPackages.create({
        brandOwnerId,
        Industry,
        Category,
        packages: formattedPackages
      });
    }

    /* ========= RESPONSE ========= */
    return res.status(200).json({
      success: true,
      message: existing
        ? "Packages updated successfully"
        : "Packages created successfully",
      totalPackages: result.packages.length,
      data: result
    });

  } catch (error) {
    console.error("createBrandPackage error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message
    });
  }
};

