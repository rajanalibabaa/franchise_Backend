import { BrandPackages } from "../../model/BrandPackagePlans/brandPackagePlans.js";
import { BrandPackagesHistory } from "../../model/BrandPackagePlans/brandPackagePlanhistory.js";
import cron from "node-cron";
import mongoose from "mongoose";

export const createIntialPackages = async (req, res) => {
  try {
    const { brandOwnerId, Industry, Category, brandName, packages } = req.body;

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!brandOwnerId) {
      return res.status(400).json({
        success: false,
        message: "brandOwnerId is required",
      });
    }

    if (!packages || !Array.isArray(packages) || packages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "packages array is required",
      });
    }

    /* =====================================================
       ONLY SINGLE FREE PACKAGE ALLOWED
    ===================================================== */

    if (packages.length > 1) {
      return res.status(400).json({
        success: false,
        message: "Initially only one FREE package can be created",
      });
    }

    const packageData = packages[0];

    if (packageData.packagesType?.toUpperCase() !== "FREE") {
      return res.status(400).json({
        success: false,
        message: "Initially only FREE package is allowed",
      });
    }

    /* =====================================================
       CHECK EXISTING BRAND
    ===================================================== */

    const existingBrand = await BrandPackages.findOne({
      brandOwnerId,
    });

    if (existingBrand) {
      return res.status(400).json({
        success: false,
        message: "Initial package already created",
      });
    }

    /* =====================================================
       PROCESS FREE PACKAGE
    ===================================================== */
    const processedInvestments = (packageData.InvestmetPackages || []).map(
      (inv, index) => {
        const validityString = inv.Validity || "0";

        /* =========================================
       EXTRACT NUMBER FROM "60 Days"
    ========================================= */

        const validityDays = parseInt(validityString) || 0;

        const startDate = new Date();

        const endDate = new Date(startDate);

        endDate.setDate(startDate.getDate() + validityDays);

        return {
          packagesName: inv.packagesName || "",

          planUniqueId: inv.planId || "",

          investmetRageLabel: inv.investmetRageLabel || "",

          /* =========================================
         STORE STATE + DISTRICT PROPERLY
      ========================================= */

          investmentranges: (inv.investmentranges || []).map((range) => ({
            selectedPlanInvestmetrange: range.selectedPlanInvestmetrange || "",

            selectedPlanStateAndDistrict: (
              range.selectedPlanStateAndDistrict || []
            ).map((item) => ({
              state: item.state || "",

              district: Array.isArray(item.district) ? item.district : [],
            })),
          })),

          validity: validityString,

          /* =========================================
         LEADS
      ========================================= */

          totalLeads: Number(inv.totalLeads) || 0,

          sendingLeads: 0,

          sendingPercentage: 0,

          remainingLeads: Number(inv.remainingLeads) || 0,

          totalAmount: Number(inv.totalAmount) || 0,

          /* =========================================
         DATES
      ========================================= */

          packageStartDate: startDate,

          packageEndDate: endDate,

          currentDate: new Date(),

          renewalEndDate: endDate,

          /* =========================================
         STATUS
      ========================================= */

          isPaused: false,

          pauseHistory: [],

          isExperied: false,

          isActive: true,

          isPending: false,
        };
      },
    );

    /* =====================================================
       CREATE DOCUMENT
    ===================================================== */

    const newBrandPackage = new BrandPackages({
      brandOwnerId,

      industry: Industry || "",

      category: Category || "",

      brandName: brandName || "",

      packages: [
        {
          packagesType: "FREE",

          investmetPackages: processedInvestments,
        },
      ],
    });

    await newBrandPackage.save();

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.status(201).json({
      success: true,
      message: "Initial FREE package created successfully",
      data: newBrandPackage,
    });
  } catch (error) {
    console.error("createIntialPackages Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
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

    console.log("CREATE PACKAGE REQUEST:", {
      brandOwnerId,
      packages,
    });

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!brandOwnerId || !Array.isArray(packages)) {
      return res.status(400).json({
        success: false,
        message: "brandOwnerId and packages are required",
      });
    }

    /* =====================================================
       FIND BRAND
    ===================================================== */

    const brandDoc = await BrandPackages.findOne({
      brandOwnerId,
    });

    if (!brandDoc) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    /* =====================================================
       LOOP PACKAGES
    ===================================================== */

    for (const incomingPkg of packages) {
      const { packagesType, investmetPackages = [] } = incomingPkg;

      if (!packagesType) {
        continue;
      }

      /* =====================================================
         FIND EXISTING PACKAGE TYPE
         NOW CHECKING packagesType ONLY
      ===================================================== */

      const existingPackageType = brandDoc.packages.find(
        (pkg) => pkg.packagesType === packagesType.toUpperCase(),
      );

      /* =====================================================
         FORMAT INVESTMENT PACKAGES
      ===================================================== */

      const formattedPackages = investmetPackages.map((pkg) => {
        const validityDays = Number(pkg.validity) || 0;

        const startDate = new Date();

        const endDate = new Date();

        endDate.setDate(endDate.getDate() + validityDays);

        let totalLeads = Number(pkg.totalLeads) || 0;

        let remainingLeads = Number(pkg.remainingLeads) || totalLeads;

        let sendingLeads = Number(pkg.sendingLeads) || 0;

        let sendingPercentage = Number(pkg.sendingPercentage) || 0;

        let totalAmount = Number(pkg.totalAmount) || 0;

        /* =========================================
             TYPE BASED LOGIC
          ========================================= */

        if (packagesType.toUpperCase() === "LISTING") {
          totalLeads = 0;
          remainingLeads = 0;
          sendingLeads = 0;
          sendingPercentage = 0;
        }

        if (packagesType.toUpperCase() === "FREE") {
          totalAmount = 0;
        }

        return {
          packagesName: pkg.packagesName || "",

          planUniqueId: pkg.planUniqueId || "",

          investmetRageLabel: pkg.investmetRageLabel || "",

          investmentranges: (pkg.investmentranges || []).map((range) => ({
            selectedPlanInvestmetrange: range.selectedPlanInvestmetrange || "",

            selectedPlanStateAndDistrict: (
              range.selectedPlanStateAndDistrict || []
            ).map((stateObj) => ({
              state: stateObj.state || "",

              district: stateObj.district || [],
            })),
          })),

          validity: String(validityDays),

          totalLeads: totalLeads,

          sendingLeads: sendingLeads,

          sendingPercentage: sendingPercentage,

          remainingLeads: remainingLeads,

          totalAmount: totalAmount,

          packageStartDate: startDate,

          packageEndDate: endDate,

          currentDate: startDate,

          renewalEndDate: endDate,

          isPaused: false,

          pauseHistory: [],

          isExperied: false,

          isActive: false,

          isPending: true,
        };
      });

      /* =====================================================
         CASE 1
         EXISTING PACKAGE TYPE FOUND
         PUSH INVESTMENT PACKAGES
      ===================================================== */

      if (existingPackageType) {
        existingPackageType.InvestmetPackages.push(...formattedPackages);
      } else {

      /* =====================================================
         CASE 2
         CREATE NEW PACKAGE TYPE
      ===================================================== */
        brandDoc.packages.push({
          packagesType: packagesType.toUpperCase(),

          InvestmetPackages: formattedPackages,
        });
      }
    }

    /* =====================================================
       SAVE
    ===================================================== */

    await brandDoc.save();

    return res.status(200).json({
      success: true,
      message: "Packages created successfully",
      data: brandDoc,
    });
  } catch (error) {
    console.error("createBrandPackages Error:", error);

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
      planType, // FREE | LEAD | LISTING
      investmetPackageId,

      updates = [],
      newRanges = [],
      deleteRangeIds = [],
    } = req.body;

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (
      !brandOwnerId ||
      !planType ||
      !investmetPackageId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "brandOwnerId, planType, investmetPackageId are required",
      });
    }

    const investPkgId =
      new mongoose.Types.ObjectId(
        investmetPackageId,
      );

    /* =====================================================
       CHECK BRAND EXISTS
    ===================================================== */

    const brandData =
      await BrandPackages.findOne({
        brandOwnerId,
      });

    if (!brandData) {
      return res.status(404).json({
        success: false,
        message:
          "Brand package not found",
      });
    }

    /* =====================================================
       COMMON ARRAY FILTERS
    ===================================================== */

    const commonFilters = [
      {
        "pkg.packagesType":
          planType,
      },
      {
        "invPkg._id": investPkgId,
      },
    ];

    /* =====================================================
       UPDATE EXISTING RANGES
    ===================================================== */

    for (const item of updates) {
      const {
        investmentRangeId,

        // update range label
        selectedPlanInvestmetrange,

        // full replace
        selectedPlanStateAndDistrict,

        // full state ops
        addStates = [],
        removeStates = [],

        // district ops
        addDistricts = [],
        removeDistricts = [],
      } = item;

      if (!investmentRangeId)
        continue;

      const invRangeId =
        new mongoose.Types.ObjectId(
          investmentRangeId,
        );

      const arrayFilters = [
        ...commonFilters,
        {
          "invRange._id":
            invRangeId,
        },
      ];

      /* =====================================================
         1. UPDATE RANGE LABEL
      ===================================================== */

      if (
        selectedPlanInvestmetrange
      ) {
        await BrandPackages.updateOne(
          {
            brandOwnerId,
          },
          {
            $set: {
              "packages.$[pkg].investmetPackages.$[invPkg].investmentranges.$[invRange].selectedPlanInvestmetrange":
                selectedPlanInvestmetrange,
            },
          },
          {
            arrayFilters,
          },
        );
      }

      /* =====================================================
         2. FULL REPLACE STATE + DISTRICT
      ===================================================== */

      if (
        selectedPlanStateAndDistrict
      ) {
        await BrandPackages.updateOne(
          {
            brandOwnerId,
          },
          {
            $set: {
              "packages.$[pkg].investmetPackages.$[invPkg].investmentranges.$[invRange].selectedPlanStateAndDistrict":
                selectedPlanStateAndDistrict,
            },
          },
          {
            arrayFilters,
          },
        );
      }

      /* =====================================================
         3. REMOVE FULL STATE
         -> districts auto removed
      ===================================================== */

      if (removeStates.length > 0) {
        await BrandPackages.updateOne(
          {
            brandOwnerId,
          },
          {
            $pull: {
              "packages.$[pkg].investmetPackages.$[invPkg].investmentranges.$[invRange].selectedPlanStateAndDistrict":
                {
                  state: {
                    $in: removeStates,
                  },
                },
            },
          },
          {
            arrayFilters,
          },
        );
      }

      /* =====================================================
         4. ADD NEW STATE + DISTRICTS
      ===================================================== */

      // if (addStates.length > 0) {
      //   const formattedStates =
      //     addStates.map((obj) => {
      //       if (
      //         typeof obj ===
      //         "string"
      //       ) {
      //         return {
      //           state: obj,
      //           district: [],
      //         };
      //       }

      //       return {
      //         state: obj.state,
      //         district:
      //           obj.district ||
      //           [],
      //       };
      //     });

      //   await BrandPackages.updateOne(
      //     {
      //       brandOwnerId,
      //     },
      //     {
      //       $addToSet: {
      //         "packages.$[pkg].investmetPackages.$[invPkg].investmentranges.$[invRange].selectedPlanStateAndDistrict":
      //           {
      //             $each:
      //               formattedStates,
      //           },
      //       },
      //     },
      //     {
      //       arrayFilters,
      //     },
      //   );
      // }
      /* =====================================================
   4. ADD NEW STATE + DISTRICTS
   -> DO NOT ADD IF STATE ALREADY EXISTS
===================================================== */

if (addStates.length > 0) {
  // get current document
  const existingDoc =
    await BrandPackages.findOne({
      brandOwnerId,
    });

  if (existingDoc) {
    const packageData =
      existingDoc.packages.find(
        (pkg) =>
          pkg.packagesType ===
          planType,
      );

    const investmentPackage =
      packageData?.investmetPackages.find(
        (inv) =>
          inv._id.toString() ===
          investPkgId.toString(),
      );

    const investmentRange =
      investmentPackage?.investmentranges.find(
        (range) =>
          range._id.toString() ===
          invRangeId.toString(),
      );

    if (investmentRange) {
      const existingStates =
        investmentRange.selectedPlanStateAndDistrict.map(
          (s) =>
            s.state.toLowerCase(),
        );

      // filter only new states
      const filteredStates =
        addStates.filter((obj) => {
          const stateName =
            (
              typeof obj ===
              "string"
                ? obj
                : obj.state
            ).toLowerCase();

          return !existingStates.includes(
            stateName,
          );
        });

      if (
        filteredStates.length > 0
      ) {
        const formattedStates =
          filteredStates.map(
            (obj) => {
              if (
                typeof obj ===
                "string"
              ) {
                return {
                  state: obj,
                  district: [],
                };
              }

              return {
                state: obj.state,
                district:
                  obj.district ||
                  [],
              };
            },
          );

        await BrandPackages.updateOne(
          {
            brandOwnerId,
          },
          {
            $push: {
              "packages.$[pkg].investmetPackages.$[invPkg].investmentranges.$[invRange].selectedPlanStateAndDistrict":
                {
                  $each:
                    formattedStates,
                },
            },
          },
          {
            arrayFilters,
          },
        );
      }
    }
  }
}

      /* =====================================================
         5. REMOVE PARTICULAR DISTRICT
      =====================================================

         FORMAT:

         removeDistricts: [
           {
             state: "Tamil Nadu",
             districts: ["Chennai"]
           }
         ]

      ===================================================== */

      for (const distObj of removeDistricts) {
        await BrandPackages.updateOne(
          {
            brandOwnerId,
          },
          {
            $pull: {
              "packages.$[pkg].investmetPackages.$[invPkg].investmentranges.$[invRange].selectedPlanStateAndDistrict.$[stateObj].district":
                {
                  $in:
                    distObj.districts ||
                    [],
                },
            },
          },
          {
            arrayFilters: [
              ...arrayFilters,
              {
                "stateObj.state":
                  distObj.state,
              },
            ],
          },
        );
      }

      /* =====================================================
         6. ADD DISTRICT INSIDE EXISTING STATE
      =====================================================

         FORMAT:

         addDistricts: [
           {
             state: "Tamil Nadu",
             districts: [
               "Erode",
               "Salem"
             ]
           }
         ]

      ===================================================== */

      for (const distObj of addDistricts) {
        await BrandPackages.updateOne(
          {
            brandOwnerId,
          },
          {
            $addToSet: {
              "packages.$[pkg].investmetPackages.$[invPkg].investmentranges.$[invRange].selectedPlanStateAndDistrict.$[stateObj].district":
                {
                  $each:
                    distObj.districts ||
                    [],
                },
            },
          },
          {
            arrayFilters: [
              ...arrayFilters,
              {
                "stateObj.state":
                  distObj.state,
              },
            ],
          },
        );
      }
    }

    /* =====================================================
       DELETE FULL INVESTMENT RANGE
    ===================================================== */

    if (deleteRangeIds.length > 0) {
      await BrandPackages.updateOne(
        {
          brandOwnerId,
        },
        {
          $pull: {
            "packages.$[pkg].investmetPackages.$[invPkg].investmentranges":
              {
                _id: {
                  $in:
                    deleteRangeIds.map(
                      (id) =>
                        new mongoose.Types.ObjectId(
                          id,
                        ),
                    ),
                },
              },
          },
        },
        {
          arrayFilters:
            commonFilters,
        },
      );
    }

    /* =====================================================
       ADD NEW INVESTMENT RANGE
    ===================================================== */

    if (newRanges.length > 0) {
      const formattedRanges =
        newRanges.map((r) => ({
          _id:
            new mongoose.Types.ObjectId(),

          selectedPlanInvestmetrange:
            r.selectedPlanInvestmetrange,

          selectedPlanStateAndDistrict:
            r.selectedPlanStateAndDistrict ||
            [],
        }));

      await BrandPackages.updateOne(
        {
          brandOwnerId,
        },
        {
          $push: {
            "packages.$[pkg].investmetPackages.$[invPkg].investmentranges":
              {
                $each:
                  formattedRanges,
              },
          },
        },
        {
          arrayFilters:
            commonFilters,
        },
      );
    }

    /* =====================================================
       GET UPDATED DATA
    ===================================================== */

    const updatedData =
      await BrandPackages.findOne({
        brandOwnerId,
      });

    return res.status(200).json({
      success: true,
      message:
        "Brand package updated successfully",
      data: updatedData,
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

// export const brandPackageHistory = async (req, res) => {
//   try {
//     const { brandOwnerId } = req.params;

//     if (!brandOwnerId) {
//       return res.status(400).json({
//         success: false,
//         message: "brandOwnerId is required",
//       });
//     }

//     // ✅ 1. Get original document
//     const brand = await BrandPackages.findOne({ brandOwnerId });

//     if (!brand) {
//       return res.status(404).json({
//         success: false,
//         message: "Brand not found",
//       });
//     }

//     // ✅ 2. Extract inactive + rebuild active data
//     const inactivePackages = [];
//     const updatedPackages = [];

//     brand.packages.forEach((pkg) => {
//       const inactive = [];
//       const active = [];

//       pkg.InvestmetPackages.forEach((inv) => {
//         if (inv.isActive === false) {
//           inactive.push(inv);
//         } else {
//           active.push(inv);
//         }
//       });

//       // 👉 Collect inactive for history
//       if (inactive.length > 0) {
//         inactivePackages.push({
//           packagesType: pkg.packagesType,
//           packagesName: pkg.packagesName,
//           planUniqueId: pkg.planUniqueId,
//           InvestmetPackages: inactive,
//         });
//       }

//       // 👉 Keep only active in original
//       updatedPackages.push({
//         ...pkg.toObject(),
//         InvestmetPackages: active,
//       });
//     });

//     if (inactivePackages.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: "No inactive data found",
//       });
//     }

//     // ✅ 3. Handle History (create or update)
//     let historyDoc = await BrandPackagesHistory.findOne({ brandOwnerId });

//     if (!historyDoc) {
//       historyDoc = await BrandPackagesHistory.create({
//         brandOwnerId: brand.brandOwnerId,
//         Industry: brand.Industry,
//         Category: brand.Category,
//         packages: inactivePackages,
//       });
//     } else {
//       inactivePackages.forEach((newPkg) => {
//         const existingPkg = historyDoc.packages.find(
//           (p) => p.planUniqueId === newPkg.planUniqueId,
//         );

//         if (existingPkg) {
//           existingPkg.InvestmetPackages.push(...newPkg.InvestmetPackages);
//         } else {
//           historyDoc.packages.push(newPkg);
//         }
//       });

//       await historyDoc.save();
//     }

//     // ✅ 4. UPDATE original (REMOVE inactive data)
//     brand.packages = updatedPackages;
//     await brand.save();

//     return res.status(200).json({
//       success: true,
//       message: "Inactive data moved to history and removed from main",
//       data: historyDoc,
//     });
//   } catch (error) {
//     console.error("History Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

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
  
  // ⏱️ Every 5 minutes
  let jobRunning = false;

  cron.schedule(
    "*/5 * * * * *",
    async () => {
      if (jobRunning) {
        console.log("⏳ Previous Brand Expiry job still running — skipping this run.");
        return;
      }

      jobRunning = true;

      try {
        if (
          mongoose.connection.readyState !== 1 ||
          !mongoose.connection.db
        ) {
          console.warn(
            "⚠️ Skipping Brand Expiry Cron Job because MongoDB is not connected. readyState=",
            mongoose.connection.readyState,
          );
          return;
        }

        console.log("🔄 Running Brand Expiry Cron Job...");

        // Attempt DB query with timeout; handle network timeouts gracefully
        let brands = [];
        try {
          brands = await BrandPackages.find().lean().maxTimeMS(15000);
        } catch (dbErr) {
          if (
            dbErr.name === "MongoNetworkTimeoutError" ||
            (dbErr.message && dbErr.message.includes("timed out"))
          ) {
            console.error(
              "❌ Cron Job Error: MongoDB timeout during BrandPackages.find():",
              dbErr.message,
            );
            return;
          }
          throw dbErr;
        }

        const currentDate = new Date();

        for (const brand of brands) {
          const expiredPackages = [];
          const updatedPackages = [];

          /* ======================================================
             LOOP PACKAGES
          ====================================================== */

          const brandPackages = Array.isArray(brand.packages) ? brand.packages : [];

          brandPackages.forEach((pkg) => {
            const expiredInvestments = [];
            const activeInvestments = [];
            const investments = pkg.investmetPackages ?? pkg.InvestmetPackages ?? [];

            investments.forEach((inv) => {
              let shouldExpire = false;

              /* ======================================================
                 CONDITION 1
                 packagesType !== LISTING
                 remainingLeads <= 0
              ====================================================== */

              if (pkg.packagesType === "LEAD" && inv.remainingLeads <= 0) {
                shouldExpire = true;
              }

              if (
                pkg.packagesType === "LISTING" &&
                inv.RenewalEndDate &&
                new Date(inv.RenewalEndDate) <= currentDate
              ) {
                shouldExpire = true;
              }

              if (
                pkg.packagesType === "FREE" &&
                inv.RenewalEndDate &&
                new Date(inv.RenewalEndDate) <= currentDate
              ) {
                shouldExpire = true;
              }

              /* ======================================================
                 EXPIRE PACKAGE
              ====================================================== */

              if (shouldExpire) {
                try {
                  if (typeof inv.toObject === "function") {
                    expiredInvestments.push({
                      ...inv.toObject(),
                      isExperied: true,
                      isActive: false,
                      isPending: false,
                    });
                  } else {
                    expiredInvestments.push({
                      ...inv,
                      isExperied: true,
                      isActive: false,
                      isPending: false,
                    });
                  }
                } catch (e) {
                  expiredInvestments.push({
                    ...inv,
                    isExperied: true,
                    isActive: false,
                    isPending: false,
                  });
                }
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
                investmetPackages: expiredInvestments,
              });
            }

            /* ======================================================
               KEEP ACTIVE PACKAGE
            ====================================================== */

            updatedPackages.push({
              ...pkg.toObject?.() ?? { ...pkg },
              investmetPackages: activeInvestments,
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
              industry: brand.industry,
              category: brand.category,
              packages: expiredPackages,
            });
          } else {
            expiredPackages.forEach((newPkg) => {
              const existingPkg = historyDoc.packages.find(
                (p) => p.planUniqueId === newPkg.planUniqueId,
              );

              if (existingPkg) {
                existingPkg.investmetPackages.push(...newPkg.investmetPackages);
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
            (pkg) => (pkg.investmetPackages ?? []).length > 0,
          );

          await brand.save();
        }

        console.log("✅ Brand Expiry Cron Job Completed");
      } catch (error) {
        console.error("❌ Cron Job Error:", error);
      } finally {
        jobRunning = false;
      }
    },
  );
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
      const { PlanuniqueId, _id } = item;

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

export const upgradeBrandPackages = async (
  req,
  res,
) => {
  try {
    const {
      brandOwnerId,

      // OLD PACKAGE
      Existing,

      // NEW PACKAGE
      Package,
    } = req.body;

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (
      !brandOwnerId ||
      !Existing ||
      !Package
    ) {
      return res.status(400).json({
        success: false,
        message:
          "brandOwnerId, Existing and Package are required",
      });
    }

    const {
      packagesType,
      investmetPackageId,
    } = Existing;

    if (
      !packagesType ||
      !investmetPackageId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Existing packagesType and investmetPackageId are required",
      });
    }

    /* =====================================================
       FIND BRAND
    ===================================================== */

    const brandPackage =
      await BrandPackages.findOne({
        brandOwnerId,
      });

    if (!brandPackage) {
      return res.status(404).json({
        success: false,
        message:
          "Brand package not found",
      });
    }

    /* =====================================================
       FIND EXISTING PACKAGE USING packageType
    ===================================================== */

    let oldRemainingLeads = 0;

    let existingPackageFound =
      false;

    for (const pkg of brandPackage.packages) {
      // check package type
      if (
        pkg.packagesType ===
        packagesType
      ) {
        // find investment package
        const existingInvestmentPackage =
          pkg.investmetPackages.id(
            investmetPackageId,
          );

        if (
          existingInvestmentPackage
        ) {
          existingPackageFound = true;

          /* =========================================
             STORE OLD REMAINING LEADS
          ========================================= */

          oldRemainingLeads =
            existingInvestmentPackage.remainingLeads ||
            0;

          /* =========================================
             EXPIRE OLD PACKAGE
          ========================================= */

          existingInvestmentPackage.remainingLeads = 0;

          existingInvestmentPackage.isActive = false;

          existingInvestmentPackage.isExperied = true;

          existingInvestmentPackage.isPending = false;

          existingInvestmentPackage.packageEndDate =
            new Date();

          existingInvestmentPackage.renewalEndDate =
            new Date();
        }
      }
    }

    if (!existingPackageFound) {
      return res.status(404).json({
        success: false,
        message:
          "Existing investment package not found",
      });
    }

    /* =====================================================
       CREATE NEW INVESTMENT PACKAGE
    ===================================================== */

    const currentDate =
      new Date();

    const newInvestmentPackages =
      Package.investmetPackages.map(
        (item) => {
          const validityDays =
            Number(
              item.validity || 0,
            );

          const endDate =
            new Date(
              currentDate,
            );

          endDate.setDate(
            endDate.getDate() +
              validityDays,
          );

          /* =========================================
             ADD OLD REMAINING LEADS
          ========================================= */

          const totalLeads =
            Number(
              item.totalLeads || 0,
            ) +
            oldRemainingLeads;

          return {
            packagesName:
              item.packagesName,

            planUniqueId:
              item.planUniqueId,

            investmetRageLabel:
              item.investmetRageLabel,

            investmentranges:
              item.investmentranges ||
              [],

            validity:
              item.validity,

            totalLeads:
              totalLeads,

            sendingLeads: 0,

            sendingPercentage: 0,

            remainingLeads:
              totalLeads,

            totalAmount:
              item.totalAmount || 0,

            packageStartDate:
              currentDate,

            packageEndDate:
              endDate,

            currentDate:
              currentDate,

            renewalEndDate:
              endDate,

            isPaused: false,

            pauseHistory: [],

            isExperied: false,

            isActive: false,

            isPending: true,
          };
        },
      );

    /* =====================================================
       CHECK SAME packageType EXISTS
    ===================================================== */

    const existingMainPackage =
      brandPackage.packages.find(
        (pkg) =>
          pkg.packagesType ===
          Package.packagesType,
      );

    if (existingMainPackage) {
      /* ===============================================
         SAME PACKAGE TYPE EXISTS
         PUSH NEW INVESTMENT PACKAGE
      =============================================== */

      existingMainPackage.investmetPackages.push(
        ...newInvestmentPackages,
      );
    } else {
      /* ===============================================
         NEW PACKAGE TYPE
      =============================================== */

      brandPackage.packages.push({
        packagesType:
          Package.packagesType,

        investmetPackages:
          newInvestmentPackages,
      });
    }

    /* =====================================================
       SAVE
    ===================================================== */

    await brandPackage.save();

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,
      message:
        "Package upgraded successfully",
      data: brandPackage,
    });
  } catch (error) {
    console.error(
      "upgradeBrandPackages Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
      error: error.message,
    });
  }
};
