import Plan from "../../model/PaymentPlanCMS/paymentPlan.js";

// validate single package
const validatePackage = (pkg) => {
  if (!pkg.investmentRange || typeof pkg.investmentRange !== "string") return false;
  if (typeof pkg.validityDays !== "number" || pkg.validityDays <= 0) return false;
  if (typeof pkg.amount !== "number" || pkg.amount <= 0) return false;
  if (typeof pkg.totalLeads !== "number" || pkg.totalLeads <= 0) return false;
  return true;
};

// @desc Create Plan
// @route POST /api/plans
export const createPlan = async (req, res) => {
  try {
    const { planName, packages } = req.body;

    // planName validation
    if (!planName || typeof planName !== "string") {
      return res.status(400).json({
        success: false,
        message: "planName is required",
      });
    }

    // packages validation
    if (!Array.isArray(packages) || packages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "packages must be a non-empty array",
      });
    }

    // validate each package
    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];

      if (!validatePackage(pkg)) {
        return res.status(400).json({
          success: false,
          message: `Invalid package data at index ${i}`,
        });
      }
    }

    // create plan
    const newPlan = await Plan.create({
      planName: planName.trim(),
      packages,
    });

    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      data: newPlan,
    });

  } catch (error) {
    console.error("Create Plan Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};


export const getAllPlans = async (req, res) => {
  try {

    const plans = await Plan.find().sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });

  } catch (error) {
    console.error("Get Plans Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};
