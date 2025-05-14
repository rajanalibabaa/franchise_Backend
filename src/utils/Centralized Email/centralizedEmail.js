import { sendEmail } from './emailService.js';

 const sendBrandEmail = async () => {
    try {
        // Dummy data for testing
        const recipientEmail = "pradeepbabaateam66@gmail.com"; // Replace with a valid email address
        const emailSubject = "Welcome to Our Service";
        const emailTemplateName = "index"; // Ensure this matches the template file name in the 'templates' folder
        const emailData = {
            name: "John Doe",
            subject: "Welcome Email",
            message: "Thank you for signing up for our service!"
        };

    
        // Call the sendEmail function
        await sendEmail(recipientEmail, emailSubject, emailTemplateName, emailData);
    } catch (error) {
        console.error("Failed to send test email:", error);
    }
};

// Call the function to send the test 

export default sendBrandEmail;