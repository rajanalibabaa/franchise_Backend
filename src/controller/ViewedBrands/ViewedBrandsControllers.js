import BrandListing from "../../model/Brand/brandListingPage.js";
import { ViewedBrandsByBrands, ViewedBrandsByInvestor, ViewedToBrands } from "../../model/ViewedBrands/viewedBrands.model.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";

export const postViewBrands = async (req, res) => {
  try {
    const paramsID = req.params.id;
    const viewedID = req.body.viewedID;
    const investor = req.investorUser;
    const brand = req.brandUser;
  
    if (paramsID !== investor?.uuid && paramsID !== brand?.uuid) {
      return res.status(403).json({ error: "Unauthorized request" });
    }

    if (investor?.uuid) {
      console.log("Investor is viewing brand:", viewedID);

      
      const targetBrand = await BrandListing.findOne({ uuid: viewedID });
      if (!targetBrand) {
        return res.status(404).json(new ApiResponse(404, {}, "Target brand not found"));
      }

      
      const alreadyViewed = await ViewedBrandsByInvestor.findOne({
        InvestorUserId: investor._id,
        "viewedByInvestors.BrandID": targetBrand._id
      });

      if (alreadyViewed) {
        return res.status(400).json(new ApiResponse(400, {}, "Brand already added to view"));
      }

     
      const updatedInvestorView = await ViewedBrandsByInvestor.findOneAndUpdate(
        { InvestorUserId: investor._id },
        {
          $push: {
            viewedByInvestors: {
              BrandID: targetBrand._id,
              addedAt: new Date()
            }
          }
        },
        { new: true, upsert: true } // Optional: creates doc if not exists
      );

      if (!updatedInvestorView) {
        return res.status(500).json(new ApiResponse(500, {}, "Failed to save viewed brand for investor"));
      }

  
      const updatedBrandView = await ViewedToBrands.findOneAndUpdate(
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

      if (!updatedBrandView) {
        return res.status(500).json(new ApiResponse(500, {}, "Failed to save investor to brand's viewers"));
      }

      return res.status(200).json(new ApiResponse(200, updatedInvestorView, "Viewed brand successfully recorded"));
    }

    
    if (brand?.uuid) {
      const targetBrand = await BrandListing.findOne({ uuid: viewedID });
      if (!targetBrand) {
        return res.status(404).json(new ApiResponse(404, {}, "Target brand not found"));
      }


      const alreadyViewed = await ViewedBrandsByBrands.findOne({
        brandUserID: brand._id,
        "viewedByBrands.BrandID": targetBrand._id
      });

      if (alreadyViewed) {
        return res.status(400).json(new ApiResponse(400, {}, "Brand already added to view"));
      } 
      
      const updatedBrandByBrandView = await ViewedBrandsByBrands.findOneAndUpdate(
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

      if (!updatedBrandByBrandView) {
        return res.status(500).json(new ApiResponse(500, {}, "Failed to save viewed brand for brand"));
      }

      const updatedBrandView = await ViewedToBrands.findOneAndUpdate(
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

      if (!updatedBrandView) {
        return res.status(500).json(new ApiResponse(500, {}, "Failed to save investor to brand's viewers"));
      }

      return res.status(200).json(new ApiResponse(200, updatedBrandByBrandView, "Viewed brand successfully recorded"));


    }

    
    return res.status(400).json({ error: "Invalid request" });

  } catch (err) {
    console.error("Error in postViewBrands:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

