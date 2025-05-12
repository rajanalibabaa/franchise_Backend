import express from "express";
import { brandAndPostReqController } from "../../controller/LeadMatching&DistributionController/brandAndPostReqController.js";

const router = express.Router();

router.post("/match-lead", brandAndPostReqController);

export default router; 