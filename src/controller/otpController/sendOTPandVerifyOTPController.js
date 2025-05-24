import BrandListing from "../../model/Brand/brandListingPage.js";
import { InvsRegister } from "../../model/Investor/invsRegister.js";
import { generateOTP } from "../../utils/generateOTP.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import sendEmailOTP from "../../utils/SenderMSG/sendEmailOTP.js";

// In-memory OTP store: Map<email, { otp: string, expiresAt: Date }>
const otpStore = new Map();
console.log("otpStore : ",otpStore)

const generateNewEmailOTP = async (req, res) => {
    const { email, mobileNuber } = req.body; 
    console.log("===== :", req.body);

    
    const brandExist = await BrandListing.find({ "personalDetails.email": email });
    const investorExist = await InvsRegister.find({ email: email });

    if ((brandExist && brandExist.length > 0) || (investorExist && investorExist.length > 0)) {
        return res.json(new ApiResponse(400, false, "Email already exists"));
    }

   
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    console.log("expiresAt: ",expiresAt)

    // Store OTP in memory
    const timmer = otpStore.set(email, { otp, expiresAt });
     console.log("timmer: ",timmer)

    // Send the OTP via email
    const sendOtp = await sendEmailOTP(email, otp);
    if (!sendOtp) {
        return res.json(new ApiResponse(500, false, "Failed to send OTP"));
    }

    return res.json(new ApiResponse(200, {}, "OTP sent successfully"));
};

const verifynewEmailOTP = async (req, res) => {
    const { email, verifyOTP } = req.body;
    console.log("verifyOTP :", verifyOTP);

    const otpEntry = otpStore.get(email);

    if (!otpEntry) {
        return res.json(new ApiResponse(400, false, "please generate OTP first"));
    }

    const { otp, expiresAt } = otpEntry;

    if (new Date() > expiresAt) {
        otpStore.delete(email); // Clean up expired entry
        return res.json(new ApiResponse(400, false, "OTP expired"));
    }

    if (Number(verifyOTP) !== Number(otp)) {
        return res.json(new ApiResponse(400, false, "Invalid OTP"));
    }

    otpStore.delete(email); // OTP used — remove it
    return res.json(new ApiResponse(200, {}, "OTP verified successfully"));
};

const existingEmailOTP = async (req,res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.json(
            new ApiResponse(400,false,"Email is required")
        )
    }
    const brandExist = await BrandListing.find({ "personalDetails.email": email });
    const investorExist = await InvsRegister.find({ email: email });

    if (brandExist.length === 0 && investorExist.length === 0) {
        return res.json(new ApiResponse(400, false, "Email does not exist"));
    }

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 
    otpStore.set(email,{ otp, expiresAt})

    const sendOtp = await sendEmailOTP(email, otp)
    if (!sendOtp){
        return res.json(
            new ApiResponse(500,false,"Failed to send OTP")
        )
    }
     return res.json(new ApiResponse(200, {}, "OTP sent successfully"));

}

const verifyExistingEmailOTP = async (req,res) => {
    const { email , verifyOTP } = req.body;


    const otpEntry = otpStore.get(email)
    // console.log("otpEntry :",otpEntry)
    if (!otpEntry){
        return res.json(
            new ApiResponse(400,false,"please generate OTP first")
        )
    }
    const {otp , expiresAt } = otpEntry
    if(new Date > expiresAt ){
        otpStore.delete(email)
        return res.json(
            new ApiResponse(400,false,"OTP expired")
        )
    }
    if(Number(verifyOTP) !== Number(otp)){
        return res.json(
            new ApiResponse(400,false,"Invalid OTP")
        )
    }
    otpStore.delete(email)
    return res.json(
        new ApiResponse(200,{}, "OTP verified successfully")
    )
}

export {
    generateNewEmailOTP,
    verifynewEmailOTP,
    existingEmailOTP,
    verifyExistingEmailOTP
};
