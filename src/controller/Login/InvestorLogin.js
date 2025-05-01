<<<<<<< HEAD

import { ApiResponse } from "../../Middleware/ApiResponse.js";
import { ThirdPartyAuth } from "../../model/ThirdpartyAuthentication/thirdpartyAuthentication.model.js";


// import { ApiResponse } from "../../Middleware/ApiResponse.js";
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
=======
import { ApiResponse } from "../../utils/ApiResponse.js";
import { InvsRegister } from "../../model/Investor/invsRegister.js";
import { generateOTP } from "../../utils/generateOTP.js";
import sendEmailOTP from "../../utils/sendEmailOTP.js";
import sendMobileSMS from "../../utils/sendTwilio.js";

let generateNewOTP = null 
let emailORMobileNumber = null


const generateOTPforInvestor = async(req,res) => {
  try {
    const { email, mobileNumber, } = req.body;
    console.log(req.body);
  
     if (!email && !mobileNumber) {
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
  
      if (email && !/^\S+@\S+\.\S+$/.test(email)) {
          return res.status(400).json(
              new ApiResponse(400, null, "Invalid email format")
          );
      }
  
      if (mobileNumber && (!/^\d{10}$/.test(mobileNumber))) {
          return res.status(400).json(
              new ApiResponse(400, null, "Phone number must be 10 digits")
          );
      }
  
    emailORMobileNumber = email || mobileNumber
  
   const data = await InvsRegister.findOne({
      $or: [
        { email },
        { mobileNumber }
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
    // console.log(" data: ",data.email)
    // console.log(" data: ",data.mobileNumber)
  
    generateNewOTP = Number(generateOTP().toString().trim());
    console.log(generateNewOTP)
    // console.log("mobileNumber: ",mobileNumber)
    // console.log("email : ",email)
    if(email === data.email){
      sendEmailOTP(email, generateNewOTP)
    }else{
      sendMobileSMS(mobileNumber, generateNewOTP)
    }
  
    return res.json(
      new ApiResponse(
        200,
        {},
        "OTP sent successfully"
      )
    )
  } catch (error) {
    // console.error("Error generating OTP: ", error)
    return res.status(500).json(
      new ApiResponse(
        500,
        null,
        "Internal Server Error"
      )
    )
  }
}


const investorLogin = async (req, res) => {
  try {
    const { verifyOtp } = req.body;

    

    console.log ("verifyOtp: ",typeof verifyOtp, verifyOtp)

    if(generateNewOTP !== Number(verifyOtp) ){
      return res.json(
        new ApiResponse(
          400,
          null,
          "invalid OTP"
        )
      )
    }

    if(generateNewOTP === Number(verifyOtp)){

      const userData = await InvsRegister.findOne({
        $or: [
          { email: emailORMobileNumber },
          { mobileNumber: emailORMobileNumber }
        ]
      }).select(" -refreshToken  -createdAt -firstName");
  console.log("verifyOtp: ",userData)
  
      const AccessToken = await userData.generateAccessToken()
      // const RefreshToken = await userData.generateRefreshToken()
  
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
      };
  
      return res.status(200)
      .cookie("AccessToken",AccessToken,cookieOptions)
      // .cookie("RefreshToken",RefreshToken,cookieOptions)
      .json(
          new ApiResponse(
              200,
              {
                Data: userData,AccessToken
              },
              "User found"
          )
      );
    }

   
    // if (!email && !mobileNumber) {
    //   return res
    //     .status(400)
    //     .json(
    //       new ApiResponse(
    //         400,
    //         null,
    //         "Please provide either email or phone number"
    //       )
    //     );
    // }
>>>>>>> e34dc82f3035fc8900f28fa2d54d033d58b0e019

    // if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    //     return res.status(400).json(
    //         new ApiResponse(400, null, "Invalid email format")
    //     );
    // }

<<<<<<< HEAD
    // if (phone && (!/^\d{10}$/.test(phone))) {
=======
    // if (mobileNumber && (!/^\d{10}$/.test(mobileNumber))) {
>>>>>>> e34dc82f3035fc8900f28fa2d54d033d58b0e019
    //     return res.status(400).json(
    //         new ApiResponse(400, null, "Phone number must be 10 digits")
    //     );
    // }

<<<<<<< HEAD
    // const data = await ThirdPartyAuth.findOne({
    //     $or: [
    //         email ? { email: email } : {},
    //         phone ? { phone: phone } : {}
    //     ]
    // });

    // if (!data) {
    //     return res.status(404).json(
    //         new ApiResponse(
    //             404,
    //             null,
    //             "User not found"
    //         )
    //     );
    // }

    // return res.status(200).json(
    //     new ApiResponse(
    //         200,
    //         data,
    //         "User found"
    //     )
    // );
=======
    // const data = await InvsRegister.findOne({
    //     $or: [
    //       { email },
    //       { mobileNumber }
    //     ]
    // });

    // console.log('data : ', data)

  //   if (!data) {
  //       return res.status(404).json(
  //           new ApiResponse(
  //               404,
  //               null,
  //               "User not found"
  //           )
  //       );
  //   }

   
>>>>>>> e34dc82f3035fc8900f28fa2d54d033d58b0e019
  } catch (error) {
    console.error("Investor login error:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
};

<<<<<<< HEAD


export {
    investorLogin
}


=======
const getInvestorData = async (req,res) => {
  try {
    console.log("=====",req.cookies)
  } catch (error) {
    console.error(" Investor login error: ", error)
    return res.status(500).json(
      new ApiResponse(500, null, " Internal Server Error")
    )
  }
}

export {
    investorLogin,
    getInvestorData,
    generateOTPforInvestor,
}
>>>>>>> e34dc82f3035fc8900f28fa2d54d033d58b0e019
