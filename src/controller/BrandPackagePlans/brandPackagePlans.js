import { BrandPackages } from "../../model/BrandPackagePlans/brandPackagePlans.js";
import { BrandPackagesHistory } from "../../model/BrandPackagePlans/brandPackagePlanhistory.js";
import cron from "node-cron";
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

      const startDate = inv.StartDate ? new Date(inv.StartDate) : new Date();

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
          selectedPlanInvestmetrange: range.selectedPlanInvestmetrange || "",
          selectedPlanState: range.selectedPlanState || [],
        })),

        Validity: String(validityDays),

        TotalLeads: totalLeads,
        remainingLeads: remainingLeads,
        TotalAmount: totalAmount,

        PackageStartDate: startDate,
        PackageEndDate: endDate,
        CurrentDate: new Date(),
        RenewalEndDate: null,
        isExperied: inv.isExperied || false,
        isActive: inv.isActive ?? true,
        isPending: inv.isPending ?? false,
      };
    });

    return {
      packagesType: type,
      packagesName,
      planUniqueId: planUniqueId || "",
      InvestmetPackages: processedInvestments,
    };
  });

  /* ================= CREATE OR APPEND ================= */
  const result = await BrandPackages.findOneAndUpdate(
    { brandOwnerId },
    {
      $push: {
        packages: { $each: preparedPackages },
      },
    },
    {
      new: true,
      upsert: true,
    },
  );

  return result;
};

export const getBrandPackagesById = async (req, res) => {
  try {
    const { brandOwnerId } = req.params;
    console.log("GET REQUEST for brandOwnerId:", brandOwnerId);

    if (!brandOwnerId) {
      return res.status(400).json({
        success: false,
        message: "brandOwnerId is required",
      });
    }

    const data = await BrandPackages.findOne({ brandOwnerId }).lean();
    console.log("BrandPackages");

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No packages found for this brandOwnerId",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createBrandPackages = async (req, res) => {
  try {
    const { brandOwnerId, packages } = req.body;
    console.log("UPGRADE REQUEST:", { brandOwnerId, packages });

    if (!brandOwnerId || !Array.isArray(packages)) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
      });
    }

    // 🔍 Find brand
    const brandDoc = await BrandPackages.findOne({ brandOwnerId });

    if (!brandDoc) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    // 🔁 Loop all incoming packages
    for (const incomingPkg of packages) {
      const {
        packagesType,
        packagesName,
        planUniqueId,
        InvestmetPackages = [],
      } = incomingPkg;

      // 🔍 Check existing plan
      const existingPlan = brandDoc.packages.find(
        (pkg) => pkg.planUniqueId === planUniqueId,
      );

      // =========================================
      // ✅ CASE 1: PLAN EXISTS → PUSH INSIDE
      // =========================================
      if (existingPlan) {
        const formattedPackages = InvestmetPackages.map((pkg) => ({
          ...pkg,
          remainingLeads: pkg.TotalLeads || 0,
          PackageStartDate: new Date(),
          PackageEndDate: new Date(
            Date.now() + Number(pkg.Validity || 0) * 24 * 60 * 60 * 1000,
          ),
          CurrentDate: new Date(),
          RenewalEndDate: new Date(
            Date.now() + Number(pkg.Validity || 0) * 24 * 60 * 60 * 1000,
          ),
          isExperied: false,
          isActive: false,
          isPending: true,
        }));

        existingPlan.InvestmetPackages.push(...formattedPackages);
      }

      // =========================================
      // ✅ CASE 2: PLAN NOT EXISTS → CREATE NEW
      // =========================================
      else {
        const formattedPackages = InvestmetPackages.map((pkg) => ({
          ...pkg,
          remainingLeads: pkg.TotalLeads || 0,
          PackageStartDate: new Date(),
          PackageEndDate: new Date(
            Date.now() + Number(pkg.Validity || 0) * 24 * 60 * 60 * 1000,
          ),
          CurrentDate: new Date(),
          RenewalEndDate: new Date(
            Date.now() + Number(pkg.Validity || 0) * 24 * 60 * 60 * 1000,
          ),
          isExperied: false,
          isActive: false,
          isPending: true,
        }));

        brandDoc.packages.push({
          packagesType,
          packagesName,
          planUniqueId,
          InvestmetPackages: formattedPackages,
        });
      }
    }

    await brandDoc.save();

    return res.status(200).json({
      success: true,
      message: "Packages upgraded successfully",
      data: brandDoc,
    });
  } catch (error) {
    console.error("Upgrade Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateBrandPackages = async (req, res) => {
  try {
    const {
      brandOwnerId,
      planUniqueId,
      investmetPackageId,
      updates = [],
      newRanges = [],
      deleteRangeIds = [], // ✅ NEW
    } = req.body;

    if (!brandOwnerId || !planUniqueId || !investmetPackageId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const investPkgId = new mongoose.Types.ObjectId(investmetPackageId);

    /* ================= UPDATE EXISTING ================= */
    for (const item of updates) {
      const {
        investmentRangeId,
        selectedPlanInvestmetrange,
        addStates = [],
        removeStates = [],
      } = item;

      if (!investmentRangeId) continue;

      const invRangeId = new mongoose.Types.ObjectId(investmentRangeId);

      const arrayFilters = [
        { "pkg.planUniqueId": planUniqueId },
        { "invPkg._id": investPkgId },
        { "invRange._id": invRangeId },
      ];

      // 1. update range
      if (selectedPlanInvestmetrange) {
        await BrandPackages.updateOne(
          { brandOwnerId },
          {
            $set: {
              "packages.$[pkg].InvestmetPackages.$[invPkg].investmentranges.$[invRange].selectedPlanInvestmetrange":
                selectedPlanInvestmetrange,
            },
          },
          { arrayFilters },
        );
      }

      // 2. remove states
      if (removeStates.length > 0) {
        await BrandPackages.updateOne(
          { brandOwnerId },
          {
            $pull: {
              "packages.$[pkg].InvestmetPackages.$[invPkg].investmentranges.$[invRange].selectedPlanState":
                {
                  $in: removeStates,
                },
            },
          },
          { arrayFilters },
        );
      }

      // 3. add states
      if (addStates.length > 0) {
        await BrandPackages.updateOne(
          { brandOwnerId },
          {
            $addToSet: {
              "packages.$[pkg].InvestmetPackages.$[invPkg].investmentranges.$[invRange].selectedPlanState":
                {
                  $each: addStates,
                },
            },
          },
          { arrayFilters },
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
                $in: deleteRangeIds.map(
                  (id) => new mongoose.Types.ObjectId(id),
                ),
              },
            },
          },
        },
        {
          arrayFilters: [
            { "pkg.planUniqueId": planUniqueId },
            { "invPkg._id": investPkgId },
          ],
        },
      );
    }

    /* ================= ADD NEW RANGES ================= */
    if (newRanges.length > 0) {
      const formatted = newRanges.map((r) => ({
        _id: new mongoose.Types.ObjectId(),
        selectedPlanInvestmetrange: r.selectedPlanInvestmetrange,
        selectedPlanState: r.selectedPlanState || [],
      }));

      await BrandPackages.updateOne(
        { brandOwnerId },
        {
          $push: {
            "packages.$[pkg].InvestmetPackages.$[invPkg].investmentranges": {
              $each: formatted,
            },
          },
        },
        {
          arrayFilters: [
            { "pkg.planUniqueId": planUniqueId },
            { "invPkg._id": investPkgId },
          ],
        },
      );
    }

    const updatedDoc = await BrandPackages.findOne({ brandOwnerId });

    return res.status(200).json({
      success: true,
      message: "Update / Add / Delete operations completed",
      data: updatedDoc,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getBrandPackagesHistoryById = async (req, res) => {
  try {
    const { brandOwnerId } = req.params;
    console.log("GET REQUEST for brandOwnerId:", brandOwnerId);

    if (!brandOwnerId) {
      return res.status(400).json({
        success: false,
        message: "brandOwnerId is required",
      });
    }

    const data = await BrandPackagesHistory.findOne({ brandOwnerId }).lean();
    console.log("brandPackagesHistory");

    // console.log("GET DATA:", data);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No packages found for this brandOwnerId",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const brandPackageHistory = async (req, res) => {
  try {
    const { brandOwnerId } = req.params;

    if (!brandOwnerId) {
      return res.status(400).json({
        success: false,
        message: "brandOwnerId is required",
      });
    }

    // ✅ 1. Get original document
    const brand = await BrandPackages.findOne({ brandOwnerId });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    // ✅ 2. Extract inactive + rebuild active data
    const inactivePackages = [];
    const updatedPackages = [];

    brand.packages.forEach((pkg) => {
      const inactive = [];
      const active = [];

      pkg.InvestmetPackages.forEach((inv) => {
        if (inv.isActive === false) {
          inactive.push(inv);
        } else {
          active.push(inv);
        }
      });

      // 👉 Collect inactive for history
      if (inactive.length > 0) {
        inactivePackages.push({
          packagesType: pkg.packagesType,
          packagesName: pkg.packagesName,
          planUniqueId: pkg.planUniqueId,
          InvestmetPackages: inactive,
        });
      }

      // 👉 Keep only active in original
      updatedPackages.push({
        ...pkg.toObject(),
        InvestmetPackages: active,
      });
    });

    if (inactivePackages.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No inactive data found",
      });
    }

    // ✅ 3. Handle History (create or update)
    let historyDoc = await BrandPackagesHistory.findOne({ brandOwnerId });

    if (!historyDoc) {
      historyDoc = await BrandPackagesHistory.create({
        brandOwnerId: brand.brandOwnerId,
        Industry: brand.Industry,
        Category: brand.Category,
        packages: inactivePackages,
      });
    } else {
      inactivePackages.forEach((newPkg) => {
        const existingPkg = historyDoc.packages.find(
          (p) => p.planUniqueId === newPkg.planUniqueId,
        );

        if (existingPkg) {
          existingPkg.InvestmetPackages.push(...newPkg.InvestmetPackages);
        } else {
          historyDoc.packages.push(newPkg);
        }
      });

      await historyDoc.save();
    }

    // ✅ 4. UPDATE original (REMOVE inactive data)
    brand.packages = updatedPackages;
    await brand.save();

    return res.status(200).json({
      success: true,
      message: "Inactive data moved to history and removed from main",
      data: historyDoc,
    });
  } catch (error) {
    console.error("History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// export const startBrandExpiryJob = () => {
//   // ⏱️ Runs every day at 12:00 AM
// cron.schedule("*/5 * * * *", async() => {
//     console.log("🔄 Running Brand Expiry Cron Job...");

//     try {
//       const brands = await BrandPackages.find();

//       for (const brand of brands) {
//         const expiredPackages = [];
//         const updatedPackages = [];

//         brand.packages.forEach((pkg) => {
//           const expired = [];
//           const active = [];

//           pkg.InvestmetPackages.forEach((inv) => {
//             if (inv.EndDate && new Date(inv.EndDate) < new Date()) {
//               // ✅ Mark expired
//               inv.isExperied = true;
//               inv.isActive = false;

//               expired.push(inv);
//             } else {
//               active.push(inv);
//             }
//           });

//           // collect expired
//           if (expired.length > 0) {
//             expiredPackages.push({
//               packagesType: pkg.packagesType,
//               packagesName: pkg.packagesName,
//               planUniqueId: pkg.planUniqueId,
//               InvestmetPackages: expired,
//             });
//           }

//           // keep active in main
//           updatedPackages.push({
//             ...pkg.toObject(),
//             InvestmetPackages: active,
//           });
//         });

//         if (expiredPackages.length === 0) continue;

//         // 🔁 Handle history
//         let historyDoc = await BrandPackagesHistory.findOne({
//           brandOwnerId: brand.brandOwnerId,
//         });

//         if (!historyDoc) {
//           await BrandPackagesHistory.create({
//             brandOwnerId: brand.brandOwnerId,
//             Industry: brand.Industry,
//             Category: brand.Category,
//             packages: expiredPackages,
//           });
//         } else {
//           expiredPackages.forEach((newPkg) => {
//             const existingPkg = historyDoc.packages.find(
//               (p) => p.planUniqueId === newPkg.planUniqueId
//             );

//             if (existingPkg) {
//               existingPkg.InvestmetPackages.push(
//                 ...newPkg.InvestmetPackages
//               );
//             } else {
//               historyDoc.packages.push(newPkg);
//             }
//           });

//           await historyDoc.save();
//         }

//         // 🧹 Update main collection (remove expired)
//         brand.packages = updatedPackages;
//         await brand.save();
//       }

//       console.log("✅ Brand Expiry Cron Job Completed");
//     } catch (error) {
//       console.error("❌ Cron Job Error:", error);
//     }
//   });
// };

// export const startBrandExpiryJob = () => {
//   // ⏱️ Runs every 5 minutes
//   cron.schedule("*/5 * * * *", async () => {
//     console.log("🔄 Running Brand Expiry Cron Job...");

//     try {
//       const brands = await BrandPackages.find();

//       for (const brand of brands) {
//         const expiredPackages = [];
//         const updatedPackages = [];

//         brand.packages.forEach((pkg) => {
//           const expired = [];
//           const active = [];
  
//           pkg.InvestmetPackages.forEach((inv) => {
//             // ✅ ONLY CHECK remainingLeads
//             const isLeadFinished = inv.remainingLeads <= 0;

            

//             if (isLeadFinished) {
//               // ✅ Mark inactive & expired
//               inv.isExperied = true;
//               inv.isActive = false;

//               expired.push({
//                 ...inv.toObject(),
//                 isExperied: true,
//                 isActive: false,
//               });
//             } else {
//               active.push(inv);
//             }
//           });

//           // ✅ Push expired packages to history
//           if (expired.length > 0) {
//             expiredPackages.push({
//               packagesType: pkg.packagesType,
//               packagesName: pkg.packagesName,
//               planUniqueId: pkg.planUniqueId,
//               InvestmetPackages: expired,
//             });
//           }

//           // ✅ Keep only active packages
//           updatedPackages.push({
//             ...pkg.toObject(),
//             InvestmetPackages: active,
//           });
//         });

//         // ⛔ Skip if no expired packages
//         if (expiredPackages.length === 0) continue;

//         /* ======================================================
//            SAVE INTO HISTORY COLLECTION
//         ====================================================== */

//         let historyDoc = await BrandPackagesHistory.findOne({
//           brandOwnerId: brand.brandOwnerId,
//         });

//         if (!historyDoc) {
//           await BrandPackagesHistory.create({
//             brandOwnerId: brand.brandOwnerId,
//             Industry: brand.Industry,
//             Category: brand.Category,
//             packages: expiredPackages,
//           });
//         } else {
//           expiredPackages.forEach((newPkg) => {
//             const existingPkg = historyDoc.packages.find(
//               (p) => p.planUniqueId === newPkg.planUniqueId,
//             );

//             if (existingPkg) {
//               existingPkg.InvestmetPackages.push(...newPkg.InvestmetPackages);
//             } else {
//               historyDoc.packages.push(newPkg);
//             }
//           });

//           await historyDoc.save();
//         }

//         /* ======================================================
//            REMOVE EXPIRED FROM MAIN COLLECTION
//         ====================================================== */

//         brand.packages = updatedPackages.filter(
//           (pkg) => pkg.InvestmetPackages.length > 0,
//         );

//         await brand.save();
//       }

//       console.log("✅ Brand Expiry Cron Job Completed");
//     } catch (error) {
//       console.error("❌ Cron Job Error:", error);
//     }
//   });
// };

export const startBrandExpiryJob = () => {
  // ⏱️ Every 5 minutes`
  cron.schedule("*/5 * * * * ", async () => {
    console.log("🔄 Running Brand Expiry Cron Job...");

    try {
      const brands = await BrandPackages.find();

      const currentDate = new Date();

      for (const brand of brands) {
        const expiredPackages = [];
        const updatedPackages = [];

        /* ======================================================
           LOOP PACKAGES
        ====================================================== */

        brand.packages.forEach((pkg) => {
          const expiredInvestments = [];
          const activeInvestments = [];

          pkg.InvestmetPackages.forEach((inv) => {
            let shouldExpire = false;

            /* ======================================================
               CONDITION 1
               packagesType !== LISTING
               remainingLeads <= 0
            ====================================================== */

            if (
              pkg.packagesType !== "LISTING" &&
              inv.remainingLeads <= 0
            ) {
              shouldExpire = true;
            }

        

            if (
              pkg.packagesType === "LISTING" &&
              inv.RenewalEndDate &&
              new Date(inv.RenewalEndDate) <= currentDate
            ) {
              shouldExpire = true;
            }

            /* ======================================================
               EXPIRE PACKAGE
            ====================================================== */

            if (shouldExpire) {
              inv.isExperied = true;
              inv.isActive = false;

              expiredInvestments.push({
                ...inv.toObject(),
                isExperied: true,
                isActive: false,
                isPending: false,
              });
            } else {
              activeInvestments.push(inv);
            }
          });

          /* ======================================================
             PUSH EXPIRED PACKAGE
          ====================================================== */

          if (expiredInvestments.length > 0) {
            expiredPackages.push({
              packagesType: pkg.packagesType,
              packagesName: pkg.packagesName,
              planUniqueId: pkg.planUniqueId,
              InvestmetPackages: expiredInvestments,
            });
          }

          /* ======================================================
             KEEP ACTIVE PACKAGE
          ====================================================== */

          updatedPackages.push({
            ...pkg.toObject(),
            InvestmetPackages: activeInvestments,
          });
        });

        // ⛔ Skip if nothing expired
        if (expiredPackages.length === 0) {
          continue;
        }

        /* ======================================================
           SAVE HISTORY
        ====================================================== */

        let historyDoc = await BrandPackagesHistory.findOne({
          brandOwnerId: brand.brandOwnerId,
        });

        if (!historyDoc) {
          historyDoc = await BrandPackagesHistory.create({
            brandOwnerId: brand.brandOwnerId,
            Industry: brand.Industry,
            Category: brand.Category,
            packages: expiredPackages,
          });
        } else {
          expiredPackages.forEach((newPkg) => {
            const existingPkg = historyDoc.packages.find(
              (p) => p.planUniqueId === newPkg.planUniqueId
            );

            if (existingPkg) {
              existingPkg.InvestmetPackages.push(
                ...newPkg.InvestmetPackages
              );
            } else {
              historyDoc.packages.push(newPkg);
            }
          });

          await historyDoc.save();
        }

        /* ======================================================
           REMOVE EXPIRED FROM MAIN COLLECTION
        ====================================================== */

        brand.packages = updatedPackages.filter(
          (pkg) => pkg.InvestmetPackages.length > 0
        );

        await brand.save();
      }

      console.log("✅ Brand Expiry Cron Job Completed");
    } catch (error) {
      console.error("❌ Cron Job Error:", error);
    }
  });
};

export const pauseBrandPackage = async (req, res) => {
  try {
    const { brandOwnerId, packageId, investmetPackageId } = req.body;

    if (!brandOwnerId || !packageId || !investmetPackageId) {
      return res.status(400).json({
        success: false,
        message: "brandOwnerId, packageId and investmetPackageId are required",
      });
    }

    const brandPackage = await BrandPackages.findOne({
      brandOwnerId,
    });

    if (!brandPackage) {
      return res.status(404).json({
        success: false,
        message: "Brand package not found",
      });
    }

    const packageData = brandPackage.packages.id(packageId);

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const investmentPackage =
      packageData.InvestmetPackages.id(investmetPackageId);

    if (!investmentPackage) {
      return res.status(404).json({
        success: false,
        message: "Investment package not found",
      });
    }

    /* already paused */
    if (investmentPackage.isPaused) {
      return res.status(400).json({
        success: false,
        message: "Package already paused",
      });
    }

    const currentDate = new Date();

    /* calculate remaining days */
    const endDate = new Date(investmentPackage.EndDate);

    const balanceMilliseconds = endDate - currentDate;

    const balanceDays = Math.ceil(balanceMilliseconds / (1000 * 60 * 60 * 24));

    investmentPackage.isPaused = true;

    investmentPackage.pauseHistory.push({
      pausedDate: currentDate,
      balanceDays: balanceDays > 0 ? balanceDays : 0,
    });

    await brandPackage.save();

    return res.status(200).json({
      success: true,
      message: "Package paused successfully",
      data: investmentPackage,
    });
  } catch (error) {
    console.log("pauseBrandPackage Error", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resumeBrandPackage = async (req, res) => {
  try {
    const { brandOwnerId, packageId, investmetPackageId } = req.body;

    if (!brandOwnerId || !packageId || !investmetPackageId) {
      return res.status(400).json({
        success: false,
        message: "brandOwnerId, packageId and investmetPackageId are required",
      });
    }

    const brandPackage = await BrandPackages.findOne({
      brandOwnerId,
    });

    if (!brandPackage) {
      return res.status(404).json({
        success: false,
        message: "Brand package not found",
      });
    }

    const packageData = brandPackage.packages.id(packageId);

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const investmentPackage =
      packageData.InvestmetPackages.id(investmetPackageId);

    if (!investmentPackage) {
      return res.status(404).json({
        success: false,
        message: "Investment package not found",
      });
    }

    if (!investmentPackage.isPaused) {
      return res.status(400).json({
        success: false,
        message: "Package is not paused",
      });
    }

    const currentDate = new Date();

    /* get latest pause record */
    const latestPause =
      investmentPackage.pauseHistory[investmentPackage.pauseHistory.length - 1];

    if (!latestPause) {
      return res.status(400).json({
        success: false,
        message: "Pause history not found",
      });
    }

    latestPause.playDate = currentDate;

    /* extend end date using balance days */
    const newEndDate = new Date(currentDate);

    newEndDate.setDate(newEndDate.getDate() + latestPause.balanceDays);

    investmentPackage.EndDate = newEndDate;

    investmentPackage.isPaused = false;

    await brandPackage.save();

    return res.status(200).json({
      success: true,
      message: "Package resumed successfully",
      data: investmentPackage,
    });
  } catch (error) {
    console.log("resumeBrandPackage Error", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const activePackageStatus = async (req, res) => {
  try {
    const { brandOwnerId, plandata } = req.body;

    /* ================= VALIDATION ================= */
    if (!brandOwnerId) {
      return res.status(400).json({
        success: false,
        message: "brandOwnerId is required",
      });
    }

    if (!Array.isArray(plandata) || plandata.length === 0) {
      return res.status(400).json({
        success: false,
        message: "plandata must be a non-empty array",
      });
    }

    /* ================= FIND BRAND ================= */
    const brandPackage = await BrandPackages.findOne({
      brandOwnerId,
    });

    if (!brandPackage) {
      return res.status(404).json({
        success: false,
        message: "Brand package not found",
      });
    }

    /* ================= LOOP ================= */
    for (const item of plandata) {
      const { PlanuniqueId, _id,  } = item;

      /* _id must be array */
      if (!Array.isArray(_id) || _id.length === 0) {
        continue;
      }

      /* ================= FIND PACKAGE ================= */
      const packageData = brandPackage.packages.find(
        (pkg) => pkg.planUniqueId === PlanuniqueId,
      );

      if (!packageData) continue;

      /* ================= MULTIPLE IDS LOOP ================= */
      for (const investmentId of _id) {
        const investmentPackage =
          packageData.InvestmetPackages.id(investmentId);

        if (!investmentPackage) continue;

        /* ================= UPDATE ACTIVE ================= */
        investmentPackage.isActive = true;

        /* ================= WHEN ACTIVE TRUE ================= */
        if (isActive === true) {
          investmentPackage.isPending = false;

          const currentDate = new Date();

          investmentPackage.PackageStartDate = currentDate;
          
          /* validity days */
          const validityDays = Number(investmentPackage.Validity || 0);

          const endDate = new Date(currentDate);

          endDate.setDate(endDate.getDate() + validityDays);

          investmentPackage.PackageEndDate = endDate;
      
          investmentPackage.isExperied = false;
        }

        /* ================= WHEN ACTIVE FALSE ================= */
        if (isActive === false) {
          investmentPackage.isPending = true;
        }
      }
    }

    /* ================= SAVE ================= */
    await brandPackage.save();

    return res.status(200).json({
      success: true,
      message: "Investment package status updated successfully",
      data: brandPackage,
    });
  } catch (error) {
    console.log("updateInvestmentPackageStatus Error", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const upgradeBrandPackages = async (req, res) => {
  try {
    const { brandOwnerId, Existing, Package } = req.body;

    /* ======================================================
       VALIDATION
    ====================================================== */

    if (!brandOwnerId || !Existing || !Package) {
      return res.status(400).json({
        success: false,
        message: "brandOwnerId, Existing and Package are required",
      });
    }

    const { planUniqueId, _id } = Existing;

    if (!planUniqueId || !_id) {
      return res.status(400).json({
        success: false,
        message: "Existing planUniqueId and _id are required",
      });
    }

    /* ======================================================
       FIND BRAND PACKAGE
    ====================================================== */

    const brandPackage = await BrandPackages.findOne({
      brandOwnerId,
    });

    if (!brandPackage) {
      return res.status(404).json({
        success: false,
        message: "Brand package not found",
      });
    }

    /* ======================================================
       FIND EXISTING PACKAGE
    ====================================================== */

    let oldRemainingLeads = 0;
    let existingFound = false;

    for (const pkg of brandPackage.packages) {
      if (pkg.planUniqueId === planUniqueId) {
        const existingInvestmentPackage =
          pkg.InvestmetPackages.id(_id);

        if (existingInvestmentPackage) {
          existingFound = true;

          // store old remaining leads
          oldRemainingLeads =
            existingInvestmentPackage.remainingLeads || 0;

          // expire old package
          existingInvestmentPackage.remainingLeads = 0;

          existingInvestmentPackage.isActive = false;

          existingInvestmentPackage.isExperied = true;

          existingInvestmentPackage.isPending = false;

          existingInvestmentPackage.RenewalEndDate =
            new Date();
        }
      }
    }

    if (!existingFound) {
      return res.status(404).json({
        success: false,
        message: "Existing investment package not found",
      });
    }

    /* ======================================================
       CREATE NEW INVESTMENT PACKAGE
       ADD OLD REMAINING LEADS
    ====================================================== */

    const currentDate = new Date();

    const newInvestmentPackages =
      Package.InvestmetPackages.map((item) => {
        const validityDays = Number(item.Validity || 0);

        const endDate = new Date(currentDate);

        endDate.setDate(
          endDate.getDate() + validityDays
        );

        const newTotalLeads =
          (item.TotalLeads || 0) + oldRemainingLeads;

        return {
          InvestmetRageLabel:
            item.InvestmetRageLabel,

          investmentranges:
            item.investmentranges || [],

          Validity: item.Validity,

          TotalLeads: newTotalLeads,

          // old remaining leads added
          remainingLeads: newTotalLeads,

          TotalAmount: item.TotalAmount || 0,

          PackageStartDate: currentDate,

          PackageEndDate: endDate,

          CurrentDate: currentDate,

          RenewalEndDate: endDate,

          isPaused: false,

          pauseHistory: [],

          isExperied: false,

          isActive: false,

          isPending: true,
        };
      });

    /* ======================================================
       CHECK NEW PLAN UNIQUE ID EXISTS
    ====================================================== */

    const existingMainPackage =
      brandPackage.packages.find(
        (pkg) =>
          pkg.planUniqueId === Package.planUniqueId
      );

    if (existingMainPackage) {
      /* ==============================================
         SAME planUniqueId EXISTS
         PUSH NEW INVESTMENT PACKAGE
      ============================================== */

      existingMainPackage.InvestmetPackages.push(
        ...newInvestmentPackages
      );
    } else {
      /* ==============================================
         NEW planUniqueId
         CREATE NEW PACKAGE OBJECT
      ============================================== */

      brandPackage.packages.push({
        packagesType: Package.packagesType,

        packagesName: Package.packagesName,

        planUniqueId: Package.planUniqueId,

        InvestmetPackages: newInvestmentPackages,
      });
    }

    /* ======================================================
       SAVE
    ====================================================== */

    await brandPackage.save();

    return res.status(200).json({
      success: true,
      message: "Package upgraded successfully",
      data: brandPackage,
    });
  } catch (error) {
    console.error(
      "upgradeBrandPackage Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
