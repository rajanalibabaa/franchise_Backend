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
    const {
      PakageType,
      planName,
      validityDays,  
      totalAmount,
      totalLeads,
      investmentRangeLabel,
      individualInvestment
    } = pkg;

    if (!PakageType || !planName || !validityDays || totalAmount == null) {
      throw new Error(`Missing required fields at index ${i}`);
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + validityDays);

    /* ===== LEAD ===== */
    if (PakageType === "LEAD") {
      if (totalLeads == null) {
        throw new Error(`totalLeads required for LEAD at index ${i}`);
      }

      return {
        PakageType,
        planName,
        validityDays,
        totalAmount,
        totalLeads,
        remainingLeads: totalLeads,
        investmentRangeLabel,
        individualInvestment: individualInvestment || [],
        startDate,
        endDate,
        isExpired: false,
        isActive: true
      };
    }

    /* ===== LISTING ===== */
    if (PakageType === "LISTING") {
      return {
        PakageType,
        planName,
        validityDays,
        totalAmount,
        investmentRangeLabel,
        individualInvestment: individualInvestment || [],
        totalLeads: 0,
        remainingLeads: 0,
        startDate,
        endDate,
        isExpired: false,
        isActive: true
      };
    }

    throw new Error(`Invalid PakageType at index ${i}`);
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
    const { brandOwnerId, packages } = req.body;

    const result = await createIntialPackages(brandOwnerId, packages);

    return res.status(200).json({
      success: true,
      message: "Packages added successfully",
      totalPackages: result.packages.length,
      data: result
    });

  } catch (error) {
    console.error("createBrandPackage error:", error);

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};



export const upgradeBrandPackages = async (req, res) => {
  try {
    const { brandOwnerId, packages } = req.body;

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

    /* ================= FIND BRAND ================= */
    const doc = await BrandPackages.findOne({ brandOwnerId });

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Brand not found"
      });
    }

    /* ================= LOOP MULTIPLE PACKAGES ================= */
    packages.forEach((pkg) => {
      const { _id, totalAmount, individualInvestment } = pkg;

      if (!_id) return;

      const index = doc.packages.findIndex(
        (p) => p._id.toString() === _id
      );

      if (index === -1) return;

      /* ================= ONLY WHEN AMOUNT = 0 ================= */
      if (totalAmount === 0 && Array.isArray(individualInvestment)) {
        const existingInvestments =
          doc.packages[index].individualInvestment || [];

        /* 🔥 MERGE (ADD NEW RANGES) */
        individualInvestment.forEach((newItem) => {
          const exists = existingInvestments.some(
            (old) =>
              old.investmentRange === newItem.investmentRange
          );

          if (!exists) {
            existingInvestments.push(newItem);
          }
        });

        doc.packages[index].individualInvestment = existingInvestments;
      }
    });

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "Packages upgraded successfully",
      data: doc
    });

  } catch (error) {
    console.error("upgradeBrandPackages error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};