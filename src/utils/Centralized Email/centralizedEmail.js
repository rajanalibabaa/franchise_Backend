import { sendEmail } from './emailService.js';

 export const sendBrandEmailPerfect= async (recipientEmail,brandCompanyName,investername,category,location,investment,emailSubject) => {
    try {
        // Dummy data for testing
        
        const subject = "You Have A Good News, New Investor Register"
        const emailTemplateName = "brandRegister_template"; // Ensure this matches the template file name in the 'templates' folder
        const emailData = {     
            subject:emailSubject,
            companyname:brandCompanyName,
            name:investername ,
            category: category,
            location: location,
            investment: investment

        };
    
        // Call the sendEmail function
        await sendEmail(recipientEmail, subject, emailTemplateName, emailData);
    } catch (error) {
        console.error("Failed to send test email:", error);
    }
};


export const sendInstantApplyEmail= async (email,name,mobilenumber,state,city,pincode,address) => {
    try {
        // Dummy data for testing
        
        const subject = "You Have A Good News, New Instant Applier Details Here..! "
        const emailTemplateName = "instantApply_template"; // Ensure this matches the template file name in the 'templates' folder
        const emailData = {     
         name:name,
         email:email,
         mobilenumber:mobilenumber,
         state:state,
         city:city,
         pincode:pincode,
         address:address
        };
    
        // Call the sendEmail function
        await sendEmail(email, subject, emailTemplateName, emailData);
    } catch (error) {
        console.error("Failed to send test email:", error);
    }
};

export const sendPostRequirementEmail =  async (email,name,address,country,pincode,city,state,mobileNumber,whatsappNumber,industryType,investmentRange,floorAreaRequirement,timelineToStart,needLoan) => {
    try {
         const subject = "You Have A Good News, New Post Requirement Details Here..! "
         const emailTemplateName = "instantApply_template"; // Ensure this matches the template file name in the 'templates' folder
         const emailData = {
            email : email,
            name : name,
            address : address,
            country :country,
            pincode : pincode ,
            city : city ,
            state : state ,
            mobileNumber : mobileNumber,
            whatsappNumber : whatsappNumber,
            industryType : industryType,
            investmentRange : investmentRange ,
            floorAreaRequirement: floorAreaRequirement,
            timelineToStart : timelineToStart,
            needLoan : needLoan
       };
        // Call the sendEmail function
        await sendEmail(email, subject, emailTemplateName, emailData);
        
    } catch (error) {
       console.error("Failed to send test email:", error); 
    }
}
// 
//  export const sendBrandEmailpartial= async (recipientEmail,name,category,location,investment) => {
    // try {
        // const emailSubject = "Welcome to Our Service";
        // const emailTemplateName = "brandRegister_partial"; // Ensure this matches the template file name in the 'templates' folder
        //  const emailData = {     
    //  name: name,
    //  category: category,
    //  location: location,
    //  investment: investment
//  };
// 
    // 
       
        // await sendEmail(recipientEmail, emailSubject, emailTemplateName, emailData);
    // } catch (error) {
        // console.error("Failed to send test email:", error);
    // }
// };
// 


