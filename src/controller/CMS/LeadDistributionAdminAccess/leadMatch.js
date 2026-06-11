import LeadMatchingRule from "../../../model/CMS/LeadDistributionAdminAccess/leadMatch.js";

export const createLeadMatchCMS =
async (req, res) => {
  try {

    const { rules } = req.body;

    /* =========================
       VALIDATION
    ========================= */

    if (
      !Array.isArray(rules) ||
      rules.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "rules must be a non-empty array",
      });
    }

    /* =========================
       VALIDATE EACH RULE
    ========================= */

    for (const rule of rules) {

      const {
        matchName,
        matchType,
        matchFields,
        packagePlans,
      } = rule;

      /* =========================
         matchName
      ========================= */

  
      /* =========================
         matchType
      ========================= */

      if (!matchType) {
        return res.status(400).json({
          success: false,
          message:
            "matchType is required",
        });
      }

      /* =========================
         matchFields
      ========================= */

      if (
        !Array.isArray(matchFields) ||
        matchFields.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${matchType} : matchFields must be array`,
        });
      }

      /* =========================
         packagePlans
      ========================= */

      if (
        !Array.isArray(packagePlans) ||
        packagePlans.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${matchType} : packagePlans must be array`,
        });
      }

      /* =========================
         PARENT VALIDATION
      ========================= */

      // district requires state
      if (
        matchFields.includes("district") &&
        !matchFields.includes("state")
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${matchType} : district requires state`,
        });
      }

      // category requires industry
      if (
        matchFields.includes("category") &&
        !matchFields.includes("industry")
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${matchType} : category requires industry`,
        }); 
      }

      /* =========================
         PACKAGE VALIDATION
      ========================= */

      for (const plan of packagePlans) {

        if (!plan.packageType) {
          return res.status(400).json({
            success: false,
            message:
              `${matchType} : packageType required`,
          });
        }

      }
    }

    /* =========================
       SINGLE DOCUMENT CHECK
    ========================= */

    const existingConfig =
      await LeadMatchingRule.findOne();

    if (existingConfig) {
      return res.status(400).json({
        success: false,
        message:
          "Matching rules already exist",
      });
    }

    /* =========================
       CREATE
    ========================= */

    const newRules =
      await LeadMatchingRule.create({
        rules,
      });

    return res.status(201).json({
      success: true,
      message:
        "Matching rules created successfully",
      data: newRules,
    });

  } catch (error) {

    console.error(
      "createLeadMatchCMS error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
      error: error.message,
    });
  }
};

export const getLeadMatchCMS =
async (req, res) => {
  try {

    /* =========================
       GET MATCHING RULES
    ========================= */

    const matchingRules =
      await LeadMatchingRule.findOne();

    /* =========================
       NOT FOUND
    ========================= */

    if (!matchingRules) {
      return res.status(404).json({
        success: false,
        message:
          "Matching rules not found",
      });
    }

    /* =========================
       SUCCESS
    ========================= */

    return res.status(200).json({
      success: true,
      message:
        "Matching rules fetched successfully",
      data: matchingRules,
    });

  } catch (error) {

    console.error(
      "getLeadMatchCMS error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
      error: error.message,
    });
  }
};

export const updateLeadMatchCMS =
  async (req, res) => {
    try {
      const {
        packageType,
        selectedMatchTypes,
      } = req.body;

      console.log(
        "updateLeadMatchCMS req.body:",
        req.body,
      );

      /* =====================================
         VALIDATION
      ===================================== */

      if (!packageType) {
        return res.status(400).json({
          success: false,
          message:
            "packageType is required",
        });
      }

      if (
        !Array.isArray(
          selectedMatchTypes,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "selectedMatchTypes must be array",
        });
      }

      /* =====================================
         FIND DOCUMENT
      ===================================== */

      const leadMatch =
        await LeadMatchingRule.findOne();

      if (!leadMatch) {
        return res.status(404).json({
          success: false,
          message:
            "Lead match rules not found",
        });
      }

      /* =====================================
         LOOP RULES
      ===================================== */

      leadMatch.rules.forEach((rule) => {
        /* =====================================
           FIND CURRENT PACKAGE
        ===================================== */

        const packagePlan =
          rule.packagePlans.find(
            (pkg) =>
              pkg.packageType ===
              packageType,
          );

        if (!packagePlan) return;

        /* =====================================
           FIND SELECTED MATCH
        ===================================== */

        const selectedMatch =
          selectedMatchTypes.find(
            (item) =>
              item.matchType ===
              rule.matchType,
          );

        /* =====================================
           IF MATCH FOUND
        ===================================== */

        if (selectedMatch) {
          packagePlan.isActive = true;

        
        }

      
        else {
          packagePlan.isActive = false;
        
        }
      });

      /* =====================================
         SORT RULES BY PRIORITY
      ===================================== */

      leadMatch.rules.sort((a, b) => {
        const packageA =
          a.packagePlans.find(
            (pkg) =>
              pkg.packageType ===
              packageType,
          );

        const packageB =
          b.packagePlans.find(
            (pkg) =>
              pkg.packageType ===
              packageType,
          );

        const priorityA =
          packageA?.priority || 9999;

        const priorityB =
          packageB?.priority || 9999;

        return priorityA - priorityB;
      });

      /* =====================================
         SAVE
      ===================================== */

      await leadMatch.save();

      return res.status(200).json({
        success: true,
        message:
          "Lead match updated successfully",
        data: leadMatch,
      });
    } catch (error) {
      console.log(
        "updateLeadMatchCMS error:",
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