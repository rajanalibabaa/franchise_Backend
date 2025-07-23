import express from "express";
import {
  verifyOTP,
  requestMobileOtp,
    requestWhatsAppOtp,
    requestEmailOtp, 
} from "../../controller/otpController/sendOTPController.js";

const sendOtpRouter = express.Router();
sendOtpRouter.post("/v1/send-otp-email", requestEmailOtp);
sendOtpRouter.post("/v1/send-otp-mobile", requestMobileOtp);
sendOtpRouter.post("/v1/send-whatsapp-otp", requestWhatsAppOtp);
sendOtpRouter.post("/v1/verify-otp", verifyOTP);

export default sendOtpRouter;
