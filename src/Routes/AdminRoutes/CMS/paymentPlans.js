import express from "express";
import {
  createPlan,
  getAllPlans

} from "../../../controller/paymentPlanCMS/paymentPlan.js";

const paymentplanCMS = express.Router();

paymentplanCMS.post("/v1/admin/plans/create", createPlan);
paymentplanCMS.get("/v1/admin/plans/getAllPlans", getAllPlans);
// paymentplanCMS.get("/v1/admin/plans/:id", getPlanById);
// paymentplanCMS.put("/v1/admin/plans/:id", updatePlan);
// paymentplanCMS.delete("/v1/admin/plans/:id", deletePlan);

// // price calculation
// paymentplanCMS.post("/v1/admin/plans/price", getPlanPrice);

export default paymentplanCMS;