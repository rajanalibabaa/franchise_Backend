import BrandListingPage from "../../model/Brand/brandListingPage.js";
import nodemailer from "nodemailer";

// Configuration constants (could move to config file)
const EMAIL_CONFIG = {
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Use environment variables
    pass: process.env.EMAIL_PASSWORD
  }
};

const EMAIL_DEFAULTS = {
  from: process.env.EMAIL_USER,
  subject: "Matching Brand Opportunities"
};

export const newIncomerInvestorController = async (req, res) => {
  try {
    // 1. Input Validation
    const { userEmail, category, location, investment } = req.body;
    
    if (!userEmail || !category || !location || !investment) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required: userEmail, category, location, investment" 
      });
    }

    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(userEmail)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid email format" 
      });
    }

    // 2. Database Query
    const matchingBrands = await BrandListingPage.find({
        category: new RegExp(category, "i"), // Case-insensitive match for category
        location: new RegExp(location, "i"), // Case-insensitive match for location
        investment: { $lte: Number(investment) } // Ensure numeric comparison
    }).select('brandName email contactDetails');
    
     console.log("Matching Brands: ", matchingBrands);

    if (matchingBrands.length === 0) {
      return res.status(200).json({ 
        success: true,
        message: "No matching brands found for your criteria",
        suggestions: "Try expanding your search criteria or increasing your investment budget"
      });
    }

    // 3. Prepare Email Content
    const brandList = matchingBrands.map(brand => 
      `- ${brand.brandName || "Unnamed Brand"} (Investment: ₹${brand.investment})`
    ).join('\n');

    const emailText = `
      Dear Investor,
      
      Based on your preferences:
      - Category: ${category}
      - Location: ${location}
      - Maximum Investment: ₹${investment}
      
      We found these matching brands:
      ${brandList}
      
      Best regards,
      Franchise Matching Team
    `;

    // 4. Send Email
    const transporter = nodemailer.createTransport(EMAIL_CONFIG);
    
    await transporter.sendMail({
      ...EMAIL_DEFAULTS,
      to: userEmail,
      text: emailText,
      html: `<pre>${emailText}</pre>` // Simple HTML version
    });

    // 5. Response
    return res.status(200).json({
      success: true,
      message: "Matching brands found and notification sent to your email",
      count: matchingBrands.length,
      brands: matchingBrands.map(b => b.brandName)
    });

  } catch (error) {
    console.error("Error in investor controller:", error);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};