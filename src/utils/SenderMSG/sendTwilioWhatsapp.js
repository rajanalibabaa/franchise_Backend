import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendWhatsAppOtp = async (to, otp) => {
  try {
    const message = await client.messages.create({
      from: "whatsapp:+15557615643",
      to: `whatsapp:${to}`,
      contentSid: process.env.TWILIO_TEMPLATE_SID, // Optional, OR use messagingServiceSid
      contentVariables: JSON.stringify({
        1: otp, // Fills {{1}} in template
      }),
      //   messagingServiceSid: process.env.TWILIO_SERVICE_SID, // Optional if using contentSid
    });
    console.log("Message sent:", message.sid);
    return message.sid;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    throw error;
  }
};

export default sendWhatsAppOtp;
