import investerRegisterleadsSchema from "../../model/NewIncomeInvestor/leadsModel.js";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { sendBrandEmailPerfect } from "../../utils/Centralized Email/centralizedEmail.js";


export const newIncomerInvestorController = async (req, res) => {
    try {
        const { userEmail, investername, category, country, state, city, totalInvestment } = req.body;

        const {main,sub,child}
      
        const newLead = new investerRegisterleadsSchema({
            investorEmail: userEmail,
            investorName: investername,
            category,
            country,
            state,
            city,
            investmentAmount: totalInvestment
        });
        await newLead.save();
        console.log(`New investor lead saved: ${userEmail}`);

        const emailedBrands = new Set();
        const results = [];
        const perfectMatchesData = [];
        const partialMatchesData = [];

        // 2. Find PERFECT matches (exact match on category and investment, and expansion location matches investor's location)
        const perfectMatches = await BrandListing.find({
            "personalDetails.email": { $ne: null },
            "expansionLocation": {
                $elemMatch: {
                    country: country,
                    state: state,
                    city: city
                }
            },
            "personalDetails.brandCategories": { 
                $elemMatch: { 
                    $or: [
                        { main: category },
                        { sub: category },
                        { child: category }
                    ]
                }
            },
            "franchiseDetails.modelsOfFranchise": {
                $elemMatch: {
                    investmentRange: totalInvestment
                }
            }
        });

        for (const brand of perfectMatches) {
            const brandEmail = brand.personalDetails.email;
            const brandCompanyName = brand.personalDetails.companyName;
            const emailSubject = 'An investor has been found who matches your "InvestmentRange", "Category", and "Expansion Location" preferences exactly. Time to connect';

            if (!emailedBrands.has(brandEmail)) {
                try {
                    await sendBrandEmailPerfect(
                        brandEmail,
                        brandCompanyName,
                        investername,
                        category,
                        `${city}, ${state}, ${country}`, // location format
                        totalInvestment,
                        emailSubject
                    );
                    emailedBrands.add(brandEmail);

                    perfectMatchesData.push({
                        email: brandEmail,
                        companyName: brandCompanyName
                    });

                    // Get the matching franchise model
                    const matchingModel = brand.franchiseDetails.modelsOfFranchise.find(
                        model => model.requiredInvestmentCapital === totalInvestment
                    );

                    results.push({
                        companyName: brandCompanyName,
                        email: brandEmail,
                        location: `${city}, ${state}, ${country}`,
                        category: brand.personalDetails.brandCategories,
                        investment: matchingModel ? matchingModel.requiredInvestmentCapital : 'N/A',
                        matchType: 'perfect'
                    });

                    console.log(`Perfect match email sent to: ${brandEmail}`);
                } catch (error) {
                    console.error(`Failed to email perfect match: ${brandEmail}`, error);
                }
            }
        }

        // 3. Find PARTIAL matches (only match on expansion location + investment)
        const partialMatches = await BrandListing.find({
            "personalDetails.email": { $ne: null },
            "expansionLocation": {
                $elemMatch: {
                    country: country,
                    state: state,
                    city: city
                }
            },
            "franchiseDetails.modelsOfFranchise": {
                $elemMatch: {
                    investmentRange: totalInvestment
                }
            },
            "personalDetails.email": { $nin: Array.from(emailedBrands) }
        });

        for (const brand of partialMatches) {
            const brandEmail = brand.personalDetails.email;
            const brandCompanyName = brand.personalDetails.companyName;
            const emailSubject = 'We\'ve found an investor who matches your "InvestmentRange" and "Expansion Location" perfectly. The Category is slightly different, but this lead holds strong potential for your brand.';

            if (!emailedBrands.has(brandEmail)) {
                try {
                    await sendBrandEmailPerfect(
                        brandEmail,
                        brandCompanyName,
                        investername,
                        category,
                        `${city}, ${state}, ${country}`,
                        totalInvestment,
                        emailSubject
                    );
                    emailedBrands.add(brandEmail);

                    partialMatchesData.push({
                        email: brandEmail,
                        companyName: brandCompanyName
                    });

                    // Get the matching franchise model
                    const matchingModel = brand.franchiseDetails.modelsOfFranchise.find(
                        model => model.requiredInvestmentCapital === totalInvestment
                    );

                    results.push({
                        companyName: brandCompanyName,
                        email: brandEmail,
                        location: `${city}, ${state}, ${country}`,
                        category: brand.personalDetails.brandCategories,
                        investment: matchingModel ? matchingModel.requiredInvestmentCapital : 'N/A',
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