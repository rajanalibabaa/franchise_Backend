import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true, // true for 465
  auth: {
    user: process.env.EMAIL_USER_SUPPORT,
    pass: process.env.EMAIL_PASS_SUPPORT,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Error:", error);
  } else {
    console.log("SMTP Server Ready");
  }
});