
import dotenv from 'dotenv'
import twilio from 'twilio';

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendMobileSMS = async (to,otp) => {

    console.log(" Sending OTP to: ",to)
    console.log(" Sending OTP to: ",otp)
    let msgOptions = {
        to: to, 
        from: process.env.TWILIO_PHONE_NUMBER, 
        body : `Your OTP is: ${otp}. Please do not share it with anyone.`,
    };

    try {
        const message = await client.messages.create(msgOptions);
        console.log('Message sent:', message);
        return message; // Return the message object
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw error;
    }
};

export default sendMobileSMS;