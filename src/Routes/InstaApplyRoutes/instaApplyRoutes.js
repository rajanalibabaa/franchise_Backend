import express from "express";
import {
    createInstaApply,
    getInstaApply,
    getInstaApplyById,
    updateInstaApply,
    deleteInstaApply,
} from "../../controller/InstaApplyController/instaApplyController.js";
import { validateInstaApply } from "../../Validation/InstaApplyListing/InstaApplyListing.js";
const router = express.Router();

// Routes
router.post("/createInstaApply", validateInstaApply, createInstaApply);
router.get("/getInstaApply", getInstaApply);
router.get("/getInstaApply/:id", getInstaApplyById); // Updated path
router.put("/getInstaApply/:id", validateInstaApply, updateInstaApply); // Updated path
router.delete("/getInstaApply/:id", deleteInstaApply); // Updated path

export default router;