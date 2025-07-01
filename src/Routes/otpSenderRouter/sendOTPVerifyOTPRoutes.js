

import  express  from "express";
import { existingEmailOTP, generateNewEmailOTP, verifyExistingEmailOTP, verifynewEmailOTP } from "../../controller/otpController/sendOTPandVerifyOTPController.js";

export const sendOTPVerifyOTPRoutes = express.Router();

sendOTPVerifyOTPRoutes.post('/v1/otp/generateNewEmailOTP',generateNewEmailOTP)
sendOTPVerifyOTPRoutes.post('/v1/otp/verifynewEmailOTP',verifynewEmailOTP)
sendOTPVerifyOTPRoutes.post('/v1/otp/existingEmailOTP',existingEmailOTP)
sendOTPVerifyOTPRoutes.post('/v1/otp/verifyExistingEmailOTP',verifyExistingEmailOTP)