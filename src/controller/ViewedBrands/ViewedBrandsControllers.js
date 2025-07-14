import BrandListing from "../../model/Brand/brandListingPage.js";
import { InvsRegister } from "../../model/Investor/invsRegister.js";
import { ViewedBrandsByBrands, ViewedBrandsByInvestor, ViewedToBrands } from "../../model/ViewedBrands/viewedBrands.model.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";

export const postViewBrands = async (req, res) => {
  try {
    const paramsID = req.params.id;
    const viewedID = req.body.viewedID;
    const investor = req.investorUser;
    const brand = req.brandUser;

    console.log("viewedID :",req.body)

    if (paramsID !== investor?.uuid && paramsID !== brand?.uuid) {
      return res.status(403).json(new ApiResponse(403, {}, "Unauthorized request"));
    }

    const targetBrand = await BrandListing.findOne({ uuid: viewedID });
    if (!targetBrand) {
      return res.json(new ApiResponse(404, {}, "Target brand not found"));
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

      return res.json(new ApiResponse(200, {}, "Viewed brand successfully recorded"));
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

      const a = await ViewedToBrands.findOneAndUpdate(
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

      console.log("a :",a)

      return res.status(200).json(new ApiResponse(200, a, "Viewed brand successfully recorded"));
    }

    return res.status(400).json(new ApiResponse(400, {}, "Invalid request"));
  } catch (err) {
    console.error("Error in postViewBrands:", err);
    return res.status(500).json(new ApiResponse(500, {}, "Internal server error"));
  }
};

export const getAllViewBrandByID = async (req, res) => {
  try {
    const { id } = req.params;
    const investor = req.investorUser;
    const brand = req.brandUser;

    if (investor && investor._id) {
      if (id !== investor.uuid) {
        return res.status(403).json(new ApiResponse(403, {}, "Unauthorized request"));
      }

      const allViewedBrands = await ViewedBrandsByInvestor.findOne({ InvestorUserId: investor._id })
        .select("-_id -createdAt -updatedAt -__v")
        .populate({
          path: "viewedByInvestors.BrandID",
          select: "-__v -updatedAt -createdAt -personalDetails.email -personalDetails.mobileNumber -personalDetails.headOfficeAddress -personalDetails.expansionLocation.pancardNumber -personalDetails.expansionLocation.gstNumber -brandDetails.pancard -brandDetails.gstCertificate -personalDetails.pancardNumber -personalDetails.gstNumber"
        });

        // console.log("allViewedBrands :",allViewedBrands)

      if (!allViewedBrands || !allViewedBrands.viewedByInvestors?.length) {
        return res.status(200).json(new ApiResponse(200, [], "No brands viewed yet"));
      }

      const sortedBrands = allViewedBrands.viewedByInvestors
        .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
        .map(item => item.BrandID);

        // console.log("sortedBrands :",sortedBrands)

      return res.json(new ApiResponse(200, sortedBrands, "Viewed brands retrieved successfully"));
    }

    if (brand && brand._id) {
      if (id !== brand.uuid) {
        return res.status(403).json(new ApiResponse(403, {}, "Unauthorized request"));
      }

      const brandData = await ViewedBrandsByBrands.findOne({ brandUserID: brand._id })
        .select("-_id -createdAt -updatedAt -__v")
        .populate({
          path: "viewedByBrands.BrandID",
          select: "-__v -updatedAt -createdAt -personalDetails.email -personalDetails.mobileNumber -personalDetails.headOfficeAddress -personalDetails.expansionLocation.pancardNumber -personalDetails.expansionLocation.gstNumber -brandDetails.pancard -brandDetails.gstCertificate -personalDetails.pancardNumber -personalDetails.gstNumber"
        });

      if (!brandData || !brandData.viewedByBrands?.length) {
        return res.status(200).json(new ApiResponse(200, [], "No brands viewed yet"));
      }

      const sortedBrands = brandData.viewedByBrands
        .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
        .map(item => item.BrandID);

      return res.json(new ApiResponse(200, sortedBrands, "Viewed brands retrieved successfully"));
    }

    return res.status(403).json(new ApiResponse(403, {}, "Unauthorized request"));
  } catch (err) {
    console.error("Error in getAllViewBrandByID:", err);
    return res.status(500).json(new ApiResponse(500, {}, "Internal server error"));
  }
};

export const deleteViewBrandByID = async (req, res) => {
  try {
    const { id } = req.params;
    const { brandID } = req.body;
    const investor = req.investorUser;
    const brand = req.brandUser;

    if (id !== investor?.uuid && id !== brand?.uuid) {
      return res.status(403).json(new ApiResponse(403, {}, "Unauthorized request"));
    }

    const target = await BrandListing.findOne({ uuid: brandID });
    if (!target) {
      return res.status(404).json(new ApiResponse(404, {}, "Brand not found"));
    }

    if (investor && investor._id) {
      const updatedView = await ViewedBrandsByInvestor.findOneAndUpdate(
        { InvestorUserId: investor._id },
        { $pull: { viewedByInvestors: { BrandID: target._id } } },
        { new: true }
      );

      await ViewedToBrands.findOneAndUpdate(
        { brandUserID: target._id },
        { $pull: { viewedByInvestors: { InvestorID: investor._id } } }
      );

      return res.status(200).json(
        new ApiResponse(200, updatedView, "Brand removed from investor's views")
      );
    }

    if (brand && brand._id) {
      const updatedView = await ViewedBrandsByBrands.findOneAndUpdate(
        { brandUserID: brand._id },
        { $pull: { viewedByBrands: { BrandID: target._id } } },
        { new: true }
      );

      await ViewedToBrands.findOneAndUpdate(
        { brandUserID: target._id },
        { $pull: { viewedByBrands: { BrandID: brand._id } } }
      );

      return res.status(200).json(
        new ApiResponse(200, updatedView, "Brand removed from brand views")
      );
    }

    return res.status(400).json(new ApiResponse(400, {}, "Invalid request"));
  } catch (err) {
    console.error("Error in deleteViewBrandByID:", err);
    return res.status(500).json(new ApiResponse(500, {}, "Internal server error"));
  }
};

export const getAllViewBrands = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = req.brandUser;

    // Authorization check
    if (id !== brand?.uuid) {
      return res.status(403).json(
        new ApiResponse(403, {}, "Unauthorized request")
      );
    }

    // Fetch viewed data with necessary fields only
    const viewedData = await ViewedToBrands.findOne(
      { brandUserID: brand._id },
      { viewedByInvestors: 1, viewedByBrands: 1 }
    )
    .populate({
      path: 'viewedByInvestors.InvestorID',
      select: '-password -refreshToken -createdAt -updatedAt -__v'
    })
    .populate({
      path: 'viewedByBrands.BrandID',
      select: '-personalDetails.email -personalDetails.mobileNumber -personalDetails.headOfficeAddress -createdAt -updatedAt -__v'
    })
    .lean(); // Convert to plain JS object for better performance

    if (!viewedData) {
      return res.status(200).json(
        new ApiResponse(200, { investors: [], brands: [] }, "No viewing data found")
      );
    }

    // Process investors data
    const investors = (viewedData.viewedByInvestors || [])
      .filter(item => item?.InvestorID) // Filter out null references
      .sort((a, b) => b.addedAt - a.addedAt) // Direct date comparison
      .map(({ InvestorID }) => InvestorID);

    // Process brands data with deduplication
    const seenBrandIds = new Set();
    const brands = (viewedData.viewedByBrands || [])
      .filter(view => {
        if (!view?.BrandID) return false;
        const brandId = view.BrandID._id.toString();
        return !seenBrandIds.has(brandId) && seenBrandIds.add(brandId);
      })
      .sort((a, b) => b.addedAt - a.addedAt)
      .map(({ BrandID }) => BrandID);

    return res.status(200).json(
      new ApiResponse(200, { investors, brands }, "View data retrieved successfully")
    );

  } catch (error) {
    console.error("getAllViewBrands error:", error);
    return res.status(500).json(
      new ApiResponse(500, {}, "Internal server error")
    );
  }
};