import nodemailer from "nodemailer";
<<<<<<< HEAD

export const sendEmailOTP = async (email, otp) => {
=======
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

  console.log("email :", email)
>>>>>>> 3e7954f980a44a0ff8e0734c11b5fc05bd36c29d
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,   // Your Gmail
      pass: process.env.EMAIL_PASS    // App password or your mail pass
<<<<<<< HEAD
=======
>>>>>>> 984cedd3c91169da5c9b7da3a7fa5ba77a974b75
>>>>>>> 3e7954f980a44a0ff8e0734c11b5fc05bd36c29d
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Email OTP",
<<<<<<< HEAD
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`
=======
<<<<<<< HEAD
    text: `Your OTP is: ${OTP}. It will expire in 5 minutes.`
=======
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`
>>>>>>> 984cedd3c91169da5c9b7da3a7fa5ba77a974b75
>>>>>>> 3e7954f980a44a0ff8e0734c11b5fc05bd36c29d
  };

  await transporter.sendMail(mailOptions);
};
<<<<<<< HEAD
=======
<<<<<<< HEAD

export default sendEmailOTP;
=======
>>>>>>> 984cedd3c91169da5c9b7da3a7fa5ba77a974b75
>>>>>>> 3e7954f980a44a0ff8e0734c11b5fc05bd36c29d
