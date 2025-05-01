
import dotenv from 'dotenv'
import twilio from 'twilio';

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
<<<<<<< HEAD

const sendMobileSMS = async (to,otp) => {
=======
const to = 9366016459
const otp = 12345
const sendMobileSMS = async (to,otp) => {

    console.log(" Sending OTP to: ",to)
    console.log(" Sending OTP to: ",otp)
>>>>>>> e34dc82f3035fc8900f28fa2d54d033d58b0e019
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