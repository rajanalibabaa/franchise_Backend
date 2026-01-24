import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import { InvsRegister } from "../../model/Investor/invsRegister.js";
import { generateOTP } from "../../utils/generateOTP.js";
import { sendEmailOTP } from "../../utils/Centralized Email/centralizedEmail.js";
import sendMobileSMS from "../../utils/SenderMSG/sendTwilio.js";
import { generateToken } from "../../utils/generateToken.js";
import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { ThirdPartyAuth } from "../../model/ThirdpartyAuthentication/thirdpartyAuthentication.model.js";
import { RegisterSuperAdmin } from "../../model/Admin/superAdmin/registerSuperAdmin.js";

const generateOTPforLogin = async (req, res) => {
  try {
    const { email, mobileNumber, platform } = req.body;
    const logingAnyway = req.body.logingAnyway;

    if (!email && !mobileNumber) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Please provide either email or phone number",
          ),
        );
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

    const newOTP = generateOTP().toString().trim();
    // console.log("Generated OTP:", newOTP);

    // Store OTP with current timestamp
    const timestamp = Date.now() + 5 * 60 * 1000;

    let data = null;

    if (!data) {
      data = await InvsRegister.findOne({
        $or: [{ email }, { mobileNumber }],
      });

      if (data?.active === true && logingAnyway !== true) {
        return res.json(
          new ApiResponse(
            309,
            null,
            `You are already logged in on ${data?.loginPlatform}. Would you like to proceed anyway.`,
          ),
        );
      }

      if (data) {
        await InvsRegister.findOneAndUpdate(
          {
            $or: [{ email }, { mobileNumber }],
          },
          {
            $set: {
              newOtp: newOTP,
              otpExpired: timestamp,
            },
          },
          {
            new: true,
          },
        );
      }
    }

    if (!data) {
      data = await BrandDetails.findOne({
        $or: [
          ...(email ? [{ "brandDetails.email": email }] : []),
          ...(mobileNumber
            ? [{ "brandDetails.mobileNumber": mobileNumber }]
            : []),
        ],
      });
      // console.log("logingAnyway OTP:", logingAnyway === true);
      if (data?.active === true && logingAnyway !== true) {
        // console.log("Generated OTP:", 222222);
        return res.json(
          new ApiResponse(
            309,
            null,
            `You are already logged in on ${data?.loginPlatform}. Would you like to proceed anyway.`,
          ),
        );
      }

      if (data) {
        await BrandDetails.findOneAndUpdate(
          {
            $or: [
              ...(email ? [{ "brandDetails.email": email }] : []),
              ...(mobileNumber
                ? [{ "brandDetails.mobileNumber": mobileNumber }]
                : []),
            ],
          },
          {
            $set: {
              newOtp: newOTP,
              otpExpired: timestamp,
            },
          },
          {
            new: true,
          },
        );
      }
    }

    if (!data) {
      data = await ThirdPartyAuth.findOne({
        email,
        mobileNumber,
      });

      if (data?.active === true && logingAnyway !== true) {
        return res.json(
          new ApiResponse(
            309,
            null,
            `You are already logged in on ${data?.loginPlatform}. Would you like to proceed anyway.`,
          ),
        );
      }
      if (data) {
        await ThirdPartyAuth.findOneAndUpdate(
          {
            $or: [{ email }, { mobileNumber }],
          },
          {
            $set: {
              newOtp: newOTP,
              otpExpired: timestamp,
            },
          },
          {
            new: true,
          },
        );
      }
    }

    if (!data) {
      return res.json(
        new ApiResponse(404, null, "You are not a registered user"),
      );
    }

    if (email) {
      await sendEmailOTP(email, newOTP);
    } else {
      await sendMobileSMS(mobileNumber, newOTP);
    }

    return res.json(new ApiResponse(200, {}, "OTP sent successfully"));
  } catch (error) {
    console.error("Error in generateOTPforLogin:", error);
    return res.json(new ApiResponse(500, null, "Internal Server Error"));
  }
};

const verifyLogin = async (req, res) => {
  try {
    const { verifyOtp, email, platform, mobileNumber } = req.body;
    // console.log(req.body)

    if (!verifyOtp) {
      return res.json(new ApiResponse(400, null, "OTP required"));
    }

    let investorData = null;
    let brandUserData = null;
    let thirdPartyUsers = null;

    investorData = await InvsRegister.findOne({
      $or: [{ email }, { mobileNumber }],
    }).select("-createdAt -_id");
    const timestamp = Date.now();

    if (timestamp > new Date(investorData?.otpExpired).getTime()) {
      return res.json(new ApiResponse(400, {}, "OTP Expired"));
    }

    if (!investorData) {
      brandUserData = await BrandDetails.findOne({
        $or: [
          ...(email ? [{ "brandDetails.email": email }] : []),
          ...(mobileNumber
            ? [{ "brandDetails.mobileNumber": mobileNumber }]
            : []),
        ],
      }).select("-createdAt -_id");
      if (Date.now() > new Date(brandUserData?.otpExpired).getTime()) {
        return res.json(new ApiResponse(400, {}, "OTP Expired"));
      }
    }

    if (!brandUserData) {
      thirdPartyUsers = await ThirdPartyAuth.findOne({
        email,
        mobileNumber,
      }).select("-createdAt -_id");
      if (Date.now() > new Date(thirdPartyUsers?.otpExpired).getTime()) {
        return res.json(new ApiResponse(400, {}, "OTP Expired"));
      }
    }
    // Check if OTP exists
    if (
      !brandUserData?.newOtp &&
      !investorData?.newOtp &&
      thirdPartyUsers?.newOtp
    ) {
      return res.json(
        new ApiResponse(400, null, "No OTP generated or OTP expired"),
      );
    }

    let userData = investorData || brandUserData || thirdPartyUsers;

    if (Number(userData?.newOtp) !== Number(verifyOtp)) {
      return res.json(
        new ApiResponse(
          400,
          null,
          "Invalid OTP. Please check the code and try again.",
        ),
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
      process.env.ACCESS_TOKEN_EXPIRY,
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };

    if (investorData) {
      userData = await InvsRegister.findOneAndUpdate(
        {
          $or: [{ email }, { mobileNumber }],
        },
        {
          $set: {
            active: true,
            lastActive: timestamp,
            loginPlatform: platform,
            otpExpired: null,
            newOtp: null,
            userNewVerifyToken: AccessToken,
          },
        },
        {
          new: true,
        },
      );
    }

    if (brandUserData) {
      userData = await BrandDetails.findOneAndUpdate(
        {
          $or: [
            ...(email ? [{ "brandDetails.email": email }] : []),
            ...(mobileNumber
              ? [{ "brandDetails.mobileNumber": mobileNumber }]
              : []),
          ],
        },
        {
          $set: {
            active: true,
            lastActive: timestamp,
            loginPlatform: platform,
            otpExpired: null,
            newOtp: null,
            userNewVerifyToken: AccessToken,
          },
        },
        {
          new: true,
        },
      );
    }

    if (thirdPartyUsers) {
      userData = await ThirdPartyAuth.findOneAndUpdate(
        {
          $or: [{ email }, { mobileNumber }],
        },
        {
          $set: {
            active: true,
            lastActive: timestamp,
            loginPlatform: platform,
            otpExpired: null,
            newOtp: null,
            userNewVerifyToken: AccessToken,
          },
        },
        {
          new: true,
        },
      );
    }

    // console.log("updated :", userData);

    return res.cookie("AccessToken", AccessToken, cookieOptions).json(
      new ApiResponse(
        200,
        {
          ...payload,
          AccessToken,
          userData,
        },
        "User verified and logged in",
      ),
    );
  } catch (error) {
    console.error("Investor login error:", error);
    return res.json(new ApiResponse(500, null, "Internal Server Error"));
  }
};

export const generateOTPforAdminLogin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json(new ApiResponse(404, {}, "Please Enter The Email"));
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.json(new ApiResponse(400, null, "Invalid email format"));
    }

    const exist = await RegisterSuperAdmin.findOne({
      adminEmail: email,
    });
    // console.log("exist",exist.adminEmail);

    if (!exist) {
      res.json(new ApiResponse(400, {}, "Email Not Exist"));
    }

    const newOTP = generateOTP();
    // console.log("otp", newOTP);
    const timestamp = Date.now() + 5 * 60 * 1000;

    // console.log(Date.now());
    // console.log("time :",timestamp);

    const data = await RegisterSuperAdmin.findOneAndUpdate(
      { adminEmail: exist.adminEmail },
      {
        $set: {
          otp: newOTP,
          otpExpired: timestamp,
        },
      },
      { new: true },
    );

    if (!data) {
      return res.json(
        new ApiResponse(500, {}, "Failed to update OTP. Please try again"),
      );
    }

    await sendEmailOTP(email, newOTP);
    return res.json(new ApiResponse(200, {}, "OTP sent successfully"));
  } catch (error) {
    console.error("Investor login error:", error);
    return res.json(new ApiResponse(500, null, "Internal Server Error"));
  }
};

export const verifyAdminLoginOTP = async (req, res) => {
  try {
    const { verifyOTP, email, platform } = req.body;

    if (!email) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "Please Generate OTP"));
    }

    const exists = await RegisterSuperAdmin.findOne({ adminEmail: email });

    if (!exists) {
      return res.status(404).json(new ApiResponse(404, {}, "Admin not found"));
    }

    if (Date.now() > new Date(exists.otpExpired).getTime()) {
      return res.json(new ApiResponse(400, {}, "OTP Expired"));
    }

    if (!verifyOTP) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "Please Enter the OTP"));
    }

    if (verifyOTP !== exists.otp) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            {},
            "Wrong OTP, please check and enter correct OTP",
          ),
        );
    }

    const adminAccessToken = generateToken(
      { adminUUID: exists.uuid },
      process.env.ADMIN_ACCESS_TOKEN_SECRET,
      process.env.ADMIN_ACCESS_TOKEN_EXPIRY,
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    };

    const adminData = await RegisterSuperAdmin.findOneAndUpdate(
      { adminEmail: email },
      {
        $set: {
          otp: null,
          otpExpired: null,
          userNewVerifyToken: adminAccessToken,
        },
      },
      { new: true },
    ).select(" -otp -otpExpired -_id ");

    res.cookie("adminAccessToken", adminAccessToken, cookieOptions);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { adminAccessToken, adminData },
          "Verification successful",
        ),
      );
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.json(new ApiResponse(500, {}, "Internal Server Error"));
  }
};

export { generateOTPforLogin, verifyLogin };
