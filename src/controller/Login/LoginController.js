import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import { InvsRegister } from "../../model/Investor/invsRegister.js";
import { generateOTP } from "../../utils/generateOTP.js";
import sendEmailOTP from "../../utils/SenderMSG/sendEmailOTP.js";
import sendMobileSMS from "../../utils/SenderMSG/sendTwilio.js";
import { generateToken } from "../../utils/generateToken.js";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { ThirdPartyAuth } from "../../model/ThirdpartyAuthentication/thirdpartyAuthentication.model.js";

// Store OTP data with timestamp
let otpData = {
  code: null,
  timestamp: null,
  emailORMobileNumber: null
};

const OTP_EXPIRATION_MINUTES = 5; 

const generateOTPforLogin = async (req, res) => {
  try {
    const { email, mobileNumber } = req.body;
    console.log("Request body:", req.body);

    if (!email && !mobileNumber) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Please provide either email or phone number"));
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid email format"));
    }

    if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Phone number must be 10 digits"));
    }

    const emailORMobileNumber = email || mobileNumber;

    const investorData = await InvsRegister.findOne({
      $or: [{ email }, { mobileNumber }],
    });

    console.log("Investor data:", investorData);

    const brandUserData = await BrandListing.findOne({
      $or: [
        ...(email ? [{ "brandDetails.email": email }] : []),
        ...(mobileNumber ? [{ "brandDetails.mobileNumber": mobileNumber }] : []),
      ],
    });

    console.log("Brand user data:", brandUserData);

    const thirdPartyUsers = await ThirdPartyAuth.findOne({email:email, mobileNumber:mobileNumber});

    console.log("thirdPartyUsers data:", thirdPartyUsers);

    if (!investorData && !brandUserData && !thirdPartyUsers) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "You are not a registered user"));
    }

    const newOTP = Number(generateOTP().toString().trim());
    console.log("Generated OTP:", newOTP);

    // Store OTP with current timestamp
    otpData = {
      code: newOTP,
      timestamp: Date.now(),
      emailORMobileNumber: emailORMobileNumber
    };

    if (email) {
      await sendEmailOTP(email, newOTP);
    } else {
      await sendMobileSMS(mobileNumber, newOTP);
    }

    return res.json(new ApiResponse(200, {}, "OTP sent successfully"));
  } catch (error) {
    console.error("Error in generateOTPforLogin:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
};

const verifyLogin = async (req, res) => {
  try {
    const { verifyOtp } = req.body;

    if (!verifyOtp) {
      return res.status(400).json(
        new ApiResponse(400, null, "OTP required")
      );
    }

    console.log("verifyOtp:", typeof Number(verifyOtp), verifyOtp);
    console.log("otpData.code:", typeof otpData.code, otpData.code);

    // Check if OTP exists
    if (!otpData.code) {
      return res.status(400).json(
        new ApiResponse(400, null, "No OTP generated or OTP expired")
      );
    }

    // Check if OTP is expired (5 minutes)
    const currentTime = Date.now();
    const otpAgeMinutes = (currentTime - otpData.timestamp) / (1000 * 60);
    
    if (otpAgeMinutes > OTP_EXPIRATION_MINUTES) {
      return res.status(400).json(
        new ApiResponse(400, null, "OTP has expired. Please generate a new one.")
      );
    }

    if (otpData.code !== Number(verifyOtp)) {
      return res.status(400).json(
        new ApiResponse(400, null, "Invalid OTP")
      );
    }

    if (!otpData.emailORMobileNumber) {
      return res.status(400).json(
        new ApiResponse(400, null, "Missing user identifier")
      );
    }

    const investorData = await InvsRegister.findOne({
      $or: [
        { email: otpData.emailORMobileNumber },
        { mobileNumber: otpData.emailORMobileNumber }
      ]
    }).select("-createdAt -_id");

    const brandUserData = await BrandListing.findOne({
      $or: [
        { "brandDetails.email": otpData.emailORMobileNumber },
        { "brandDetails.mobileNumber": otpData.emailORMobileNumber }
      ]
    }).select("-createdAt -_id");

    const thirdPartyUsers = await ThirdPartyAuth.findOne({
      $or: [
        {email: otpData.emailORMobileNumber},
        {mobileNumber: otpData.emailORMobileNumber}
      ]
    }).select("-createdAt -_id");

    if (!investorData && !brandUserData && !thirdPartyUsers) {
      return res.status(404).json(
        new ApiResponse(404, null, "User not found")
      );
    }

    const userData = investorData || brandUserData || thirdPartyUsers;

    const payload = {
      investorUUID: investorData?.uuid || null,
      brandUserUUID: brandUserData?.uuid || null,
      thirdPartyUsersUUID: thirdPartyUsers?.uuid || null,
    };

    const AccessToken = generateToken(
      payload,
      process.env.ACCESS_TOKEN_SECRET,
      process.env.ACCESS_TOKEN_EXPIRY
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'Strict',
    };

    // Clear OTP after successful verification
    otpData = {
      code: null,
      timestamp: null,
      emailORMobileNumber: null
    };

    return res.status(200)
      .cookie("AccessToken", AccessToken, cookieOptions)
      .json(
        new ApiResponse(200, {
          ...payload,
          AccessToken,
          userData
        }, "User verified and logged in")
      );

  } catch (error) {
    console.error("Investor login error:", error);
    return res.status(500).json(
      new ApiResponse(500, null, "Internal Server Error")
    );
  }
};

export {
  generateOTPforLogin,
  verifyLogin,
};