import BrandListingPage from "../../model/Brand/brandListingPage.js";
import { generateOTP, getExpiryTime } from "../../utils/generateOtp.js";
import { sendEmailOTP } from "../../utils/sendEmailOTP.js";

export const requestEmailOtp = async (req, res) => {
    const { email } = req.body;
    console.log(email);
    

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    const otp=generateOTP();
    const expireAt=getExpiryTime();

    try {
        const updatedUser = await BrandListingPage.findOneAndUpdate(
            { email },
            {
              $set: {
                "otp.email.code": otp,
                "otp.email.expiresAt": expiresAt,
                "otp.email.verified": false
              }
            },
            { upsert: true, new: true }
          );
          await sendEmailOTP(email, otp);
          res.status(200).json({message:"otp sent successfully"});
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}


// This function verifies the OTP sent to the user's email
export const verifyEmailOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }
    try {
        const user = await BrandListingPage.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.otp.email.code !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        if (user.otp.email.expiresAt < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }
        if (user.otp.email.verified) {
            return res.status(400).json({ message: "Email already verified" });
        }
        user.otp.email.verified = true;
        await user.save();
        res.status(200).json({ message: "Email verified successfully" });
        
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        
    }
}