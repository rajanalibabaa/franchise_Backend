import express from "express"


import {createLeadThreshold,sendLead,updateThreshold ,} from "../../../../controller/CMS/LeadDistributionAdminAccess/lead_Dailythreshold_controller"

const lead_Threshold_daily = express.Router();


lead_Threshold_daily.post("/create", createLeadThreshold);

lead_Threshold_daily.put("/update/:id", updateThreshold);

lead_Threshold_daily.get("/all", getAllThresholds);

lead_Threshold_daily.get("/:id", getThresholdById);

lead_Threshold_daily.delete("/:id", deleteThreshold);

export default lead_Threshold_daily;