

import  express  from "express";
import { sendOTP } from "../../controller/otpController/sendOTPandVerifyOTPController.js";

export const sendOTPVerifyOTPRoutes = express.Router();

sendOTPVerifyOTPRoutes.post('/sendOTP',sendOTP)