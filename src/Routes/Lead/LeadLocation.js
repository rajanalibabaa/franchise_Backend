// routes/admin/systemConfigRoutes.js
import express from "express";
import { updateSystemConfig,getSystemConfig } from "../../utils/All Leads/instantApplyLocationMatch";


const router = express.Router();

router.put("/system-config", updateSystemConfig); // Add auth middleware for admin if needed
router.get("/system-config", getSystemConfig);



export default router;
