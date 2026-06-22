import express from "express";
import { createLeadPlansCount,getLeadPlansCount,updateLeadPlansCount } from "../../../../controller/CMS/LeadDistributionAdminAccess/leadPlanCountManage.js";


  const leadPlanCountManage = express.Router();
 leadPlanCountManage.post("/v1/leadPlanCountManage/create",createLeadPlansCount)
  leadPlanCountManage.get("/v1/leadPlanCountManage/get",getLeadPlansCount) 
  leadPlanCountManage.put("/v1/leadPlanCountManage/update",updateLeadPlansCount)




  export default leadPlanCountManage;