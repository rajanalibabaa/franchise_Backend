import { BrandPackages } from "../models/BrandPackages.js";

export const createBrandPackage = async (req, res) => {
  try {
    const { brandOwnerId, packages } = req.body;

    if (!brandOwnerId) {
      return res.status(400).json({ message: "brandOwnerId is required" });
    }

    if (!packages || !Array.isArray(packages)) {
      return res.status(400).json({ message: "packages must be array" });
    }

    /* Prepare packages */
    const preparedPackages = packages.map(pkg => {
      const startDate = pkg.startDate ? new Date(pkg.startDate) : new Date();

      let endDate = pkg.endDate;
      if (!endDate && pkg.validityDays) {
        const end = new Date(startDate);
        end.setDate(end.getDate() + pkg.validityDays);
        endDate = end;
      }

      return {
        ...pkg,
        startDate,
        endDate,
        stateCount: pkg.states ? pkg.states.length : 0,
        remainingLeads: pkg.totalLeads
      };
    });

    /* Check brand already exists */
    let brandPackages = await BrandPackages.findOne({ brandOwnerId });

    if (!brandPackages) {
      /* Create new */
      brandPackages = new BrandPackages({
        brandOwnerId,
        packages: preparedPackages
      });
    } else {
      /* Push new packages */
      brandPackages.packages.push(...preparedPackages);
    }

    await brandPackages.save();

    res.status(201).json({
      success: true,
      message: "Packages created successfully",
      data: brandPackages
    });

  } catch (error) {
    console.error("createBrandPackage error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};




import { BrandPackages } from "../models/BrandPackages.js";

export const createOrUpdateBrandPackage = async (req, res) => {
  try {
    const { brandOwnerId, packages } = req.body;

    if (!brandOwnerId) {
      return res.status(400).json({ message: "brandOwnerId is required" });
    }

    if (!packages || !Array.isArray(packages)) {
      return res.status(400).json({ message: "packages must be array" });
    }

    let brandPackages = await BrandPackages.findOne({ brandOwnerId });

    if (!brandPackages) {
      brandPackages = new BrandPackages({
        brandOwnerId,
        packages: []
      });
    }

    packages.forEach(newPkg => {

      const existingPkg = brandPackages.packages.find(
        p => p.investmentRange === newPkg.investmentRange
      );

      let finalRemainingLeads = newPkg.totalLeads;

      /* if existing found -> add but DO NOT update existing */
      if (existingPkg) {
        finalRemainingLeads =
          (existingPkg.remainingLeads || 0) + (newPkg.totalLeads || 0);
      }

      /* create only new package */
      brandPackages.packages.push({
        ...newPkg,
        startDate: new Date(),
        stateCount: newPkg.states ? newPkg.states.length : 0,
        remainingLeads: finalRemainingLeads
      });

    });

    await brandPackages.save();

    res.status(200).json({
      success: true,
      message: "Packages processed successfully",
      data: brandPackages
    });

  } catch (error) {
    console.error("createOrUpdateBrandPackage error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};