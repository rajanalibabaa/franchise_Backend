import express from "express";
import {
  createPlan,
  getAllPlans,
  updatePlan,
  deletePlan,
 


} from "../../../controller/PackagePlanCMS/packagePlan.js";

const paymentplanCMS = express.Router();

paymentplanCMS.post("/v1/admin/plans/create", createPlan);
paymentplanCMS.get("/v1/admin/plans/getAllPlans", getAllPlans);
paymentplanCMS.put("/v1/admin/plans/:planId", updatePlan);
paymentplanCMS.delete("/v1/admin/plans/:planId", deletePlan);
// paymentplanCMS.delete("/v1/admin/packages/:id", deletePackage);
// paymentplanCMS.post("/v1/admin/plans/createListing", createListing);



export default paymentplanCMS;