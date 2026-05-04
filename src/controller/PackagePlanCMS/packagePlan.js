import Plan from "../../model/PackagePlanCMS/PackagePlan.js";
import Packages from "../../model/PackagePlanCMS/PackagePlan.js";

const formatPackages = (packages = []) => {
  return packages.map(pkg => ({
    investmentRangeLabel: pkg.investmentRangeLabel || "",
    investmentRange: Array.isArray(pkg.investmentRange)
      ? pkg.investmentRange
      : [],

    validityDays: pkg.validityDays || 0,

    amount: Number(pkg.amount) || 0,

    // ✅ ALWAYS ARRAY
    totalLeads: Array.isArray(pkg.totalLeads)
      ? pkg.totalLeads.map(n => Number(n) || 0)
      : typeof pkg.totalLeads === "number"
      ? [pkg.totalLeads]
      : []
  }));
};

export const createPlan = async (req, res) => {
  try {
    const { planName, packageType, packages } = req.body;

    const formattedPackages = formatPackages(packages);

    let doc = await Packages.findOne();

    if (!doc) {
      doc = await Packages.create({
        packagesPlan: [
          {
            planName,
            packageType,
            packages: formattedPackages
          }
        ]
      });
    } else {
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
    const doc = await Packages.findOne();
console.log("docs",doc);

    if (!doc) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const formatted = doc.packagesPlan.map(plan => ({
      _id: plan._id,
      planName: plan.planName,
      packageType: plan.packageType,
      packages: plan.packages.map(pkg => ({
        ...pkg.toObject(),
        totalLeads: pkg.totalLeads || [] // ✅ ensure array
      }))
    }));

    res.status(200).json({
      success: true,
      data: formatted
    });

  } catch (error) {
    res.status(500).json({ success: false });
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

    const plan = doc.packagesPlan.find(
      p => p._id.toString() === planId
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    /* ================= FULL UPDATE ================= */
    if (packages && Array.isArray(packages)) {
      plan.packages = formatPackages(packages);
    }

    /* ================= DELETE PACKAGE ================= */
    if (deletePackage && packageIndex !== undefined) {
      plan.packages.splice(packageIndex, 1);
    }

    /* ================= UPDATE / ADD SINGLE PACKAGE ================= */
    if (packageIndex !== undefined && packageData) {
      const formattedPkg = formatPackages([packageData])[0];

      if (plan.packages[packageIndex]) {
        plan.packages[packageIndex] = {
          ...plan.packages[packageIndex].toObject(),
          ...formattedPkg
        };
      } else {
        plan.packages.push(formattedPkg);
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
      message: "Plan updated successfully",
      data: plan
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};


export const deletePlan = async (req, res) => {
  try {
    const { planId } = req.params;

    const doc = await Packages.findOne();
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Not found"
      });
    }

    const beforeLength = doc.packagesPlan.length;

    doc.packagesPlan = doc.packagesPlan.filter(
      plan => plan._id.toString() !== planId
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