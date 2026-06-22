import { BrandPackages } from "../../model/BrandPackagePlans/brandPackagePlans.js";
import { BrandPackagesHistory } from "../../model/BrandPackagePlans/brandPackagePlanhistory.js";
import { BrandExpansionLocationData  } from "../../model/Brand/Brand.model/ExpansionLocation.model.js";
import { BrandUploads } from "../../model/Brand/Brand.model/Uploads.model.js";
import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { BrandFranchiseDetails } from "../../model/Brand/Brand.model/FranchiseDetails.model.js";

import PackagePlanCMS    from "../../model/CMS/PackagePlan.js";
import cron from "node-cron";
import mongoose from "mongoose";

let brandExpiryJobRunning = false;

const buildStateDistrictMap = (
  expansionLocationData,
) => {
  const locations = [
    ...(expansionLocationData?.expansionLocations?.domestic?.locations || []),
    ...(expansionLocationData?.currentOutletLocations?.domestic?.locations || []),
  ];

  const map = new Map();

  locations.forEach((loc) => {
    const state = String(loc?.state || "").trim();
    if (!state) return;

    if (map.has(state.toLowerCase())) return;

    const districts = (loc?.districts || [])
      .map((d) => d?.district)
      .filter(Boolean);

    map.set(state.toLowerCase(), districts);
  });

  return map;
};

const normalizeStateAndDistrict = (
  stateSource,
  stateDistrictMap = new Map(),
) => {
  const getStateDistricts = (state) => {
    if (!state) return [];
    return (
      stateDistrictMap.get(String(state).trim().toLowerCase()) || []
    );
  };

  const normalizeItem = (item) => {
    const state =
      typeof item === "string"
        ? item
        : item?.state || item?.name || "";

    if (!state) {
      return {
        state: "",
        district: [],
      };
    }

    const explicitDistricts =
      Array.isArray(item?.district)
        ? item.district
        : Array.isArray(item?.districts)
        ? item.districts
        : [];

    return {
      state,
      district:
        explicitDistricts.length > 0
          ? explicitDistricts
          : getStateDistricts(state),
    };
  };

  if (!stateSource) return [];

  if (Array.isArray(stateSource)) {
    return stateSource.map(normalizeItem);
  }

  return [normalizeItem(stateSource)];
};

const normalizeInvestmentRanges = (
  ranges,
  stateDistrictMap = new Map(),
) => {
  const normalizedRanges = Array.isArray(ranges) ? ranges : [];

  return normalizedRanges.map((range) => {
    const primaryStateAndDistrict = normalizeStateAndDistrict(
      range?.selectedPlanStateAndDistrict,
      stateDistrictMap,
    );
    const secondaryStateAndDistrict =
      primaryStateAndDistrict.length > 0
        ? primaryStateAndDistrict
        : normalizeStateAndDistrict(
            range?.selectedPlanState,
            stateDistrictMap,
          );
    const finalStateAndDistrict =
      secondaryStateAndDistrict.length > 0
        ? secondaryStateAndDistrict
        : normalizeStateAndDistrict(
            range?.states,
            stateDistrictMap,
          );

    return {
      selectedPlanInvestmetrange:
        range?.selectedPlanInvestmetrange ||
        range?.investmentRangeLabel ||
        range?.range ||
        "",
      selectedPlanStateAndDistrict: finalStateAndDistrict,
    };
  });
};

export const createInitialPackages = async ({
  brandOwnerId,
  Industry,
  Category,
  brandName,
  packages,
}) => {
  try {
    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!brandOwnerId) {
      return {
        success: false,
        statusCode: 400,
        message: "brandOwnerId is required",
      };
    }

    if (!packages || !Array.isArray(packages) || packages.length === 0) {
      return {
        success: false,
        statusCode: 400,
        message: "packages array is required",
      };
    }

    /* =====================================================
       ONLY SINGLE FREE PACKAGE ALLOWED
    ===================================================== */

    if (packages.length > 1) {
      return {
        success: false,
        statusCode: 400,
        message: "Initially only one FREE package can be created",
      };
    }

    const packageData = packages[0];

    if (packageData.packagesType?.toUpperCase() !== "FREE") {
      return {
        success: false,
        statusCode: 400,
        message: "Initially only FREE package is allowed",
      };
    }

    /* =====================================================
       CHECK EXISTING BRAND PACKAGE
    ===================================================== */

    const existingBrand = await BrandPackages.findOne({
      brandOwnerId,
    });

    if (existingBrand) {
      return {
        success: false,
        statusCode: 400,
        message: "Initial package already created",
      };
    }

    const expansionLocDoc =
      await BrandExpansionLocationData.findOne({
        brandOwnerId,
      }).lean();

    const expansionStateDistrictMap =
      buildStateDistrictMap(
        expansionLocDoc?.expansionLocationData,
      );

    /* =====================================================
       PROCESS INVESTMENT PACKAGES
    ===================================================== */

    const processedInvestments = (
      packageData.investmetPackages || []
    ).map((inv) => {
      const validityString = inv.validity || "0";

      /* =========================================
         EXTRACT DAYS FROM VALIDITY
         Example: "60 Days"
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
           STORE STATE + DISTRICT
        =========================================
        */

        investmentranges: normalizeInvestmentRanges(
          inv.investmentranges || inv.items || [],
          expansionStateDistrictMap,
        ),

        /* =========================================
           VALIDITY
        ========================================= */

        validity: validityString,

        /* =========================================
           LEADS
        ========================================= */

        totalLeads: Number(inv.totalLeads) || 0,

        sendingLeads: 0,

        sendingPercentage: 0,

        remainingLeads:
          Number(inv.remainingLeads) ||
          Number(inv.totalLeads) ||
          0,

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
    });

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
       SUCCESS RESPONSE
    ===================================================== */

    return {
      success: true,
      statusCode: 201,
      message: "Initial FREE package created successfully",
      data: newBrandPackage,
    };
  } catch (error) {
    console.error("createInitialPackages Error:", error);

    return {
      success: false,
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    };
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



export const getAllBrandPackages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      industry,
      category,
      packagesType,
    } = req.query;

const filter = {
  $and: [],
};

if (search) {
  filter.$and.push({
    $or: [
      {
        brandName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        category: {
          $regex: search,
          $options: "i",
        },
      },
      {
        industry: {
          $regex: search,
          $options: "i",
        },
      },
    ],
  });
}

if (industry) {
  filter.$and.push({
    industry,
  });
}

if (category) {
  filter.$and.push({
    category,
  });
}

if (packagesType) {
  const typesArray = packagesType
    .split(",")
    .map((item) =>
      item.trim().toUpperCase()
    );

  filter.$and.push({
    "packages.packagesType": {
      $in: typesArray,
    },
  });
}

if (filter.$and.length === 0) {
  delete filter.$and;
}

    const skip = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      BrandPackages.find(filter)
        .lean()
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      BrandPackages.countDocuments(filter),
    ]);

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No brand packages found",
      });
    }

    /* =====================================================
       STRIP FREE PACKAGES
    ===================================================== */

    const filteredData = data.map((brand) => ({
      ...brand,
      packages: brand.packages.filter((pkg) =>
        ["LEAD", "LISTING","FREE"].includes(pkg.packagesType)
      ),
    }));

    /* =====================================================
       FETCH LOGO + CATEGORY + INVESTMENT RANGE
       FOR EACH BRAND USING brandOwnerId
    ===================================================== */

    const brandOwnerIds = filteredData.map((b) => b.brandOwnerId);

    const [uploadsData, franchiseData] = await Promise.all([
      BrandUploads.find({ brandOwnerId: { $in: brandOwnerIds } }).lean(),
      BrandFranchiseDetails.find({ brandOwnerId: { $in: brandOwnerIds } }).lean(),
    ]);

    /* =====================================================
       MAP INTO LOOKUP OBJECTS FOR FAST ACCESS
    ===================================================== */

    const uploadsMap = {};
    uploadsData.forEach((u) => {
      uploadsMap[u.brandOwnerId] = u;
    });

    const franchiseMap = {};
    franchiseData.forEach((f) => {
      franchiseMap[f.brandOwnerId] = f;
    });

    /* =====================================================
       MERGE LOGO + FRANCHISE DATA INTO RESPONSE
    ===================================================== */

    const enrichedData = filteredData.map((brand) => {
      const uploads = uploadsMap[brand.brandOwnerId];
      const franchise = franchiseMap[brand.brandOwnerId];

      const logo = uploads?.uploads?.brandLogo?.[0] || null;

      // const brandCategories =
      //   franchise?.franchiseDetails?.brandCategories || null;

      // const investmentRange =
      //   franchise?.franchiseDetails?.fico?.[0]?.investmentRange || null;

      return {
        ...brand,
        logo,
        // brandCategories,
        // fico: { investmentRange },
      };
    });

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: enrichedData,
    });

  } catch (error) {
    console.error("getAllBrandPackages Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};



export const updateBrandPackagecms = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedPackage =
      await BrandPackages.findByIdAndUpdate(
        id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Package updated successfully",
      data: updatedPackage,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const createBrandPackages = async (req, res) => {
  try {
    const { brandOwnerId, packages } = req.body;

    console.log(
      "CREATE PACKAGE REQUEST:",
      JSON.stringify(req.body, null, 2)
    );

    // =====================================================
    // VALIDATION
    // =====================================================

    if (
      !brandOwnerId ||
      !Array.isArray(packages) ||
      packages.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "brandOwnerId and packages array are required",
      });
    }

    // =====================================================
    // FIND BRAND DOC
    // =====================================================

    const brandDoc =
      await BrandPackages.findOne({
        brandOwnerId,
      });

    if (!brandDoc) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    const expansionLocDoc =
      await BrandExpansionLocationData.findOne({
        brandOwnerId,
      }).lean();

    const expansionStateDistrictMap =
      buildStateDistrictMap(
        expansionLocDoc?.expansionLocationData,
      );

    // =====================================================
    // LOOP MAIN PACKAGES
    // =====================================================

    for (const incomingPkg of packages) {

      // =====================================================
      // PACKAGE TYPE
      // =====================================================

      const packagesType = String(
        incomingPkg.packagesType || ""
      ).toUpperCase();

      if (!packagesType) continue;

      // =====================================================
      // FIND CMS PLAN
      // =====================================================

      const cmsDoc =
        await PackagePlanCMS.findOne({
          "packagesPlan.planUniqueId":
            incomingPkg.planUniqueId,
        });

      if (!cmsDoc) {
        console.log(
          "CMS PLAN NOT FOUND"
        );
        continue;
      }

      const matchedPlan =
        cmsDoc.packagesPlan.find(
          (p) =>
            String(p.planUniqueId) ===
            String(
              incomingPkg.planUniqueId
            )
        );

      if (!matchedPlan) {
        console.log(
          "MATCHED PLAN NOT FOUND"
        );
        continue;
      }

      // =====================================================
      // FIND EXISTING PACKAGE TYPE
      // =====================================================

      let existingPackageType =
        brandDoc.packages.find(
          (pkg) =>
            String(
              pkg.packagesType
            ).toUpperCase() ===
            packagesType
        );

      // =====================================================
      // CREATE PACKAGE TYPE
      // =====================================================

      if (!existingPackageType) {
        brandDoc.packages.push({
          packagesType,
          investmetPackages: [],
        });

        existingPackageType =
          brandDoc.packages[
            brandDoc.packages.length - 1
          ];
      }

      // =====================================================
      // RAW PACKAGES
      // =====================================================

      const rawPackages =
        incomingPkg.investmetPackages ||
        incomingPkg.InvestmetPackages ||
        [];

      if (
        !Array.isArray(rawPackages) ||
        rawPackages.length === 0
      ) {
        console.log(
          "RAW PACKAGES EMPTY"
        );
        continue;
      }

      // =====================================================
      // LOOP RAW PACKAGES
      // =====================================================

      for (const pkg of rawPackages) {

        // =====================================================
        // VALIDITY + DATES
        // =====================================================

        const validity = Number(
          pkg.validity ||
          pkg.Validity ||
          0
        );

        const startDate = new Date();

        const endDate = new Date(
          startDate
        );

        endDate.setDate(
          startDate.getDate() +
            validity
        );

        // =====================================================
        // FINAL INVESTMENT RANGES
        // =====================================================

        let finalInvestmentRanges =
          [];

        // =====================================================
        // LISTING PACKAGE LOGIC
        // =====================================================

        if (
          packagesType === "LISTING"
        ) {

          const originalRanges =
            Array.isArray(
              pkg.investmentranges
            )
              ? pkg.investmentranges
              : Array.isArray(pkg.items)
              ? pkg.items
              : [];

          for (const range of originalRanges) {
            const labels = Array.isArray(
              range.selectedPlanInvestmetrange,
            )
              ? range.selectedPlanInvestmetrange
              : typeof range.selectedPlanInvestmetrange === "string"
              ? [range.selectedPlanInvestmetrange]
              : [];

            const stateSource =
              Array.isArray(range.selectedPlanStateAndDistrict)
                ? range.selectedPlanStateAndDistrict
                : Array.isArray(range.selectedPlanState)
                ? range.selectedPlanState
                : Array.isArray(range.states)
                ? range.states
                : [];

            const normalizedStates = normalizeStateAndDistrict(
              stateSource,
              expansionStateDistrictMap,
            );

            for (const label of labels) {
              finalInvestmentRanges.push({
                selectedPlanInvestmetrange:
                  label,
                selectedPlanStateAndDistrict:
                  normalizedStates,
              });
            }
          }
        }

        // =====================================================
        // LEAD / FREE PACKAGE LOGIC
        // =====================================================

        else {

          const originalRanges =
            Array.isArray(
              pkg.investmentranges
            )
              ? pkg.investmentranges
              : Array.isArray(pkg.items)
              ? pkg.items
              : [];

          finalInvestmentRanges =
            normalizeInvestmentRanges(
              originalRanges,
              expansionStateDistrictMap,
            );
        }

        console.log(
          "FINAL INVESTMENT RANGES:",
          JSON.stringify(
            finalInvestmentRanges,
            null,
            2
          )
        );

        // =====================================================
        // INVESTMENT RANGE LABEL
        // =====================================================

        let finalInvestmentLabel =
          "";

        if (
          packagesType === "LISTING"
        ) {

          finalInvestmentLabel =
            matchedPlan.packages
              .map(
                (p) =>
                  p.investmentRangeLabel
              )
              .filter(Boolean)
              .join(", ");
        } else {

          finalInvestmentLabel =
            pkg.investmetRageLabel ||
            pkg.InvestmetRageLabel ||
            "";
        }

        // =====================================================
        // CREATE PACKAGE
        // =====================================================

        const formattedPackage = {

          packagesName:
            incomingPkg.packagesName ||
            incomingPkg.packageName ||
            matchedPlan.planName ||
            "",

          planUniqueId:
            incomingPkg.planUniqueId ||
            matchedPlan.planUniqueId ||
            "",

          investmetRageLabel:
            finalInvestmentLabel,

          investmentranges:
            finalInvestmentRanges,

          validity:
            String(validity),

          totalLeads:
            Number(
              pkg.totalLeads ||
              pkg.TotalLeads ||
              0
            ),

          remainingLeads:
            Number(
              pkg.remainingLeads ||
              pkg.TotalLeads ||
              0
            ),

          sendingLeads: 0,

          sendingPercentage: 0,

          totalAmount:
            Number(
              pkg.totalAmount ||
              pkg.TotalAmount ||
              0
            ),

          packageStartDate:
            pkg.packageStartDate ||
            pkg.PackageStartDate ||
            startDate,

          packageEndDate:
            pkg.packageEndDate ||
            pkg.PackageEndDate ||
            endDate,

          currentDate:
            pkg.currentDate ||
            pkg.CurrentDate ||
            startDate,

          renewalEndDate:
            pkg.renewalEndDate ||
            pkg.RenewalEndDate ||
            endDate,

          isPaused:
            pkg.isPaused || false,

          pauseHistory:
            pkg.pauseHistory || [],

          isExperied:
            pkg.isExperied || false,

          isActive:
            pkg.isActive || false,

          isPending:
            pkg.isPending ?? true,

          paymentId:
            pkg.paymentId || "",

          orderId:
            pkg.orderId || "",
        };

        console.log(
          "FORMATTED PACKAGE:",
          JSON.stringify(
            formattedPackage,
            null,
            2
          )
        );

        // =====================================================
        // DUPLICATE CHECK
        // =====================================================

        const alreadyExists =
          existingPackageType.investmetPackages.some(
            (existingPkg) =>

              String(
                existingPkg.planUniqueId
              ) ===
                String(
                  formattedPackage.planUniqueId
                ) &&

              String(
                existingPkg.investmetRageLabel
              ) ===
                String(
                  formattedPackage.investmetRageLabel
                )
          );

        if (alreadyExists) {

          console.log(
            "PACKAGE ALREADY EXISTS"
          );

          continue;
        }

        // =====================================================
        // PUSH PACKAGE
        // =====================================================

        existingPackageType.investmetPackages.push(
          formattedPackage
        );
      }
    }

    // =====================================================
    // SAVE
    // =====================================================

    console.log(
      "FINAL BRAND DOC:",
      JSON.stringify(
        brandDoc,
        null,
        2
      )
    );

    await brandDoc.save();

    return res.status(200).json({
      success: true,
      message:
        "Packages created successfully",
      data: brandDoc,
    });

  } catch (error) {

    console.error(
      "createBrandPackages Error:",
      error
    );

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


export const startBrandExpiryJob = () => {
  
  // ⏱️ Every 5 minutes
  cron.schedule(
    "*/5 * * * *",
    async () => {
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

      if (brandExpiryJobRunning) {
        console.warn(
          "⚠️ Skipping Brand Expiry Cron Job because a previous run is still active.",
        );
        return;
      }

      brandExpiryJobRunning = true;
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
        brandExpiryJobRunning = false;
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