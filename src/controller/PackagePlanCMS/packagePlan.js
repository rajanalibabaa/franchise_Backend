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
    const { planIndex } = req.params;
    const { planName, packageIndex, packageData, deletePackage } = req.body;

    const doc = await Packages.findOne();
    if (!doc) return res.status(404).json({ success:false });

    const plan = doc.packagesPlan[planIndex];
    if (!plan) return res.status(404).json({ success:false });

    // delete
    if (deletePackage && packageIndex !== undefined) {
      plan.packages.splice(packageIndex, 1);
    }

    // update OR add
    else if (packageIndex !== undefined && packageData) {
      if (plan.packages[packageIndex]) {
        plan.packages[packageIndex] = {
          ...plan.packages[packageIndex]._doc,
          ...packageData
        };
      } else {
        plan.packages.push(packageData);
      }
    }

    // plan name update
    else if (planName) {
      plan.planName = planName;
    }

    await doc.save();

    res.json({ success:true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success:false });
  }
};
/* ================= DELETE PLAN ================= */
export const deletePlan = async (req, res) => {
  try {
    const { planIndex } = req.params;

    const doc = await Packages.findOne();
    if (!doc) return res.status(404).json({ success: false });

    doc.packagesPlan.splice(planIndex, 1);

    await doc.save();

    res.json({
      success: true,
      message: "Plan deleted"
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};





export const createListing = async (req, res) => {
  try {
    const { name, amount, validityDays } = req.body;

    let doc = await Packages.findOne();

    if (!doc) {
      doc = new Packages({
        packagesPlan: [],
        listingPackage: []
      });
    }

    doc.listingPackage.push({
      name,
      amount,
      validityDays
    });

    await doc.save();

    res.json({
      success: true,
      message: "Listing Package Created"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating listing"
    });
  }
};