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
    console.log({
  location, category, investment,
  query: [
    { "BrandDetails.location": { $in: location } },
    { "FranchiseModal.totalInvestment": { $lte: investment } },
    { "BrandDetails.categories": { $in: category } },
    { "BrandDetails.email": { $ne: null } },
  ]
});

    for (const perfectbrand of perfectMatches) {
       console.log( "perfect", perfectbrand.BrandDetails.email)
      
        };

    // If no perfect matches, find partial matches  
const partialMatches = await FranchiseBrand.find({
    $and: [
        { "BrandDetails.location": { $in: location } },
        { "FranchiseModal.totalInvestment": { $lte: investment } },
    
    ],
});


for (const partialbrand of partialMatches) {
    console.log( "partial",partialbrand.BrandDetails.email)
 
   };


 
   

// 
    // if (perfectMatches.length > 0) {
        // await sendBrandEmail(userEmail, category, location, investment, perfectMatches, 'perfect');
        // return res.status(200).json({
            // status: 200,
            // message: "Email sent to perfect matches",
            // data: perfectMatches.map((item) => ({
                // companyName: item.BrandDetails.companyName,
                // email: item.BrandDetails.email,
                // location: item.BrandDetails.location, 
                // category: item.BrandDetails.categories,
                // investment: item.FranchiseModal.totalInvestment, 
            // })),
        // });
    // } 
// 
    // if (partialMatches.length > 0) {
        // await sendBrandEmail( category, location, investment, partialMatches, 'partial');
        // return res.status(200).json({
            // status: 200,
            // message: "Email sent to partial matches",
            // data: partialMatches.map((item) => ({
                // companyName: item.BrandDetails.companyName,
                // category: item.BrandDetails.categories,
                // email: item.BrandDetails.email,
                // location: item.BrandDetails.location,
                // investment: item.FranchiseModal.totalInvestment,
            // })),
        // });
    // }
// 
    return res.status(404).json({
        status: 404,
        message: "No matching brands found",
    });
};   