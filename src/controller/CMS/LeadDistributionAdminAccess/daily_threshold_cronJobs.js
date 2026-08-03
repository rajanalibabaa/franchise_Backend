import cron from "node-cron";
import { LeadThreshold } from "../../../model/CMS/LeadDistributionAdminAccess/lead_DailyThreshold_Model";

cron.schedule(
  "0 0 * * *",
  async () => {
    try {
      console.log("Resetting Daily Threshold...");

      await LeadThreshold.updateMany(
        {},
        {
          $set: {
            todaySentCount: 0,
            lastResetDate: new Date(),
          },
        }
      );

      console.log("Daily Threshold Reset Completed");
    } catch (error) {
      console.error(error);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);