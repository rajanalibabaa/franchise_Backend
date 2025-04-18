import nodemailer from "nodemailer";
<<<<<<< HEAD
import { generateOTP } from "./generateOTP.js";
const OTP = generateOTP(); // Generate a random OTP

 const sendEmailOTP = async (email = "ayan9366016@gmail.com", OTP) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,// Your Gmail
      pass: process.env.EMAIL_PASS    // App password or your mail pass   
=======

export const sendEmailOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,   // Your Gmail
      pass: process.env.EMAIL_PASS    // App password or your mail pass
>>>>>>> 984cedd3c91169da5c9b7da3a7fa5ba77a974b75
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Email OTP",
<<<<<<< HEAD
    text: `Your OTP is: ${OTP}. It will expire in 5 minutes.`
=======
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`
>>>>>>> 984cedd3c91169da5c9b7da3a7fa5ba77a974b75
  };

  await transporter.sendMail(mailOptions);
};
<<<<<<< HEAD

export default sendEmailOTP;
=======
>>>>>>> 984cedd3c91169da5c9b7da3a7fa5ba77a974b75
