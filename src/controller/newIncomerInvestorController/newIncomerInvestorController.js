import FranchiseBrand from '../../model/Brand/brandListingPage.js';
import { sendEmailMsg } from '../../utils/SenderMSG/sendEmailMSG.js';
export const newIncomerInvestorController = async (req, res) => {
    const { userEmail, category, location, investment } = req.body;

    // First try to find perfect matches (all criteria)
    const perfectMatches = await FranchiseBrand.find({
        $and: [
            { "BrandDetails.location": { $in: location } },
            { "FranchiseModal.totalInvestment": { $lte: investment } },
            { "BrandDetails.categories": { $in: category } },
            { "BrandDetails.email": { $ne: null } },
        ],
    });

    if (perfectMatches.length > 0) {
        await sendEmailMsg(userEmail, category, location, investment, perfectMatches, 'perfect');
        return res.status(200).json({
            status: 200,
            message: "Email sent to perfect matches",
            data: perfectMatches.map((item) => ({
                companyName: item.BrandDetails.companyName,
                email: item.BrandDetails.email,
                location: item.BrandDetails.location, 
                category: item.BrandDetails.categories,
                investment: item.FranchiseModal.totalInvestment, 
            })),
        });
    } 

    // If no perfect matches, find partial matches  
    const partialMatches = await FranchiseBrand.find({
        $and: [
            { "BrandDetails.location": { $in: location } },
            { "FranchiseModal.totalInvestment": { $lte: investment } },
            { "BrandDetails.email": { $ne: null } },
        ],
    });

    if (partialMatches.length > 0) {
        await sendEmailMsg(userEmail, category, location, investment, partialMatches, 'partial');
        return res.status(200).json({
            status: 200,
            message: "Email sent to partial matches",
            data: partialMatches.map((item) => ({
                companyName: item.BrandDetails.companyName,
                category: item.BrandDetails.categories,
                email: item.BrandDetails.email,
                location: item.BrandDetails.location,
                investment: item.FranchiseModal.totalInvestment,
            })),
        });
    }

    return res.status(404).json({
        status: 404,
        message: "No matching brands found",
    });
};   