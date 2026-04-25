import { BrandPackages } from "../../model/BrandPackagePlans/brandPackagePlans.js";

export const createBrandPackage = async (req, res) => {
  try {
    const { brandOwnerId, packages } = req.body;

    if (!brandOwnerId) {
      return res.status(400).json({ success: false, message: "brandOwnerId is required" });
    }

    if (!packages || !Array.isArray(packages) || packages.length === 0) {
      return res.status(400).json({ success: false, message: "packages must be a non-empty array" });
    }

    /* ================= PREPARE PACKAGES ================= */

    const preparedPackages = packages.map((pkg, i) => {
      const {
        planName,
        investmentRange,
        validityDays,
        states,
        totalLeads,
        totalAmount
      } = pkg;

      if (
        !planName ||
        !investmentRange ||
        !validityDays ||
        !states ||
        !Array.isArray(states) ||
        states.length === 0 ||
        totalLeads == null ||
        totalAmount == null
      ) {
        throw new Error(`All fields are required in package index ${i}`);
      }

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + validityDays);

      return {
        planName,
        investmentRange,
        validityDays,
        states,
        stateCount: states.length,
        totalLeads,
        remainingLeads: totalLeads,
        totalAmount,
        startDate,
        endDate,
        isExpired: false,
        isActive: true
      };
    });

    /* ================= UPSERT (CREATE OR UPDATE) ================= */

    const brandPackages = await BrandPackages.findOneAndUpdate(
      { brandOwnerId },
      {
        $push: { packages: { $each: preparedPackages } }
      },
      {
        new: true,
        upsert: true // if not exists → create
      }
    );

    return res.status(201).json({
      success: true,
      message: "Packages created/added successfully",
      data: brandPackages
    });

  } catch (error) {
    console.error("createBrandPackage error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};