import nodemailer from 'nodemailer';
import fs from 'fs';
import handlebars from 'handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


//o get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,
    }
});


// Function to read HTML template and replace placeholders with dynamic dat;


const getTemplate = (templateName, data) => {
    try {
        const filepath = path.join(__dirname, 'templates', `${templateName}.html`);
        if (!fs.existsSync(filepath)) {
            throw new Error(`Template file not found: ${filepath}`);
        }

        const source = fs.readFileSync(filepath, 'utf-8');
        const template = handlebars.compile(source);
        return template(data);
    } catch (error) {
        console.error(`Error in getTemplate for template: ${templateName}`, error);
        throw new Error("Failed to load email template");
    }
};

export const sendEmail =  async(to, subject, templateName, data) => {

    console.log("Sending email to:", to);
    console.log("Subject:", subject);
    console.log("Template Name:", templateName);
    console.log("Data:", data);

    const html = getTemplate(templateName,data); 
   
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
    };
  
   try{
   
     await transporter.sendMail(mailOptions);
     console.log("Email sent successfully");
   
     
   }catch(error){
     console.log("Error while sending email",error);
  
     
   }
};



