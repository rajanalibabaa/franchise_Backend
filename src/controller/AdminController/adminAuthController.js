 // src/controller/AdminController/adminAuthController.js

import jwt from "jsonwebtoken";
import Admin from "../../model/Admin/adminModel.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { generateOTP } from "../../utils/generateOTP.js";
import sendEmailOTP from "../../utils/SenderMSG/sendEmailOTP.js";
import {
  requestOtpSchema,
  verifyOtpSchema
} from "../../Validation/AdminListing/adminAuthValidation.js";


const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; // Fallback secret

// Generate JWT token with identifier and OTP, expires in 5 minutes
const generateToken = (identifier, otp) => {
  return jwt.sign({ identifier, otp }, JWT_SECRET, { expiresIn: "5m" });
};

// Verify JWT token and return decoded data
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Request OTP (send email + save to DB)
export const requestOtp = async (req, res) => {
  try {
    // Validate request
    const { error } = requestOtpSchema.validate(req.body);
    if (error) {
      console.error("Validation error:", error.details[0].message);
      return res.status(400).json(new ApiResponse(400, {}, error.details[0].message));
    }

    const { email } = req.body;

    // Check if admin exists
    const admin = await Admin .findOne({ email });
    if (!admin) {
      console.warn(`Admin not found for email: ${email}`);
      return res.status(404).json(new ApiResponse(404, {}, "Admin not found"));
    }

    // Generate OTP and token
    const otp = generateOTP();
    const token = generateToken(email, otp);
    console.log(`Generated OTP: ${otp}, Token: ${token}`);

    // Send OTP via email and save to DB
    await sendEmailOTP(email, otp);
    admin.otp = otp;
    admin.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins from now
    await admin.save();

    console.info(`OTP sent successfully to email: ${email}`);
    return res.status(200).json(new ApiResponse(200, { token }, "Email OTP sent successfully"));
  } catch (error) {
    console.error("Error in requestOtp:", error.message || error);
    return res.status(500).json(new ApiResponse(500, {}, "Failed to send Email OTP"));
  }
};

// Verify OTP

export const verifyOtp = async (req, res) => {
  const { error } = verifyOtpSchema.validate(req.body);
  if (error) {
    return res.status(400).json(new ApiResponse(400, {}, error.details[0].message));
  }

  const { email, otp, token } = req.body;

  // Verify the token
  const decoded = verifyToken(token);
  if (!decoded || decoded.otp !== otp) {
    return res.status(400).json(new ApiResponse(400, {}, "Invalid or expired OTP."));
  }

  try {
    // Find the user by email
    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(404).json(new ApiResponse(404, {}, "User not found"));
    }

    // Validate OTP and expiration
    if (user.otp !== otp || user.otpExpiresAt < new Date()) {
      return res.status(400).json(new ApiResponse(400, {}, "Invalid or expired OTP"));
    }

    // Clear OTP and expiration
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, console.log("OTP verified successfully"),"OTP verified successfully"));
  } catch (error) {
    // console.error("OTP Verification Error:", error);
    return res.status(500).json(new ApiResponse(500, {}, "Something went wrong"));
  }
}; 