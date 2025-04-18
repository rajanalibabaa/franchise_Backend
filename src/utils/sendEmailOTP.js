import nodemailer from "nodemailer";

import { generateOTP } from "./generateOTP.js";
const OTP = generateOTP(); // Generate a random OTP

export const sendEmailOTP = async (email, otp) => {

  console.log("email :", email)

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,   // Your Gmail
      pass: process.env.EMAIL_PASS    // App password or your mail pass

    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Email OTP",

    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`


};
}

export default sendEmailOTP;
