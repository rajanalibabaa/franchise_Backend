import { Router } from "express";
import { createComplaint} from "../../controller/ComplaintController/complaintController.js";
import { validateComplaint } from "../../Validation/ComplainListing/complainListing.js"; // Ensure the correct path

const router = Router();

router.post("/createComplaint", validateComplaint, createComplaint);


export default router;