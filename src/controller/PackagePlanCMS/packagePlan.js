import Plan from "../../model/PackagePlanCMS/PackagePlan.js";



export const createPlan = async (req, res) => {
  try {
    const { planName, packages } = req.body;

    if (!planName) {
      return res.status(400).json({
        success: false,
        message: "planName is required",
      });
    }

    const formattedPackages = packages?.map(pkg => ({
      investmentRangeLabel: pkg.investmentRangeLabel || "",
      investmentRange: pkg.investmentRange || [],
      validityDays: pkg.validityDays,
      amount: pkg.amount,
      totalLeads: pkg.totalLeads
    }));

    const newPlan = await Plan.create({
      planName: planName.trim(),
      packages: formattedPackages,
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



export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { planName, packageIndex, deletePlan, deletePackage, packageData } = req.body;

    // delete full plan
    if (deletePlan === true) {
      await Plan.findByIdAndDelete(id);

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

    // update plan name
    if (planName) {
      plan.planName = planName;
    }

    // delete single package
    if (deletePackage === true && packageIndex !== undefined) {
      plan.packages.splice(packageIndex, 1);
    }

    // add / update package
    if (packageData) {

      // update existing
      if (packageIndex !== undefined && plan.packages[packageIndex]) {

        const pkg = plan.packages[packageIndex];

        if (packageData.investmentRangeLabel !== undefined)
          pkg.investmentRangeLabel = packageData.investmentRangeLabel;

        if (packageData.investmentRange !== undefined)
          pkg.investmentRange = packageData.investmentRange;

        if (packageData.validityDays !== undefined)
          pkg.validityDays = packageData.validityDays;

        if (packageData.amount !== undefined)
          pkg.amount = packageData.amount;

        if (packageData.totalLeads !== undefined)
          pkg.totalLeads = packageData.totalLeads;

      } else {
        // add new package
        plan.packages.push({
          investmentRangeLabel: packageData.investmentRangeLabel || "",
          investmentRange: packageData.investmentRange || [],
          validityDays: packageData.validityDays,
          amount: packageData.amount,
          totalLeads: packageData.totalLeads
        });
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



export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    await Plan.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Plan deleted successfully"
    });

  } catch (error) {
    console.error("Delete Plan Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};