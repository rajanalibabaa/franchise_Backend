import  express  from "express";
import { requestEmailOtp, verifyOTP } from "../../controller/otpController/sendOTPController.js";

const sendOtpRouter = express.Router();

sendOtpRouter.post ("/v1/otpverify/send-otp-email", requestEmailOtp);
sendOtpRouter.post ("/v1/otpverify/verify-otp", verifyOTP);

export default sendOtpRouter;