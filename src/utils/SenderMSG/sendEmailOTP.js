import nodemailer from "nodemailer";

import { generateOTP } from "../generateOTP.js"; // Import the generateOTP function
const OTP = generateOTP(); // Generate a random OTP


export const sendEmailOTP = async (email, otp) => {

  console.log("email :", email,otp)

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,   // Your Gmail
      pass: process.env.EMAIL_PASS    // App password or your mail pass
    },
    tls: {
      rejectUnauthorized: false // <--- THIS FIXES THE SELF-SIGNED CERT ERROR
    }
     
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Email OTP",

    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`

};
try {
  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.response);
  return otp;  // Return OTP for further use if needed
} catch (error) {
  console.error('Error sending email:', error);
  throw new Error('Failed to send OTP email');
}
};




export default sendEmailOTP;


