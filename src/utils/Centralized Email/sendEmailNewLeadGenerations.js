import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { fileURLToPath } from "url";
import { transporter } from "./emailConfigNewLeadGeneration.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getTemplate = (templateName, data) => {
  try {
    // Template folder should be inside the same folder as this file
    const templatePath = path.join(
      __dirname,
      "templates",
      `${templateName}.html`
    );

    console.log("=================================");
    console.log("Template Name:", templateName);
    console.log("Template Path:", templatePath);
    console.log("Template Exists:", fs.existsSync(templatePath));
    console.log("=================================");

    if (!fs.existsSync(templatePath)) {
      throw new Error(
        `Template file not found: ${templatePath}`
      );
    }

    const source = fs.readFileSync(
      templatePath,
      "utf8"
    );

    const template = handlebars.compile(source);

    return template(data);
  } catch (error) {
    console.error(
      "Template Loading Error:",
      error.message
    );
    throw error;
  }
};

export const sendEmailNewLeadGeneration = async (
  recipientEmail,
  subject,
  templateName,
  data
) => {
  try {
    // Validate recipient
    if (
      !recipientEmail ||
      typeof recipientEmail !== "string" ||
      recipientEmail.trim() === ""
    ) {
      throw new Error(
        `Recipient email is missing. Received: ${recipientEmail}`
      );
    }

    // Generate HTML
    const html = getTemplate(
      templateName,
      data
    );

    const mailOptions = {
      from:
        process.env.EMAIL_FROM ||
        process.env.EMAIL_USER_SUPPORT ||
        process.env.EMAIL_USER_LOGIN,

      to: recipientEmail.trim(),

      subject,

      html,
    };

    console.log("=================================");
    console.log("Sending Email");
    console.log("To:", mailOptions.to);
    console.log("Subject:", mailOptions.subject);
    console.log("Template:", templateName);
    console.log("=================================");

    const info = await transporter.sendMail(
      mailOptions
    );

    console.log(
      "Email Sent Successfully:",
      info.messageId
    );

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(
      "Error while sending email:",
      error
    );

    return {
      success: false,
      message: error.message,
      error,
    };
  }
};