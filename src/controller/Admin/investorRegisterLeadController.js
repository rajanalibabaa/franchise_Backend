import investerRegisterleadsSchema from "../../model/NewIncomeInvestor/leadsModel.js";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { sendBrandEmailPerfect } from "../../utils/Centralized Email/centralizedEmail.js";


export const newIncomerInvestorController = async (req, res) => {
    try {
       const { userEmail, investername, category, location, totalInvestment } = req.body;
        // 1. Save new investor lead
        const newLead = new investerRegisterleadsSchema({
            investorEmail: userEmail,
            investorName: investername,
            category,
            location,
            investmentAmount: totalInvestment
        });
        await newLead.save();
        console.log(`New investor lead saved: ${userEmail}`);

        const emailedBrands = new Set();
        const results = [];
        const perfectMatchesData = [];
        const partialMatchesData = [];

        // 2. Find PERFECT matches (exact string match on all fields)
        const perfectMatches = await BrandListing.find({
            "BrandDetails.companyName": { $ne: null },
            "BrandDetails.location": { $in: location },
            "BrandDetails.categories": { $in: category },
            "FranchiseModal.totalInvestment": totalInvestment,
            "BrandDetails.email": { $ne: null }
        });

        for (const brand of perfectMatches) {
            const brandEmail = brand.BrandDetails.email;
            const brandCompanyName = brand.BrandDetails.companyName;
            const emailSubject = 'An investor has been found who matches your "InvestmentRange", "Category", and "Location" preferences exactly. Time to connect';

            if (!emailedBrands.has(brandEmail)) {
                try {
                    await sendBrandEmailPerfect(
                        brandEmail,
                        brandCompanyName,
                        investername,
                        category,
                        location,
                        totalInvestment,
                        emailSubject
                    );
                    emailedBrands.add(brandEmail);

                    perfectMatchesData.push({
                        email: brandEmail,
                        companyName: brandCompanyName
                    });

                    results.push({
                        companyName: brandCompanyName,
                        email: brandEmail,
                        location: brand.BrandDetails.location,
                        category: brand.BrandDetails.categories,
                        investment: brand.FranchiseModal.totalInvestment,
                        matchType: 'perfect'
                    });

                    

                    console.log(`Perfect match email sent to: ${brandEmail}`);
                } catch (error) {
                    console.error(`Failed to email perfect match: ${brandEmail}`, error);
                }
            }
        }

        // 3. Find PARTIAL matches (only match on location + investment)
        const partialMatches = await BrandListing.find({
            "BrandDetails.companyName": { $ne: null },
            "BrandDetails.location": { $in: location },
            "FranchiseModal.totalInvestment": totalInvestment,
            "BrandDetails.email": { $ne: null },
            "BrandDetails.email": { $nin: Array.from(emailedBrands) }
        });

        for (const brand of partialMatches) {
            const brandEmail = brand.BrandDetails.email;
            const brandCompanyName = brand.BrandDetails.companyName;
            const emailSubject = 'We\'ve found an investor who matches your "InvestmentRange" and "Location" perfectly. The Category is slightly different, but this lead holds strong potential for your brand.';

            if (!emailedBrands.has(brandEmail)) {
                try {
                    await sendBrandEmailPerfect(
                        brandEmail,
                        brandCompanyName,
                        investername,
                        category,
                        location,
                        totalInvestment,
                        emailSubject
                    );
                    emailedBrands.add(brandEmail);

                    partialMatchesData.push({
                        email: brandEmail,
                        companyName: brandCompanyName
                    });

                    results.push({
                        companyName: brandCompanyName,
                        email: brandEmail,
                        location: brand.BrandDetails.location,
                        category: brand.BrandDetails.categories,
                        investment: brand.FranchiseModal.totalInvestment,
                        matchType: 'partial'
                    });

                    console.log(`Partial match email sent to: ${brandEmail}`);
                } catch (error) {
                    console.error(`Failed to email partial match: ${brandEmail}`, error);
                }
            }
        }

        // 4. Update lead with match data
        await investerRegisterleadsSchema.findByIdAndUpdate(newLead._id, {
            $set: {
                brandPerfectMatches: perfectMatchesData,
                brandPartialMatches: partialMatchesData
            }
        });

        // 5. Final response
        if (results.length > 0) {
            return res.status(200).json({
                status: 200,
                message: `Matches found (${perfectMatchesData.length} perfect, ${partialMatchesData.length} partial)`,
                data: results,
                stats: {
                    total: results.length,
                    perfectMatches: perfectMatchesData.length,
                    partialMatches: partialMatchesData.length
                }
            });
        } else {
            return res.status(404).json({
                status: 404,
                message: "No matching brands found"
            });
        }

        

    } catch (error) {
        console.error("Controller error:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
}  

// get all investor lead 

export const getNewInvestorLead = async (req,res)=>{
      try {
          const allNewLead = await investerRegisterleadsSchema.find({});
          res.status(200).json(allNewLead);
        } catch (err) {
          res.status(500).json({ error: err.message });  
        }
}


//get investor lead by id

export const getNewInvestorLeadById = async (req,res)=>{
   try {
      const newLead = await investerRegisterleadsSchema.findById(req.params.id);
      if (!newLead) return res.status(404).json({ error: 'NewInvestor not found' });
      res.status(200).json({ message: 'NewInvestor fetched successfully', data: newLead });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
}

//  get investor lead by uuid

export const getNewInvestorLeadByUuid = async (req,res) => {
     try {
        const newLead = await investerRegisterleadsSchema.findOne({ uuid: req.params.uuid });
        if (!newLead) return res.status(404).json({ error: 'NewInvestor not found' });
        res.status(200).json({ message: 'NewInvestor fetched successfully', data: newLead });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
}