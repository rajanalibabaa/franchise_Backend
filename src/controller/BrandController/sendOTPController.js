import sendEmailOTP from "../../utils/sendEmailOTP.js";
import sendMobileSMS from "../../utils/sendTwilio.js";
import sendWhatsAppOtp from "../../utils/sendTwilioWhatsapp.js";
import { generateOTP } from "../../utils/generateOTP.js";
import { generateToken, verifyToken } from "../../utils/generateToken.js";



// Controller to send OTP
export const sendOTP = async (req, res) => {

    const { type, identifier } = req?.body;


    console.log("Sending OTP to:",req.body);
    

    // Validate required fields
    if (!type || !identifier) {
        return res.status(400).json({ error: "Type and identifier are required" });
    }

    // Generate OTP and token
    const generatedOtp = generateOTP();

    console.log("Generated OTP: ", generatedOtp)
    const generatedToken = generateToken({ identifier, otp: generatedOtp }, process.env.JWT_SECRET , "5m"); // Token expires in 5 minutes

    try {
        if (type === "email") {
            await sendEmailOTP(identifier, generatedOtp);
        } else if (type === "mobile") {
            await sendMobileSMS(identifier, generatedOtp);
        } else if (type === "whatsapp") {
            await sendWhatsAppOtp(identifier, generatedOtp);
        } else {
            return res.status(400).json({ error: "Invalid type" });
        }

        return res.status(200).json({ message: "OTP sent successfully", token: generatedToken });
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