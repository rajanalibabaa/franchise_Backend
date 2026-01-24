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
  host: "smtp.hostinger.com",
  // port: 587,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER_LOGIN,
    pass: process.env.EMAIL_PASS_LOGIN,
    // user: process.env.EMAIL_USER,
    // pass: process.env.EMAIL_PASS,
    // user:process.env.EMAIL_USER_SUPPORT,
    // pass:process.env.EMAIL_PASS_SUPPORT
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certs
  },
  family: 4,
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
    const filepath = path.join(__dirname, "templates", `${templateName}.html`);
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

export const sendEmail = async (to, subject, templateName, data) => {
  // console.log("Sending email to:", to);
  // console.log("Subject:", subject);
  // console.log("Template Name:", templateName);
  // console.log("Data:", data);

  const html = getTemplate(templateName, data);

  const mailOptions = {
    from: process.env.EMAIL_USER_LOGIN,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    //  console.log("Email sent successfully");
  } catch (error) {
    console.log("Error while sending email", error);
  }
};
