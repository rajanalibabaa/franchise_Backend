import { BrandPackages } from "../../model/BrandPackagePlans/brandPackagePlans.js";

export const createBrandPackage = async (req, res) => {
  try {
    const { brandOwnerId, packages, listingPackages } = req.body;

    /* ================= VALIDATION ================= */

    if (!brandOwnerId) {
      return res.status(400).json({
        success: false,
        message: "brandOwnerId is required"
      });
    }

    /* ================= PREPARE MAIN PACKAGES ================= */

    let preparedPackages = [];

    if (packages && Array.isArray(packages) && packages.length > 0) {
      preparedPackages = packages.map((pkg, i) => {
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
    }

    /* ================= PREPARE LISTING PACKAGES (OPTIONAL) ================= */

    let preparedListingPackages = [];

    if (listingPackages && Array.isArray(listingPackages) && listingPackages.length > 0) {
      preparedListingPackages = listingPackages.map((pkg, i) => {
        const { name, amount, validityDays } = pkg;

        if (!name || amount == null || !validityDays) {
          throw new Error(`All fields are required in listing package index ${i}`);
        }

        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + validityDays);

        return {
          name,
          amount,
          validityDays,
          startDate,
          endDate,
          isExpired: false,
          isActive: true
        };
      });
    }

    /* ================= BUILD UPDATE OBJECT ================= */

    const updateQuery = {};

    if (preparedPackages.length > 0) {
      updateQuery.$push = {
        ...(updateQuery.$push || {}),
        packages: { $each: preparedPackages }
      };
    }

    if (preparedListingPackages.length > 0) {
      updateQuery.$push = {
        ...(updateQuery.$push || {}),
        listingPackages: { $each: preparedListingPackages }
      };
    }

    /* If nothing to insert */
    if (!updateQuery.$push) {
      return res.status(400).json({
        success: false,
        message: "Nothing to insert"
      });
    }

    /* ================= UPSERT ================= */

    const brandPackages = await BrandPackages.findOneAndUpdate(
      { brandOwnerId },
      updateQuery,
      {
        new: true,
        upsert: true
      }
    );

    return res.status(201).json({
      success: true,
      message: "Packages stored successfully",
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