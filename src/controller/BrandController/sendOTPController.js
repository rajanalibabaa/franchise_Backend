import jwt from "jsonwebtoken";
import sendEmailOTP from "../../utils/sendEmailOTP.js";
import sendMobileSMS from "../../utils/sendTwilio.js";
import sendWhatsAppOtp from "../../utils/sendTwilioWhatsapp.js";
import { generateOTP } from "../../utils/generateOTP.js";


const otpStore = {}; 
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";   // Use a secure secret key

// Generate a JWT Token
const generateToken = (identifier, otp) => {
    return jwt.sign({ identifier, otp }, JWT_SECRET, { expiresIn: "5m" }); // Token expires in 5 minutes
};


// Verify a JWT Token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Send Email OTP
export const requestEmailOtp = async (req, res) => {
    const { email } = req.body;
    const otp = generateOTP();
    console.log("OTP:", otp); // Log the OTP for debugging purposes
    const token = generateToken(email, otp);

    try {
        await sendEmailOTP(email, otp);
        res.status(200).json({ message: "Email OTP sent successfully.", token });
    } catch (error) {
        res.status(500).json({ error: "Failed to send Email OTP." });
    }
};

// Verify Email OTP
export const verifyEmailOtp = (req, res) => {
    const { token, otp } = req.body;
    const decoded = verifyToken(token);

    if (decoded && decoded.otp === otp) {
        res.status(200).json({ message: "Email OTP verified successfully." });
    } else {
        res.status(400).json({ error: "Invalid or expired OTP." });
    }
};

// Send Mobile OTP
export const requestMobileOtp = async (req, res) => {
    const { mobile } = req.body;
    const otp = generateOTP();
    const token = generateToken(mobile, otp);

    try {
        await sendMobileSMS(mobile, otp);
        res.status(200).json({ message: "Mobile OTP sent successfully.", token });
    } catch (error) {
        res.status(500).json({ error: "Failed to send Mobile OTP." });
    }
};

// Verify Mobile OTP
export const verifyMobileOtp = (req, res) => {
    const { token, otp } = req.body;
    const decoded = verifyToken(token);

    if (decoded && decoded.otp === otp) {
        res.status(200).json({ message: "Mobile OTP verified successfully." });
    } else {
        res.status(400).json({ error: "Invalid or expired OTP." });
    }
};

// Send WhatsApp OTP
export const requestWhatsappOtp = async (req, res) => {
    const { whatsapp } = req.body;
    const otp = generateOTP();
    const token = generateToken(whatsapp, otp);

    try {
        await sendWhatsAppOtp(whatsapp, otp);
        res.status(200).json({ message: "WhatsApp OTP sent successfully.", token });
    } catch (error) {
        res.status(500).json({ error: "Failed to send WhatsApp OTP." });
    }
};

// Verify WhatsApp OTP
export const verifyWhatsappOtp = (req, res) => {
    const { token, otp } = req.body;
    const decoded = verifyToken(token);
    
    if (decoded && decoded.otp === otp) {
        res.status(200).json({ message: "WhatsApp OTP verified successfully." });
    } else {
        res.status(400).json({ error: "Invalid or expired OTP." });
    }
};