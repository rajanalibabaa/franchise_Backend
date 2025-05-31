import BrandListing from "../../model/Brand/brandListingPage.js";
import { ViewedBrandsByBrands, ViewedBrandsByInvestor, ViewedToBrands } from "../../model/ViewedBrands/viewedBrands.model.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";

// export const postViewBrands = async (req, res) => {
//   try {
//     const paramsID = req.params.id;
//     const viewedID = req.body.viewedID;
//     const investor = req.investorUser;
//     const brand = req.brandUser;
  
//     if (paramsID !== investor?.uuid && paramsID !== brand?.uuid) {
//       return res.status(403).json({ error: "Unauthorized request" });
//     }

//     if (investor?.uuid) {
//       console.log("Investor is viewing brand:", viewedID);

      
//       const targetBrand = await BrandListing.findOne({ uuid: viewedID });
//       if (!targetBrand) {
//         return res.status(404).json(new ApiResponse(404, {}, "Target brand not found"));
//       }

      
//       const alreadyViewed = await ViewedBrandsByInvestor.findOne({
//         InvestorUserId: investor._id,
//         "viewedByInvestors.BrandID": targetBrand._id
//       });

//       if (alreadyViewed) {
//           await ViewedBrandsByInvestor.updateOne(
//           {
//             InvestorUserId: investor._id,
//             "viewedByInvestors.BrandID": targetBrand._id
//           },
//           {
//             $set: {
//               "viewedByInvestors.$.addedAt": new Date()
//             }
//           }
//         );
//         return res.status(400).json(new ApiResponse(400, {}, "Brand already added to view"));
//       }

     
//       const updatedInvestorView = await ViewedBrandsByInvestor.findOneAndUpdate(
//         { InvestorUserId: investor._id },
//         {
//           $push: {
//             viewedByInvestors: {
//               BrandID: targetBrand._id,
//               addedAt: new Date()
//             }
//           }
//         },
//         { new: true, upsert: true } // Optional: creates doc if not exists
//       );

//       if (!updatedInvestorView) {
//         return res.status(500).json(new ApiResponse(500, {}, "Failed to save viewed brand for investor"));
//       }

  
//       const updatedBrandView = await ViewedToBrands.findOneAndUpdate(
//         { brandUserID: targetBrand._id },
//         {
//           $push: {
//             viewedByInvestors: {
//               InvestorID: investor._id,
//               addedAt: new Date()
//             }
//           }
//         },
//         { new: true, upsert: true }
//       );

//       if (!updatedBrandView) {
//         return res.status(500).json(new ApiResponse(500, {}, "Failed to save investor to brand's viewers"));
//       }

//       return res.status(200).json(new ApiResponse(200, updatedInvestorView, "Viewed brand successfully recorded"));
//     }

    
//     if (brand?.uuid) {
//       const targetBrand = await BrandListing.findOne({ uuid: viewedID });
//       if (!targetBrand) {
//         return res.status(404).json(new ApiResponse(404, {}, "Target brand not found"));
//       }


//       const alreadyViewed = await ViewedBrandsByBrands.findOne({
//         brandUserID: brand._id,
//         "viewedByBrands.BrandID": targetBrand._id
//       });

//       if (alreadyViewed) {
//         return res.status(400).json(new ApiResponse(400, {}, "Brand already added to view"));
//       } 
      
//       const updatedBrandByBrandView = await ViewedBrandsByBrands.findOneAndUpdate(
//         { brandUserID: brand._id },
//         {
//           $push: {
//             viewedByBrands: {
//               BrandID: targetBrand._id,
//               addedAt: new Date()
//             }
//           }
//         },
//         { new: true, upsert: true } 
//       );

//       if (!updatedBrandByBrandView) {
//         return res.status(500).json(new ApiResponse(500, {}, "Failed to save viewed brand for brand"));
//       }

//       const updatedBrandView = await ViewedToBrands.findOneAndUpdate(
//         { brandUserID: targetBrand._id },
//         {
//           $push: {
//             viewedByBrands: {
//               BrandID: brand._id,
//               addedAt: new Date()
//             }
//           }
//         },
//         { new: true, upsert: true }
//       );

//       if (!updatedBrandView) {
//         return res.status(500).json(new ApiResponse(500, {}, "Failed to save investor to brand's viewers"));
//       }

//       return res.status(200).json(new ApiResponse(200, updatedBrandByBrandView, "Viewed brand successfully recorded"));


//     }

    
//     return res.status(400).json({ error: "Invalid request" });

//   } catch (err) {
//     console.error("Error in postViewBrands:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

export const postViewBrands = async (req, res) => {
  try {
    const paramsID = req.params.id;
    const viewedID = req.body.viewedID;
    const investor = req.investorUser;
    const brand = req.brandUser;

    
    if (paramsID !== investor?.uuid && paramsID !== brand?.uuid) {
      return res.status(403).json(new ApiResponse(403, {}, "Unauthorized request"));
    }

    const targetBrand = await BrandListing.findOne({ uuid: viewedID });
    if (!targetBrand) {
      return res.status(404).json(new ApiResponse(404, {}, "Target brand not found"));
    }

    // === Investor Viewing a Brand ===
    if (investor?.uuid && paramsID === investor.uuid) {
      const investorView = await ViewedBrandsByInvestor.findOne({
        InvestorUserId: investor._id,
        "viewedByInvestors.BrandID": targetBrand._id
      });

      if (investorView) {
        await ViewedBrandsByInvestor.updateOne(
          {
            InvestorUserId: investor._id,
            "viewedByInvestors.BrandID": targetBrand._id
          },
          {
            $set: { "viewedByInvestors.$.addedAt": new Date() }
          }
        );
      } else {
        await ViewedBrandsByInvestor.findOneAndUpdate(
          { InvestorUserId: investor._id },
          {
            $push: {
              viewedByInvestors: {
                BrandID: targetBrand._id,
                addedAt: new Date()
              }
            }
          },
          { new: true, upsert: true }
        );
      }

      await ViewedToBrands.findOneAndUpdate(
        { brandUserID: targetBrand._id },
        {
          $push: {
            viewedByInvestors: {
              InvestorID: investor._id,
              addedAt: new Date()
            }
          }
        },
        { new: true, upsert: true }
      );

      return res.status(200).json(new ApiResponse(200, {}, "Viewed brand successfully recorded"));
    }

    // === Brand Viewing Another Brand ===
    if (brand?.uuid && paramsID === brand.uuid) {
      const brandView = await ViewedBrandsByBrands.findOne({
        brandUserID: brand._id,
        "viewedByBrands.BrandID": targetBrand._id
      });

      if (brandView) {
        await ViewedBrandsByBrands.updateOne(
          {
            brandUserID: brand._id,
            "viewedByBrands.BrandID": targetBrand._id
          },
          {
            $set: { "viewedByBrands.$.addedAt": new Date() }
          }
        );
      } else {
        await ViewedBrandsByBrands.findOneAndUpdate(
          { brandUserID: brand._id },
          {
            $push: {
              viewedByBrands: {
                BrandID: targetBrand._id,
                addedAt: new Date()
              }
            }
          },
          { new: true, upsert: true }
        );
      }

      await ViewedToBrands.findOneAndUpdate(
        { brandUserID: targetBrand._id },
        {
          $push: {
            viewedByBrands: {
              BrandID: brand._id,
              addedAt: new Date()
            }
          }
        },
        { new: true, upsert: true }
      );

      return res.status(200).json(new ApiResponse(200, {}, "Viewed brand successfully recorded"));
    }

    return res.status(400).json(new ApiResponse(400, {}, "Invalid request"));
  } catch (err) {
    console.error("Error in postViewBrands:", err);
    return res.status(500).json(new ApiResponse(500, {}, "Internal server error"));
  }
};

export const getAllViewBrands = async (req,res) => {
      const { id } = req.params;
      const investor = req.investorUser;
      const brand = req.brandUser;

      
      if (investor && investor._id) {
        // console.log(" ======= :",id)
        // console.log(" ======= :",investor.uuid)
        if (id !== investor.uuid) {
          return res.json(new ApiResponse(403,{},"Unauthorized request"))
        }

        const allViewedBrands = await ViewedBrandsByInvestor.find({InvestorUserId:investor._id}).select(" -_id -createdAt -updated -__v")

        if (!allViewedBrands) {
          return res.json(new ApiResponse(301,{},"no brands viewed yet"))
        }

        const brandIDs = allViewedBrands
  .flatMap(doc => doc.viewedByInvestors || [])
  .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
  .map(item => item.BrandID.toString());

        // console.log(brandIDs);

      const data = await BrandListing.find({ _id: { $in: brandIDs } }).select(
        ' -__v -updatedAt -createdAt ' +
        '-personalDetails.email -personalDetails.mobileNumber -personalDetails.headOfficeAddress ' +
        '-personalDetails.expansionLocation.pancardNumber -personalDetails.expansionLocation.gstNumber ' +
        '-brandDetails.pancard -brandDetails.gstCertificate -personalDetails.pancardNumber -personalDetails.gstNumber'
      );
// const j = data.map(item => item._id)
// console.log(j)

          const newData = [];

      for (let i = 0; i < brandIDs.length; i++) {
        const id = brandIDs[i];

        for (let j = 0; j < data.length; j++) {
          const brand = data[j];

          if (brand._id?.toString() === id) {
            newData.push(brand);
            break;
          }
        }
      }

     const updatedDATA = newData
  .filter(item => item._id)
  .map(item => {
    const { _id, ...rest } = item._doc ?? item; 
    return rest;
  });
      const reverse = updatedDATA.reverse()
        return res.json(
          new ApiResponse(200, reverse, "Viewed brands retrieved successfully")
        );
      }

      if (brand && brand._id) {
        // console.log(" ======= :",id)
        if (id !== brand.uuid) {
          return res.json(new ApiResponse(403,{},"Unauthorized request"))
        }

        const brandData = await ViewedBrandsByBrands.findOne({brandUserID:brand._id})
        if (!brandData) {
          return res.json(new ApiResponse(301,{},"no brands viewed yet"))
        }

        const brandIDs = brandData.viewedByBrands.map(item => item.BrandID.toString())
        


      const data = await BrandListing.find({ _id: { $in: brandIDs } }).select(
        ' -__v -updatedAt -createdAt ' +
        '-personalDetails.email -personalDetails.mobileNumber -personalDetails.headOfficeAddress ' +
        '-personalDetails.expansionLocation.pancardNumber -personalDetails.expansionLocation.gstNumber ' +
        '-brandDetails.pancard -brandDetails.gstCertificate -personalDetails.pancardNumber -personalDetails.gstNumber'
      );
       const newData = [];

      for (let i = 0; i < brandIDs.length; i++) {
        const id = brandIDs[i];

        for (let j = 0; j < data.length; j++) {
          const brand = data[j];

          if (brand._id?.toString() === id) {
            newData.push(brand);
            break;
          }
        }
      }
      const reverse = newData.reverse()


        return res.json(
          new ApiResponse(200, reverse, "Viewed brands retrieved successfully")
        );

        
      }
}