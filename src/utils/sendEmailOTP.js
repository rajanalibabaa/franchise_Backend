import nodemailer from "nodemailer";
import { generateOTP } from "./generateOTP.js";
const OTP = generateOTP(); // Generate a random OTP

 const sendEmailOTP = async (email = "ayan9366016@gmail.com", OTP) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,// Your Gmail
      pass: process.env.EMAIL_PASS    // App password or your mail pass   
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Email OTP",
    text: `Your OTP is: ${OTP}. It will expire in 5 minutes.`
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmailOTP;