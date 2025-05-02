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
        return res.status(500).json({ error: "Failed to send OTP", details: error.message });
    }
};

// Controller to verify OTP
export const verifyOTP = async (req, res) => {
    const { identifier, otp, token } = req.body;

    // Validate required fields
    if (!identifier || !otp || !token) {
        return res.status(400).json({ error: "Identifier, OTP, and token are required for verification" });
    }

    try {
        const decoded = verifyToken(token, JWT_SECRET);

        if (decoded.identifier === identifier && decoded.otp === otp) {
            return res.status(200).json({ message: "OTP verified successfully" });
        } else {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }
    } catch (error) {
        return res.status(400).json({ error: "Invalid or expired token" });
    }
};