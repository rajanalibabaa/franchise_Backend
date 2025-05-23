import  express  from "express";
import { requestEmailOtp, requestMobileOtp, requestWhatsAppOtp, verifyOTP } from "../../controller/otpController/sendOTPController.js";

const sendOtpRouter = express.Router();

sendOtpRouter.post ("/send-otp-email", requestEmailOtp);
sendOtpRouter.post ("/send-otp-mobile", requestMobileOtp);
sendOtpRouter.post ("/send-otp-whatsapp", requestWhatsAppOtp);
sendOtpRouter.post ("/verify-otp", verifyOTP);

export default sendOtpRouter;