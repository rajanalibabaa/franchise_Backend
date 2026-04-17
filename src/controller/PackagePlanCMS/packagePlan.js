import Plan from "../../model/PackagePlanCMS/PackagePlan.js";
import Packages from "../../model/PackagePlanCMS/PackagePlan.js";

/* ================= CREATE ================= */
export const createPlan = async (req, res) => {
  try {
    const { planName, packages } = req.body;

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
            packages: formattedPackages
          }
        ]
      });
    } else {
      // push new plan
      doc.packagesPlan.push({
        planName,
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


/* ================= GET ALL ================= */
export const getAllPlans = async (req, res) => {
  try {

    const doc = await Plan.findOne();

    if (!doc) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const formatted = doc.packagesPlan.map((plan, index) => ({
      _id: index, // frontend edit purpose
      planName: plan.planName,
      packages: plan.packages
    }));

    res.status(200).json({
      success: true,
      data: formatted
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { planName, packages, deletePackage, packageIndex } = req.body;

    const doc = await Packages.findOne();
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });

    // delete single package
    if (deletePackage) {
      doc.packagesPlan[id].packages.splice(packageIndex, 1);
    } 
    // update full plan
    else {
      doc.packagesPlan[id] = {
        planName,
        packages,
      };
    }

    await doc.save();

    res.json({
      success: true,
      message: "Plan updated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

/* ================= DELETE PLAN ================= */
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await Packages.findOne();
    if (!doc) return res.status(404).json({ success: false });

    doc.packagesPlan.splice(id, 1);

    await doc.save();

    res.json({
      success: true,
      message: "Plan deleted"
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};


/* ================= DELETE SINGLE PACKAGE ================= */
export const deletePackage = async (req, res) => {
  try {
    const { planIndex, packageIndex } = req.params;

    const doc = await Packages.findOne();
    if (!doc) return res.status(404).json({ success: false });

    doc.packagesPlan[planIndex].packages.splice(packageIndex, 1);

    await doc.save();

    res.json({
      success: true,
      message: "Package deleted"
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};