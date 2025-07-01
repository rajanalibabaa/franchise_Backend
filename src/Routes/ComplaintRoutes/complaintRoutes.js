import { Router } from "express";
import { createComplaint} from "../../controller/ComplaintController/complaintController.js";
import { validateComplaint } from "../../Validation/ComplainListing/complainListing.js"; // Ensure the correct path
import { verifyJWT } from "../../Middleware/Authentication/authMiddleware.js";

const router = Router();

router.post("/v1/complaint/createComplaint/:id", verifyJWT, createComplaint);


export default router;