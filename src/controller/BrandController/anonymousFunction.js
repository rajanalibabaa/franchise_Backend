import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { BrandFranchiseDetails } from "../../model/Brand/Brand.model/FranchiseDetails.model.js";
import { FavoriteBrandsLikedByInvestor } from "../../model/Investor/favoriteBrandsInvestor.js";
import { InvsRegister } from "../../model/Investor/invsRegister.js";
import ShortListed from "../../model/ShortList/shortListedModel.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import { shuffleArray } from "../../utils/HelperFunction/shuffle.js";

// export const datafieldnewEntry = async (req, res) => {
//   try {
//     const brands = await BrandDetails.find({}, "_id brandDetails.isBrandPause")
  
//     const defaultPackage = {
//       packageType: "silver",
//       totalAmount: 999,
//       totalMonths: 3,
//       perMonthLead: 15,
//       totalLeads: 45,
//       isActive: true,
//       packageUpdatedTime: new Date(),
//     };

//     if (!brands.length) {
//       return res.status(404).json(new ApiResponse(404, [], "No brand records found"));
//     }

//     const updatedBrands = await Promise.all(
//       brands.map(async (brand, index) => {
//         try {
//           const updated = await BrandDetails.findByIdAndUpdate(
//             brand._id,
//             { $set: { "brandDetails.paymentPackage": defaultPackage } },
//             { new: true }
//           );

//           console.log(` Updated brand #${index + 1}:`, updated._id);
//           return updated;
//         } catch (innerErr) {
//           console.error(` Error updating brand at index ${index}:`, innerErr.message);
//           return null;
//         }
//       })
//     );

//     const successfulUpdates = updatedBrands.filter(Boolean);

//     return res.json(
//       new ApiResponse(200, successfulUpdates, "Re-entry process completed successfully")
//     );

//   } catch (outerError) {
//     console.error(" Outer error:", outerError);
//     return res.status(500).json({ message: "Server error", error: outerError.message });
//   }
// };





export const datafieldnewEntry = async (req, res) => {
  try {
    
    const brands = await BrandFranchiseDetails.find({"franchiseDetails.brandCategories.sub":"Quick Service Restaurant"})

    if (!brands.length) {
      return res
        .status(404)
        .json(new ApiResponse(404, [], "No brand records found"));
    }

    console.log(`🟢 Found ${brands.length} brands to update.`);

   
  
    const updatedBrands = await Promise.all(
      brands.map(async (brand, index) => {
        try {
          const updated = await BrandFranchiseDetails.findByIdAndUpdate(
            brand._id,
            {
              $set: {"franchiseDetails.brandCategories.sub":"Quick Service Restaurants (QSR)"},
            },
            { new: true }
          );

          console.log(`✅ Updated brand #${index + 1}:`, updated?._id);
          return updated;
        } catch (innerErr) {
          console.error(
            `❌ Error updating brand at index ${index}:`,
            innerErr.message
          );
          return null;
        }
      })
    );

  
    const successfulUpdates = updatedBrands.filter(Boolean);

  
    return res.json(
      new ApiResponse(
        200,
        successfulUpdates,
        `Re-entry process completed successfully. Updated ${successfulUpdates.length} brands.`
      )
    );
  } catch (outerError) {
    console.error("🚨 Outer error:", outerError);
    return res
      .status(500)
      .json(
        new ApiResponse(500, null, `Server error: ${outerError.message}`)
      );
  }
};


// export const datafieldnewEntry = async (req, res) => {
//   try {
//     // Get first 65 brands
//     const data = await BrandDetails.find({}).limit(65);

//     if (data.length === 0) {
//       return res
//         .status(404)
//         .json(new ApiResponse(404, [], "No brand records found"));
//     }

//     let matched = 0;
//     let modified = 0;

//     // Update each document one-by-one
//     for (let i = 0; i < data.length; i++) {
//       const element = data[i];

//       const result = await BrandDetails.findByIdAndUpdate(
//         element._id, // FIXED
//         { 
//           $set: { 
//             "brandDetails.isBrandPause": false 
//           } 
//         },
//         { new: true } // optional but safe
//       );

//       if (result) {
//         matched++;
//         modified++; // assumes update always modifies (or check old value if needed)
//       }
//     }

//     return res.json(
//       new ApiResponse(
//         200,
//         { matched, modified },
//         `Re-entry completed. Updated ${modified} brands.`
//       )
//     );

//   } catch (error) {
//     console.error("🚨 Server error:", error);
//     return res
//       .status(500)
//       .json(new ApiResponse(500, null, `Server error: ${error.message}`));
//   }
// };


export const likeandshortlist = async(id) => {

  let likedBrands = [];
  let shortListedBrands = [];
  if (id) {
      const investor = await InvsRegister.findOne({ uuid: id });

      if (investor) {
       
        const investorFavorites = await FavoriteBrandsLikedByInvestor.findOne({
          InvestorUserId: investor._id
        });
        likedBrands = investorFavorites?.favoriteBrandByInvestor.map(b => b.brandID.toString()) || [];

       
        const investorShortList = await ShortListed.find({
          "ShortListedBy.investor.userId": investor._id
        });
        shortListedBrands = investorShortList.map(s => s.brandOwnerId.toString());

        

      } else {
        
        const brand = await BrandDetails.findOne({ uuid: id });
console.log("brand :",brand)
        if (brand) {
          
          const brandFavorites = await FavoriteBrandsLikedBybrand.findOne({
            brandUserId: brand._id
          });
           console.log("brandFavorites id :",brandFavorites)
          likedBrands = brandFavorites?.favoriteBrandBybrand.map  (b => b.brandID.toString()) || [];

         
          const brandShortList = await ShortListed.find({
            "ShortListedBy.brand.userId": brand._id
          });
          shortListedBrands = brandShortList.map(s => s.brandOwnerId.toString());
        }
      }
    }

    // console.log("shortListedBrands :",shortListedBrands)

    return {likedBrands,shortListedBrands}
}
 
export const testgetAllBrands = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const id = req.query.id || null;

    const { likedBrands, shortListedBrands } = await likeandshortlist(id);

    const aggregationPipeline = [
      {
        $match: {
          "brandDetails.isBrandPause": { $ne: true } 
        }
      },
      {
        $lookup: {
          from: "brandfranchisedetails",
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "franchiseDetails"
        }
      },
      {
        $lookup: {
          from: "branduploads",
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "uploads"
        }
      },
      { $unwind: { path: "$franchiseDetails", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$uploads", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          isLiked: {
            $in: ["$_id", likedBrands.map(id => new mongoose.Types.ObjectId(id))]
          },
          isShortListed: {
            $in: ["$_id", shortListedBrands.map(id => new mongoose.Types.ObjectId(id))]
          }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 0,
          brandID: 1,
          uuid: 1,
          isLiked: 1,
          isShortListed: 1,
          brandname: "$brandDetails.brandName",
          brandCategories: {
            $ifNull: ["$franchiseDetails.franchiseDetails.brandCategories", null]
          },
          fico: {
            $let: {
              vars: {
                data: { $arrayElemAt: ["$franchiseDetails.franchiseDetails.fico", 0] }
              },
              in: {
                investmentRange: "$$data.investmentRange",
                areaRequired: "$$data.areaRequired",
                franchiseModel: "$$data.franchiseModel"
              }
            }
          },
          logo: {
            $cond: {
              if: { $isArray: "$uploads.uploads.brandLogo" },
              then: { $arrayElemAt: ["$uploads.uploads.brandLogo", 0] },
              else: null
            }
          },
          franchiseVideos: {
            $cond: {
              if: { $isArray: "$uploads.uploads.franchisePromotionVideo" },
              then: { $arrayElemAt: ["$uploads.uploads.franchisePromotionVideo", 0] },
              else: null
            }
          }
        }
      },
      { $skip: skip },
      { $limit: limit }
    ];

    const [brandsData, totalCountResult] = await Promise.all([
      BrandDetails.aggregate(aggregationPipeline),
      BrandDetails.aggregate([
        {
          $match: { "brandDetails.isBrandPause": { $ne: true } } 
        },
        {
          $count: "totalCount"
        }
      ])
    ]);

    const totalCount = totalCountResult[0]?.totalCount || 0;

    if (!brandsData || brandsData.length === 0) {
      return res.json(new ApiResponse(404, null, "No active brands found"));
    }

    const brands = shuffleArray(brandsData);
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return res.json(
      new ApiResponse(
        200,
        {
          brands,
          pagination: {
            total: totalCount,
            totalPages,
            currentPage: page,
            limit,
            hasNext,
            hasPrevious
          }
        },
        "Brand data fetched successfully"
      )
    );
  } catch (error) {
    console.error("Error fetching brands:", error);
    return res.json(
      new ApiResponse(500, null, `Failed to fetch brands: ${error.message}`)
    );
  }
};
