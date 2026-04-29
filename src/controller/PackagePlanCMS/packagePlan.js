import Plan from "../../model/PackagePlanCMS/PackagePlan.js";
import Packages from "../../model/PackagePlanCMS/PackagePlan.js";


export const createPlan = async (req, res) => {
  try {
    const { planName, packageType, packages } = req.body;
    console.log("Received data:", req.body);

    const formattedPackages = packages?.map(pkg => ({
      investmentRangeLabel: pkg.investmentRangeLabel || "",
      investmentRange: pkg.investmentRange || [],
      validityDays: pkg.validityDays,
      amount: pkg.amount,
      totalLeads: pkg.totalLeads
    }));

    // find single doc
    let doc = await Plan.findOne();

    if (!doc) {
      // create first time
      doc = await Plan.create({
        packagesPlan: [
          {
            planName,
            packageType,
            packages: formattedPackages
          }
        ]
      });
    } else {
      // push new plan
      doc.packagesPlan.push({
        planName,
        packageType,
        packages: formattedPackages
      });

      await doc.save();
    }

    res.status(201).json({
      success: true,
      message: "Plan added successfully",
      data: doc
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const getAllPlans = async (req, res) => {
  try {
    const doc = await Plan.findOne();

    if (!doc) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const formatted = doc.packagesPlan.map((plan) => ({
      _id: plan._id, // ✅ REAL ID
      planName: plan.planName,
      packageType: plan.packageType,
      packages: plan.packages
    }));

    res.status(200).json({
      success: true,
      data: formatted
    });

  } catch (error) {
    res.status(500).json({
      success: false
    });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { planId } = req.params;

    const {
      planName,
      packageType,
      packages,
      packageIndex,
      packageData,
      deletePackage
    } = req.body;

    const doc = await Packages.findOne();
    if (!doc) return res.status(404).json({ success: false });

    // ✅ find plan by _id
    const plan = doc.packagesPlan.find(
      (p) => p._id.toString() === planId
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    /* ================= FULL UPDATE ================= */
    if (packages && Array.isArray(packages)) {
      plan.packages = packages;
    }

    /* ================= DELETE PACKAGE ================= */
    if (deletePackage && packageIndex !== undefined) {
      plan.packages.splice(packageIndex, 1);
    }

    /* ================= UPDATE SINGLE PACKAGE ================= */
    if (packageIndex !== undefined && packageData) {
      if (plan.packages[packageIndex]) {
        plan.packages[packageIndex] = {
          ...plan.packages[packageIndex]._doc,
          ...packageData
        };
      } else {
        plan.packages.push(packageData);
      }
    }

    /* ================= UPDATE PLAN DETAILS ================= */
    if (planName !== undefined) {
      plan.planName = planName;
    }

    if (packageType !== undefined) {
      plan.packageType = packageType;
    }

    await doc.save();

    res.json({
      success: true,
      message: "Plan updated successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    console.log("Deleting plan with ID:", planId);

    const doc = await Packages.findOne();
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Not found"
      });
    }

    const beforeLength = doc.packagesPlan.length;

    // ✅ delete using ObjectId
    doc.packagesPlan = doc.packagesPlan.filter(
      (plan) => plan._id.toString() !== planId
    );

    if (doc.packagesPlan.length === beforeLength) {
      return res.status(400).json({
        success: false,
        message: "Plan not found"
      });
    }

    await doc.save();

    res.json({
      success: true,
      message: "Plan deleted successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false
    });
  }
};