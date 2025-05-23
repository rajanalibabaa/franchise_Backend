import express from "express";
import {
  verifyOTP,
  requestMobileOtp,
    requestWhatsAppOtp,
    requestEmailOtp, 
} from "../../controller/otpController/sendOTPController.js";

const sendOtpRouter = express.Router();
sendOtpRouter.post("/send-otp-email", requestEmailOtp);
sendOtpRouter.post("/send-otp-mobile", requestMobileOtp);
sendOtpRouter.post("/send-whatsapp-otp", requestWhatsAppOtp);
sendOtpRouter.post("/verify-otp", verifyOTP);

export default sendOtpRouter;
