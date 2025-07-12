import nodemailer from 'nodemailer';
// import newIncomerInvestorController from '../../controller/newIncomerInvestorController/newIncomerInvestorController.js';
export const sendEmailMsg = async (userEmail, category, location, investment, brands, matchType) => {
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
        family: 4
    });

 // ✅ 2. Optional SMTP Connection Test
  await transporter.verify()
    .then(() => console.log('SMTP Server ready to send messages'))
    .catch((err) => console.error('SMTP Connection Error:', err));



    const subject = matchType === 'perfect' 
        ? 'New Incomer Investor Inquiry - Perfect Match':'New Investor Matches In Investment and Location';

    for (const brand of brands) {
        const mailOptions = {
            from: `"Mr Franchise" <${process.env.EMAIL_USER_SUPPORT}>`,
            to: brand.BrandDetails.email,
            subject: subject,
            text: `Hello,\n\nYou have a new inquiry from an investor.\n\nEmail: ${userEmail}\n\nCategory: ${category}\nLocation: ${location}\nInvestment: ${investment}\n\nBest regards,\nYour Company`,
        };

        try {
            await transporter.sendMail(mailOptions);
            // console.log(`Email sent to: ${brand.BrandDetails.email}`);
        } catch (error) {
            console.error(`Error sending email to : ${brand.BrandDetails.email}`, error);
        }
    }
};