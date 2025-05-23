import sendEmailOTP from "../../utils/SenderMSG/sendEmailOTP.js";
import sendMobileSMS from "../../utils/SenderMSG/sendTwilio.js";
import sendWhatsAppOtp from "../../utils/SenderMSG/sendTwilioWhatsapp.js";
import jwt from "jsonwebtoken";
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

export const requestMobileOtp = async (req, res) => {
    const { mobile } = req.body;

    if (!mobile) {
        return res.status(400).json({ error: "Mobile number is required" });
    }

 // Log the mobile number for debugging purposes
    const otp = generateOTP();
    const token = generateToken(mobile, otp);
    console.log("OTP:", otp); // Log the OTP for debugging purposes

    console.log("Token:", token); // Log the token for debugging purposes

    try {
        await sendMobileSMS(mobile, otp);
        res.status(200).json({ message: "Mobile OTP sent successfully.", token });
    } catch (error) {
        return res.status(500).json({ error: "Failed to send OTP", details: error.message });
    }
};

// Send WhatsApp OTP
export const requestWhatsAppOtp = async (req, res) => {
    const { mobile } = req.body;

    if (!mobile) {
        return res.status(400).json({ error: "Mobile number is required" });
    }

    const otp = generateOTP();
    const token = generateToken(mobile, otp);
    console.log("OTP:", otp); // Log the OTP for debugging purposes
    console.log("Token:", token); // Log the token for debugging purposes


    try {
        await sendWhatsAppOtp(mobile, otp); // Send OTP via WhatsApp
        res.status(200).json({ message: "WhatsApp OTP sent successfully.", token });
    } catch (error) {
        return res.status(500).json({ error: "Failed to send WhatsApp OTP", details: error.message });
    }
};

// Controller to verify OTP
export const verifyOTP = async (req, res) => {
    const { identifier, otp, type } = req.body;

    // Validate required fields
    if (!identifier || !otp || !type) {
        return res.status(400).json({ error: "Identifier, OTP, and type are required for verification" });
    }

   
    // Validate the type
    const validTypes = ["email", "mobile", "whatsapp"];
    if (!validTypes.includes(type)) {
        return res.status(400).json({ error: "Invalid type. Must be one of 'email', 'mobile', or 'whatsapp'" });
    }

    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(400).json({ error: "Authorization token is required" });
    }

    const token = authHeader.split(" ")[1]; // Extract the token
    console.log("Token:", token); // Log the token for debugging purposes
    

    try {
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        if (decoded.identifier === identifier && decoded.otp === otp) {
            return res.status(200).json({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} OTP verified successfully` });
        } else {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }
    } catch (error) {
        console.error("Error verifying token:", error);
        return res.status(400).json({ error: "Invalid or expired token" });
    }
};