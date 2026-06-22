import LeadPlansCountManage from "../.././../model/CMS/LeadDistributionAdminAccess/leadPlanCountManage.js";

// Create (only one document allowed)

export const createLeadPlansCount = async (req, res) => {
  try {
    const existing = await LeadPlansCountManage.findOne();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Document already exists",
      });
    }

    const plan = await LeadPlansCountManage.create({
      leadPlan: req.body?.leadPlan ?? 0,
      listingPlan: req.body?.listingPlan ?? 0,
      free: req.body?.free ?? 0,
    });

    res.status(201).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single document
export const getLeadPlansCount = async (req, res) => {
  try {
    const plan = await LeadPlansCountManage.findOne();

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update single document
export const updateLeadPlansCount = async (req, res) => {
  try {
    const plan = await LeadPlansCountManage.findOne();
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "LeadPlansCount document not found",
      });
    }

    const updatedPlan = await LeadPlansCountManage.findByIdAndUpdate(
      plan._id,
      {
        $set: req.body,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: updatedPlan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};