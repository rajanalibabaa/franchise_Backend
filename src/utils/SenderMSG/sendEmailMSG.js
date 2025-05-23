import nodemailer from 'nodemailer';
// import newIncomerInvestorController from '../../controller/newIncomerInvestorController/newIncomerInvestorController.js';
export const sendEmailMsg = async (userEmail, category, location, investment, brands, matchType) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const subject = matchType === 'perfect' 
        ? 'New Incomer Investor Inquiry - Perfect Match':'New Investor Matches In Investment and Location';

    for (const brand of brands) {
        const mailOptions = {
            from: userEmail,
            to: brand.BrandDetails.email,
            subject: subject,
            text: `Hello,\n\nYou have a new inquiry from an investor.\n\nEmail: ${userEmail}\n\nCategory: ${category}\nLocation: ${location}\nInvestment: ${investment}\n\nBest regards,\nYour Company`,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Email sent to: ${brand.BrandDetails.email}`);
        } catch (error) {
            console.error(`Error sending email to : ${brand.BrandDetails.email}`, error);
        }
    }
};