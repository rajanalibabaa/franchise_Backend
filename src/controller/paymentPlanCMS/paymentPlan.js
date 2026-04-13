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

    // // packages validation
    // if (!Array.isArray(packages) || packages.length === 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "packages must be a non-empty array",
    //   });
    // }

    // // validate each package
    // for (let i = 0; i < packages.length; i++) {
    //   const pkg = packages[i];

    //   if (!validatePackage(pkg)) {
    //     return res.status(400).json({
    //       success: false,
    //       message: `Invalid package data at index ${i}`,
    //     });
    //   }
    // }

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



// @desc Update Plan / Update Package / Delete Plan / Delete Package
// @route PUT /api/plans/:id
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { planName, packageIndex, deletePlan, deletePackage, packageData } = req.body;

    // 1️⃣ Delete Full Plan
    if (deletePlan === true) {
      const deleted = await Plan.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Plan not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Plan deleted successfully"
      });
    }

    const plan = await Plan.findById(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    // 2️⃣ Update Plan Name
    if (planName) {
      plan.planName = planName;
    }

    // 3️⃣ Delete Single Package
    if (deletePackage === true && packageIndex !== undefined) {
      plan.packages.splice(packageIndex, 1);
    }

    // 4️⃣ Update OR ADD Package
    if (packageData) {

      // if package exists → update
      if (packageIndex !== undefined && plan.packages[packageIndex]) {

        const pkg = plan.packages[packageIndex];

        if (packageData.investmentRange !== undefined)
          pkg.investmentRange = packageData.investmentRange;

        if (packageData.validityDays !== undefined)
          pkg.validityDays = packageData.validityDays;

        if (packageData.amount !== undefined)
          pkg.amount = packageData.amount;

        if (packageData.totalLeads !== undefined)
          pkg.totalLeads = packageData.totalLeads;

      } else {
        // ➕ add new package
        plan.packages.push(packageData);
      }
    }

    await plan.save();

    res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      data: plan
    });

  } catch (error) {
    console.error("Update Plan Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};