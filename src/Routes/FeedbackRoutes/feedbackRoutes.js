import { Router } from "express";
import { createFeedback } from "../../controller/FeedbackController/feedbackController.js";
import { verifyJWT } from "../../Middleware/Authentication/authMiddleware.js";

const router = Router();

// router.post('/createFeedback/:id',verifyJWT,createFeedback);
router.post("/v1/feedback/createFeedback/:id", verifyJWT, createFeedback);

export default router;
