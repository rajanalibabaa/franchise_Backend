import { ApiResponse } from "../../Middleware/ApiResponse.js";
import { InvsRegister } from "../../model/Investor/invsRegister.js";
import jwt from 'jsonwebtoken';
// import { sendEmailOTP } from "../../utils/sendEmailOTP.js";

const investorLogin = async (req, res) => {
  try {
    const { email, phone } = req.body;
    console.log(req.body);

    if (!email && !phone) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Please provide either email or phone number"
          )
        );
    }
    // sendEmailOTP(email);

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json(
            new ApiResponse(400, null, "Invalid email format")
        );
    }

    if (phone && (!/^\d{10}$/.test(phone))) {
        return res.status(400).json(
            new ApiResponse(400, null, "Phone number must be 10 digits")
        );
    }

    const data = await InvsRegister.findOne({
        $or: [
          { email },
          { phone }
        ]
    });

    if (!data) {
        return res.status(404).json(
            new ApiResponse(
                404,
                null,
                "User not found"
            )
        );
    }

    const AccessToken = await data.generateAccessToken()
    const RefreshToken = await data.generateRefreshToken()

    const cookieOptions = {
      httpOnly: true,
      secure: true
  }

    return res.status(200)
    .cookie("AccessToken",AccessToken,cookieOptions)
    .cookie("RefreshToken",RefreshToken,cookieOptions)
    .json(
        new ApiResponse(
            200,
            {
              userData: data,AccessToken,RefreshToken
            },
            "User found"
        )
    );
  } catch (error) {
    console.error("Investor login error:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
};



export {
    investorLogin
}
