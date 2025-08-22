// import nodemailer from "nodemailer";

// import { generateOTP } from "../generateOTP.js"; // Import the generateOTP function
// const OTP = generateOTP(); // Generate a random OTP


// export const sendEmailOTP = async (email, otp) => {

//   console.log("email :", email,otp)

//   const transporter = nodemailer.createTransport({
//     host: "smtp.hostinger.com",
//     port: 465,
//     secure: true,
//     auth: {
//       user: process.env.EMAIL_USER_SUPPORT,   // Your Gmail
//       pass: process.env.EMAIL_PASS_SUPPORT    // App password or your mail pass
//     },
//     tls: {
//       rejectUnauthorized: false // <--- THIS FIXES THE SELF-SIGNED CERT ERROR
//     }
     
//   });

// console.log('SMTP Email:', process.env.EMAIL_USER_SUPPORT);
// console.log('SMTP Pass:', process.env.EMAIL_PASS_SUPPORT ? '✅ Loaded' : '❌ Missing');


// // const transporter = nodemailer.createTransport({
// //     service: "gmail",
// //     auth: {
// //       user: process.env.EMAIL_USER,   // Your Gmail
// //       pass: process.env.EMAIL_PASS    // App password or your mail pass
// //     },
// //     tls: {
// //       rejectUnauthorized: false // <--- THIS FIXES THE SELF-SIGNED CERT ERROR
// //     }
     
// //   });

//   const mailOptions = {
//     from: process.env.EMAIL_USER_SUPPORT,
//     to: email,
//     subject: "Your Email OTP",

//     text: `Your OTP is: ${otp}. It will expire in 5 minutes.`

// };

// //   const mailOptions = {
// //     from: process.env.EMAIL_USER,
// //     to: email,
// //     subject: "Your Email OTP",

// //     text: `Your OTP is: ${otp}. It will expire in 5 minutes.`

// // };


// try {
//   await transporter.sendMail(mailOptions);
//   // console.log('Email sent:', info.response);
//   return otp;  // Return OTP for further use if needed
// } catch (error) {
//   console.error('Error sending email:', error);
//   throw new Error('Failed to send OTP email');
// }
// };




// export default sendEmailOTP;


import nodemailer from "nodemailer";
import fs from "fs";
import handlebars from "handlebars";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";


// this mail for sending otp for verify the login
//o get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const transporter = nodemailer.createTransport({
        // host: 'smtp.gmail.com',
        host:'smtp.hostinger.com',
        // port: 587,
        port:465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER_SUPPORT,
            pass: process.env.EMAIL_PASS_SUPPORT,
        },
        tls: {
    rejectUnauthorized: false, // Allow self-signed certs
  },
        family: 4
    });

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

// Function to read HTML template and replace placeholders with dynamic dat;

const getTemplate = (templateName, data) => {
  try {
    const filepath = path.join(__dirname, "../Centralized Email/templates", `${templateName}.html`);
    
  
    if (!fs.existsSync(filepath)) {
      throw new Error(`Template file not found: ${filepath}`);
    }

    const source = fs.readFileSync(filepath, "utf-8");
    const template = handlebars.compile(source);
    return template(data);
  } catch (error) {
    console.error(`Error in getTemplate for template: ${templateName}`, error);
    throw new Error("Failed to load email template");
  }
};

 const sendEmailOTP = async (to, subject, templateName, data) => {
  console.log("Sending email to:", to);
  console.log("Subject:", subject);
  console.log("Template Name:", templateName);
  console.log("Data:", data);

  const html = getTemplate(templateName, data);

  const mailOptions = {
    from: process.env.EMAIL_USER_SUPPORT,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
     console.log("Email sent successfully");
  } catch (error) {
     console.log("Error while sending email",error);
  }
};

export default sendEmailOTP