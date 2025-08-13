import { sendEmail } from "./emailService.js";

export const sendBrandEmailPerfect = async (
  recipientEmail,
  brandCompanyName,
  investername,
  category,
  location,
  investment,
  emailSubject
) => {
  try {
    const subject = "You Have A Good News, New Investor Register";
    const emailTemplateName = "brandRegister_template"; // Ensure this matches the template file name in the 'templates' folder
    const emailData = {
      subject: emailSubject,
      companyname: brandCompanyName,
      name: investername,
      category: category,
      location: location,
      investment: investment,
    };

    // Call the sendEmail function
    await sendEmail(recipientEmail, subject, emailTemplateName, emailData);
  } catch (error) {
    console.error("Failed to send test email:", error);
  }
};

export const sendInstantApplyEmail = async (
  fullName,
  email,
  mobileNumber,
  brandName,
  brandEmail,
  categories,
  location,
  investmentRange,
  planToInvest,
  readyToInvest
) => {
  console.log(
    "req.body :",
    fullName,
    email,
    mobileNumber,
    brandName,
    brandEmail,
    categories,
    location,
    investmentRange,
    planToInvest,
    readyToInvest
  );
  try {

    // Dummy data for testing
    const emailSubject =
      "You Have A Good News, New Investor interest your brand and apply";
    const subject =
      "You Have A Good News, New Instant Applier Details Here..! ";
    const emailTemplateName = "instantApply_template"; // Ensure this matches the template file name in the 'templates' folder
    const emailData = {
      brandName: brandName,
      name: fullName,
      email: email,
      mobileNumber: mobileNumber,
      categories: categories,
      location: location,
      emailSubject: emailSubject,
      investmentRange: investmentRange,
      planToInvest: planToInvest,
      readyToInvest: readyToInvest,
    };

    // console.log(" ============== :",emailData)
    // Call the sendEmail function
    await sendEmail(brandEmail, subject, emailTemplateName, emailData);
  } catch (error) {
    console.error("Failed to send test email:", error);
  }
};

export const sendInstantApplyLeadLocation = async (
  fullName,
  email,
  mobileNumber,
  brandEmail,
  brandCompanyName,
  categories,
  location,
  investmentRange,
  emailSubject,
  planToInvest,
  readyToInvest
) => {
  console.log( "dddd:",fullName,
  email,
  mobileNumber,
  brandEmail,
  brandCompanyName,
  categories,
  location,
  investmentRange,
  emailSubject,
  planToInvest,
  readyToInvest)
  console.log(categories, location, ".o.o.o");
  const subject = "You Have A Good News, New Instant Applier Details Here..! ";
  const emailTemplateName = "instantApply_LeadLocation_template"; // Ensure this matches the template file name in the 'templates' folder
  const emailData = {
    brandCompanyName: brandCompanyName,
    name: fullName,
    email: email,
    mobileNumber: mobileNumber,
    categories: categories,
    location: location,
    investmentRange: investmentRange,
    emailSubject: emailSubject,
    planToInvest: planToInvest,
    readyToInvest: readyToInvest,
  };


  // Call the sendEmail function
  await sendEmail(brandEmail, subject, emailTemplateName, emailData);
};


export const sendPremiumPackageOfferEmail = async (
  fullName,
  email,
  mobileNumber,
  brandEmail,
  brandCompanyName,
  categories,
  location,
  investmentRange,
  emailSubject,
  planToInvest,
  readyToInvest
) => {
  console.log(categories, location, ".o.o.o");
  const subject = "You Have A Good News, New Instant Applier Details Here..! ";
  const emailTemplateName = "InstantApplyPerAndPar_template"; // Ensure this matches the template file name in the 'templates' folder
  const emailData = {
    brandCompanyName: brandCompanyName,
    name: fullName,
    email: email,
    mobileNumber: mobileNumber,
    categories: categories,
    location: location,
    investmentRange: investmentRange,
    emailSubject: emailSubject,
    planToInvest: planToInvest,
    readyToInvest: readyToInvest,
  };

  // console.log(" ============== :",emailData)

  // Call the sendEmail function
  await sendEmail(brandEmail, subject, emailTemplateName, emailData);
};

export const sendInstantApplyPerAndPar = async (
  fullName,
  email,
  mobileNumber,
  brandEmail,
  brandCompanyName,
  categories,
  location,
  investmentRange,
  emailSubject,
  planToInvest,
  readyToInvest
) => {
  console.log(categories, location, ".o.o.o");
  const subject = "You Have A Good News, New Instant Applier Details Here..! ";
  const emailTemplateName = "InstantApplyPerAndPar_template"; // Ensure this matches the template file name in the 'templates' folder
  const emailData = {
    brandCompanyName: brandCompanyName,
    name: fullName,
    email: email,
    mobileNumber: mobileNumber,
    categories: categories,
    location: location,
    investmentRange: investmentRange,
    emailSubject: emailSubject,
    planToInvest: planToInvest,
    readyToInvest: readyToInvest,
  };
  // console.log(" ============== :",emailData)

  // Call the sendEmail function
  await sendEmail(brandEmail, subject, emailTemplateName, emailData);
};

export const sendPostRequirementEmail = async (
  email,
  name,
  address,
  country,
  pincode,
  city,
  state,
  mobileNumber,
  whatsappNumber,
  industryType,
  investmentRange,
  floorAreaRequirement,
  timelineToStart,
  needLoan
) => {
  try {
    const subject =
      "You Have A Good News, New Post Requirement Details Here..! ";
    const emailTemplateName = "instantApply_template"; // Ensure this matches the template file name in the 'templates' folder
    const emailData = {
      email: email,
      name: name,
      address: address,
      country: country,
      pincode: pincode,
      city: city,
      state: state,
      mobileNumber: mobileNumber,
      whatsappNumber: whatsappNumber,
      industryType: industryType,
      investmentRange: investmentRange,
      floorAreaRequirement: floorAreaRequirement,
      timelineToStart: timelineToStart,
      needLoan: needLoan,
    };
    // Call the sendEmail function
    await sendEmail(email, subject, emailTemplateName, emailData);
  } catch (error) {
    console.error("Failed to send test email:", error);
  }
};

export const sendEmailOTP = async (email, otp) => {
  try {
    const subject = "Verify Your Email Address";
    const emailTemplateName = "otp_template";
    await sendEmail(email, subject, emailTemplateName, { otp });
    console.log("Email sent: ", email);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
