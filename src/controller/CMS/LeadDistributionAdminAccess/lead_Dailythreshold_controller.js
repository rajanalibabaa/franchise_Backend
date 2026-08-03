import { LeadThreshold } from "../../../model/CMS/LeadDistributionAdminAccess/lead_DailyThreshold_Model";;

/**
 * Create Threshold
 */
export const createLeadThreshold = async (req, res) => {
  try {
    const {
      brandId,
      packageId,
      totalLeads,
      durationDays,
      customThreshold,
    } = req.body;

    if (!brandId || !packageId) {
      return res.status(400).json({
        success: false,
        message: "brandId and packageId are required",
      });
    }

    const autoThreshold = Math.max(
      1,
      Math.ceil(totalLeads / durationDays)
    );

    const finalThreshold =
      customThreshold && customThreshold > 0
        ? customThreshold
        : autoThreshold;

    const threshold = await LeadThreshold.findOneAndUpdate(
      {
        brandId,
        packageId,
      },
      {
        brandId,
        packageId,
        totalLeads,
        durationDays,
        autoCalculatedThreshold: autoThreshold,
        customThreshold: customThreshold || null,
        finalThreshold,
        todaySentCount: 0,
        lastResetDate: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    );

    return res.status(201).json({
      success: true,
      data: threshold,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * CMS Update
 */

export const updateThreshold = async (req, res) => {
  try {
    const { id } = req.params;

    const { customThreshold } = req.body;

    const threshold = await LeadThreshold.findById(id);

    if (!threshold) {
      return res.status(404).json({
        success: false,
        message: "Threshold not found",
      });
    }

    threshold.customThreshold = customThreshold;

    threshold.finalThreshold =
      customThreshold && customThreshold > 0
        ? customThreshold
        : threshold.autoCalculatedThreshold;

    await threshold.save();

    return res.json({
      success: true,
      data: threshold,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Send Lead
 */

export const sendLead = async (brandId, packageId) => {
  try {
    const threshold = await LeadThreshold.findOne({
      brandId,
      packageId,
      status: "ACTIVE",
    });

    if (!threshold) {
      return {
        success: false,
        message: "Threshold not found",
      };
    }

    const now = new Date();

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const lastReset = new Date(threshold.lastResetDate);

    const lastResetDay = new Date(
      lastReset.getFullYear(),
      lastReset.getMonth(),
      lastReset.getDate()
    );

    // Automatic Daily Reset
    if (today.getTime() !== lastResetDay.getTime()) {
      threshold.todaySentCount = 0;
      threshold.lastResetDate = now;
    }

    if (threshold.todaySentCount >= threshold.finalThreshold) {
      return {
        success: false,
        message: "Today's lead limit reached",
        remaining: 0,
      };
    }

    threshold.todaySentCount += 1;

    await threshold.save();

    return {
      success: true,
      remaining:
        threshold.finalThreshold -
        threshold.todaySentCount,
      sentToday: threshold.todaySentCount,
      dailyLimit: threshold.finalThreshold,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: error.message,
    };
  }
};