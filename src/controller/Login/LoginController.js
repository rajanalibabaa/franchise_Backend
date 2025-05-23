import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import { InvsRegister } from "../../model/Investor/invsRegister.js";
import { generateOTP } from "../../utils/generateOTP.js";
import sendEmailOTP from "../../utils/SenderMSG/sendEmailOTP.js";
import sendMobileSMS from "../../utils/SenderMSG/sendTwilio.js";
import { generateToken } from "../../utils/generateToken.js";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { ThirdPartyAuth } from "../../model/ThirdpartyAuthentication/thirdpartyAuthentication.model.js";

let generateNewOTP = null 
let emailORMobileNumber = null


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

    emailORMobileNumber = email || mobileNumber;

    const investorData = await InvsRegister.findOne({
      $or: [{ email }, { mobileNumber }],
    });

    console.log("Investor data:", investorData);

    // const brandUserData = await BrandListing.findOne({
    //   $or: [
    //     { "personalDetails.email": email },
    //     { "personalDetails.mobileNumber": mobileNumber }
    //   ]
    // });

    const brandUserData = await BrandListing.findOne({
      $or: [
        ...(email ? [{ "personalDetails.email": email }] : []),
        ...(mobileNumber ? [{ "personalDetails.mobileNumber": mobileNumber }] : []),
      ],
    });

    console.log("Brand user data:", brandUserData);

   const thirdPartyUsers = await ThirdPartyAuth.findOne({email:email, mobileNumber:mobileNumber});

    console.log("thirdPartyUsers data:", thirdPartyUsers);

    if (!investorData && !brandUserData && !thirdPartyUsers) {
      return res
        .status(404)
        .json(new ApiResponse(404, null,alert("You are not a registered user")));
    }

    generateNewOTP = Number(generateOTP().toString().trim());
    console.log("Generated OTP:", generateNewOTP);

    if (email) {
      await sendEmailOTP(email, generateNewOTP);
    } else {
      await sendMobileSMS(mobileNumber, generateNewOTP);
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


    console.log("emailORMobileNumber:" ,emailORMobileNumber)
    


    if (!verifyOtp) {
      return res.status(400).json(
        new ApiResponse(400, null, "OTP required")
      );
    }

    console.log("verifyOtp:", typeof Number(verifyOtp), verifyOtp);
    console.log("generateNewOTP:" ,typeof generateNewOTP, generateNewOTP)

   if (generateNewOTP !== Number(verifyOtp)) {
      return res.status(400).json(
        new ApiResponse(400, null, "Invalid OTP")
      );
    }

  if (!emailORMobileNumber) {
      return res.status(400).json(
        new ApiResponse(400, null, "Missing user identifier")
      );
    }

    const investorData = await InvsRegister.findOne({
      $or: [
        { email: emailORMobileNumber },
        { mobileNumber: emailORMobileNumber }
      ]
    }).select("-createdAt -_id");

    const brandUserData = await BrandListing.findOne({
      $or: [
        { "personalDetails.email": emailORMobileNumber },
        { "personalDetails.mobileNumber": emailORMobileNumber }
      ]
    }).select("-createdAt -_id");

    const thirdPartyUsers = await ThirdPartyAuth.findOne({
      $or: [
        {email:emailORMobileNumber},{mobileNumber:emailORMobileNumber}
      ]
    }).select("-createdAt -_id");;

    console.log("thirdPartyUsers data:", thirdPartyUsers)
    
    console.log("investorData:", investorData);
    console.log("brandUserData:", brandUserData);
    console.log("thirdPartyUsers:", thirdPartyUsers);

    if (!investorData && !brandUserData && !thirdPartyUsers) {
      return res.status(404).json(
        new ApiResponse(404, null, "User not found")
      );
    }

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

    return res.status(200)
      .cookie("AccessToken", AccessToken, cookieOptions)
      .json(
        new ApiResponse(200, {
          ...payload,
          AccessToken
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
}
