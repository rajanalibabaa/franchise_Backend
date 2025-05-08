import express from "express";
import {
  verifyOTP,
  requestMobileOtp,
    requestWhatsAppOtp, 
} from "../../controller/BrandController/sendOTPController.js";

const router = express.Router();

router.post("/send-otp", requestMobileOtp);
router.post("/send-whatsapp-otp", requestWhatsAppOtp);
router.post("/verify-otp", verifyOTP);

export default router;
