import express from "express";
import { requestOtp, verifyOtp } from "../../controller/AdminController/adminAuthController.js";
import { verifyJWT } from "../Middleware/adminAuthMiddleware.js";


const router = express.Router();
router.post("/verifyotp", verifyOtp,verifyJWT);
router.post("/sendotp",requestOtp)

export default router;
 