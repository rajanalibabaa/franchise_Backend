import  express  from "express";
import { requestEmailOtp, requestMobileOtp, requestWhatsAppOtp, verifyOTP } from "../../controller/otpController/sendOTPController.js";

const sendOtpRouter = express.Router();

sendOtpRouter.post ("/v1/otpverify/send-otp-email", requestEmailOtp);
sendOtpRouter.post ("/v1/otpverify/send-otp-mobile", requestMobileOtp);
sendOtpRouter.post ("/v1/otpverify/send-otp-whatsapp", requestWhatsAppOtp);
sendOtpRouter.post ("/v1/otpverify/verify-otp", verifyOTP);

export default sendOtpRouter;