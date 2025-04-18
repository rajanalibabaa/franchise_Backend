import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const fromWhatsAppNumber = 'whatsapp:+14155238886'; // Twilio Sandbox WhatsApp number

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Sends an OTP via WhatsApp using Twilio
 * @param {string} to - Recipient's WhatsApp number (e.g., whatsapp:+1234567890)
 * @param {string} otp - The OTP to send
 * @returns {Promise} - Resolves if the message is sent successfully
 */
const sendWhatsAppOtp = async (to, otp) => {
    try {
        const message = await client.messages.create({
            from: fromWhatsAppNumber,
            to: `whatsapp:${to}`, // Ensure the recipient's number is prefixed with 'whatsapp:'
            body: `Your OTP is: ${otp}. Please do not share it with anyone.`,
        });
        console.log('Message sent:', message.sid);
        return message.sid;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
};

export default sendWhatsAppOtp;