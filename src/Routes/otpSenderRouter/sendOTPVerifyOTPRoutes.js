

import  express  from "express";
import { existingEmailOTP, generateNewEmailOTP, verifyExistingEmailOTP, verifynewEmailOTP } from "../../controller/otpController/sendOTPandVerifyOTPController.js";

export const sendOTPVerifyOTPRoutes = express.Router();

sendOTPVerifyOTPRoutes.post('/generateNewEmailOTP',generateNewEmailOTP)
sendOTPVerifyOTPRoutes.post('/verifynewEmailOTP',verifynewEmailOTP)
sendOTPVerifyOTPRoutes.post('/existingEmailOTP',existingEmailOTP)
sendOTPVerifyOTPRoutes.post('/verifyExistingEmailOTP',verifyExistingEmailOTP)