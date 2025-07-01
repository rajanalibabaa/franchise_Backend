import express from "express";
import { requestOtp, verifyOtp } from "../../controller/AdminController/adminAuthController.js";
import  verifyJWT from '../../Middleware/adminAuthMiddleware.js';


const router = express.Router();
router.post("/v1/adminAuth/verifyotp", verifyOtp,verifyJWT);
router.post("/v1/adminAuth/sendotp",requestOtp)

export default router;
 