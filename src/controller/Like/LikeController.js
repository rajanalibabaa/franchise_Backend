
import { InvsRegister } from "../../model/Investor/invsRegister.js";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";

import { FavoriteBrands, FavoriteBrandsLikedBybrand, FavoriteBrandsLikedByInvestor } from "../../model/Investor/favoriteBrandsInvestor.js";





export const toggleFavoriteBrand = async (req, res) => {
  try {
    const { branduuid } = req.body;
    const investor = req?.investorUser;
    const brand = req?.brandUser;

    // console.log("req :",req.body)

    // === If Brand is liking another Brand ===
    if (brand && brand._id) {
      if (!branduuid) {
        return res.status(400).json(new ApiResponse(400, {}, "Brand UUID is required"));
      }

      const likedBrandData = await BrandListing.findOne({ uuid: branduuid });
      if (!likedBrandData) {
        return res.status(404).json(new ApiResponse(404, {}, "Target brand not found"));
      }

      const alreadyLiked = await FavoriteBrandsLikedBybrand.findOne({
        brandUserId: brand._id,
        "favoriteBrandBybrand.likedBrandID": { $in: [likedBrandData._id] }
      });

      if (alreadyLiked) {
        return res.status(400).json(new ApiResponse(400, {}, "Brand already added to favorites"));
      }

      const updatedLikeByBrand = await FavoriteBrandsLikedBybrand.findOneAndUpdate(
        { brandUserId: brand._id },
        {
          $push: {
            favoriteBrandBybrand: {
              likedBrandID: likedBrandData._id,
              addedAt: new Date(),
            },
          },
        },
        { new: true, upsert: true }
      );

      await FavoriteBrands.findOneAndUpdate(
        { brandUserId: likedBrandData._id },
        {
          $push: {
            favoriteBrandByInvestors: {
              investorID: brand._id, // Here used brand as a pseudo-investor
              addedAt: new Date(),
            },
          },
        },
        { new: true, upsert: true }
      );



      return res.status(200).json(
        new ApiResponse(200, updatedLikeByBrand, "Favorite brand added successfully by brand")
      );
    }

    // === If Investor is liking a Brand ===
    if (!investor || !investor._id) {
      return res.status(401).json(new ApiResponse(401, {}, "Please login first to add favorite brand"));
    }

    if (!branduuid) {
      return res.status(400).json(new ApiResponse(400, {}, "Brand UUID is required"));
    }

    const brandData = await BrandListing.findOne({ uuid: branduuid });
    if (!brandData) {
      return res.status(404).json(new ApiResponse(404, {}, "Brand not found"));
    }

    const alreadyFavorited = await FavoriteBrandsLikedByInvestor.findOne({
      InvestorUserId: investor._id,
      "favoriteBrands.brandID": brandData._id,
    });

    if (alreadyFavorited) {
      return res.status(400).json(new ApiResponse(400, {}, "Brand already added to favorites"));
    }

    const updatedInvestorFavorite = await FavoriteBrandsLikedByInvestor.findOneAndUpdate(
      { InvestorUserId: investor._id },
      {
        $push: {
          favoriteBrands: {
            brandID: brandData._id,
            addedAt: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    );

    await FavoriteBrands.findOneAndUpdate(
      { brandUserId: brandData._id },
      {
        $push: {
          favoriteBrandByInvestors: {
            investorID: investor._id,
            addedAt: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    );

    // console.log("updatedInvestorFavorite :",updatedInvestorFavorite)

    return res.status(200).json(
      new ApiResponse(200, updatedInvestorFavorite, "Favorite brand added successfully by investor")
    );
  } catch (error) {
    console.error("toggleFavoriteBrand error:", error);
    return res.status(500).json(new ApiResponse(500, {}, "Internal Server Error"));
  }
};




export const getAllFavoriteBrandsByID = async (req, res) => {
  try {
    const { uuid } = req.params;
    const investor = req.investorUser;
    const brand = req.brandUser;

    if (!uuid) {
      return res.status(400).json(new ApiResponse(400, {}, "UUID is required"));
    }

    // === Investor Request ===
    if (investor && uuid === investor.uuid) {
      const favoriteData = await FavoriteBrandsLikedByInvestor.findOne({
        InvestorUserId: investor._id,
      }).lean();

      if (!favoriteData?.favoriteBrands?.length) {
        return res.json(new ApiResponse(200, [], "You haven't liked any brands yet"));
      }

      // Sort by newest liked first
      const sortedFavorites = favoriteData.favoriteBrands.sort(
        (a, b) => new Date(b.addedAt) - new Date(a.addedAt)
      );

      const brandIDs = sortedFavorites.map(item => item.brandID?.toString()).filter(Boolean);

      if (!brandIDs.length) {
        return res.json(new ApiResponse(200, [], "No valid brand IDs found"));
      }

      const allBrands = await BrandListing.find({ _id: { $in: brandIDs } }).select(
        '-__v -updatedAt -createdAt ' +
        '-personalDetails.email -personalDetails.mobileNumber -personalDetails.headOfficeAddress ' +
        '-personalDetails.expansionLocation.pancardNumber -personalDetails.expansionLocation.gstNumber ' +
        '-brandDetails.pancard -brandDetails.gstCertificate -personalDetails.pancardNumber -personalDetails.gstNumber'
      ).lean();

      // Create a map for faster lookup
      const brandMap = new Map();
      allBrands.forEach(brand => {
        brandMap.set(brand._id.toString(), brand);
      });

      // Reconstruct the array in the original order
      const result = [];
      for (const id of brandIDs) {
        const brand = brandMap.get(id);
        if (brand) {
          result.push(brand);
        }
      }

      return res.json(
        new ApiResponse(200, result, "Favorite brands retrieved successfully")
      );
    }

    // === Brand Request ===
    if (brand && uuid === brand.uuid) {
      const favoriteData = await FavoriteBrandsLikedBybrand.findOne({
        brandUserId: brand._id,
      }).lean();

      if (!favoriteData?.favoriteBrandBybrand?.length) {
        return res.json(new ApiResponse(200, [], "You haven't liked any brands yet"));
      }

      // Sort by newest liked first
      const sortedFavorites = favoriteData.favoriteBrandBybrand.sort(
        (a, b) => new Date(b.addedAt) - new Date(a.addedAt)
      );

      const likedBrandIDs = sortedFavorites.map(item => item.likedBrandID?.toString()).filter(Boolean);

      if (!likedBrandIDs.length) {
        return res.json(new ApiResponse(200, [], "No valid brand IDs found"));
      }

      const allBrands = await BrandListing.find({ _id: { $in: likedBrandIDs } }).select(
        '-__v -updatedAt -createdAt ' +
        '-personalDetails.email -personalDetails.mobileNumber -personalDetails.headOfficeAddress ' +
        '-personalDetails.expansionLocation.pancardNumber -personalDetails.expansionLocation.gstNumber ' +
        '-brandDetails.pancard -brandDetails.gstCertificate -personalDetails.pancardNumber -personalDetails.gstNumber'
      ).lean();

      // Create a map for faster lookup
      const brandMap = new Map();
      allBrands.forEach(brand => {
        brandMap.set(brand._id.toString(), brand);
      });

      // Reconstruct the array in the original order
      const result = [];
      for (const id of likedBrandIDs) {
        const brand = brandMap.get(id);
        if (brand) {
          result.push(brand);
        }
      }

      return res.json(
        new ApiResponse(200, result, "Favorite brands retrieved successfully")
      );
    }

    return res.status(403).json(new ApiResponse(403, {}, "Unauthorized access"));
  } catch (error) {
    console.error("getAllFavoriteBrandsByID error:", error);
    return res.status(500).json(new ApiResponse(500, {}, "Internal Server Error"));
  }
};




export const deleteFavoriteBrand = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { brandID } = req.body;
    const investor = req.investorUser;
    const brand = req.brandUser;

    console.log("body :",brandID)

    if (!uuid || !brandID) {
      return res.status(400).json(new ApiResponse(400, {}, "UUID and brandID are required"));
    }

    const targetBrand = await BrandListing.findOne({ uuid: brandID });
    if (!targetBrand) {
      return res.status(404).json(new ApiResponse(404, {}, "Target brand not found"));
    }

    // === Investor removing a favorite brand ===
    if (investor && uuid === investor.uuid) {
      const removedFavorite = await FavoriteBrandsLikedByInvestor.findOneAndUpdate(
        { InvestorUserId: investor._id },
        { $pull: { favoriteBrands: { brandID: targetBrand._id } } },
        { new: true }
      );

      await FavoriteBrands.findOneAndUpdate(
        { brandUserId: targetBrand._id },
        { $pull: { favoriteBrandByInvestors: { investorID: investor._id } } },
        { new: true }
      );

      return res.status(200).json(
        new ApiResponse(200, removedFavorite, "Brand removed from investor's favorites")
      );
    }

    // === Brand removing a favorite brand ===
    if (brand && uuid === brand.uuid) {
      const removedFavorite = await FavoriteBrandsLikedBybrand.findOneAndUpdate(
        { brandUserId: brand._id },
        { $pull: { favoriteBrandBybrand: { likedBrandID: targetBrand._id } } },
        { new: true }
      );

      // Optionally also remove brand from the liked brand’s list of likers
      await FavoriteBrands.findOneAndUpdate(
        { brandUserId: targetBrand._id },
        { $pull: { favoriteBrandByInvestors: { investorID: brand._id } } }, // treating brand like investor
        { new: true }
      );

      return res.status(200).json(
        new ApiResponse(200, removedFavorite, "Brand removed from brand's favorites")
      );
    }

    return res.status(403).json(new ApiResponse(403, {}, "Unauthorized access"));
  } catch (error) {
    console.error("deleteFavoriteBrand error:", error);
    return res.status(500).json(new ApiResponse(500, {}, "Internal Server Error"));
  }
};



export const getAllLikedAndUnlikedBrand = async (req, res) => {
  try {
    const { uuid } = req.params;
    const investor = req.investorUser;
    const brand = req.brandUser;

    
    if (( uuid !== investor?.uuid) && ( uuid !== brand?.uuid)) {
      return res.status(401).json(new ApiResponse(401, {}, "Unauthorized access"));
    }

    let likedBrandIds = [];

    // === Investor case ===
    if (investor) {
      const existsInvestor = await InvsRegister.findOne({ uuid: investor.uuid });
      if (!existsInvestor) {
        return res.status(404).json(new ApiResponse(404, {}, "Investor not found"));
      }

      const investorLikedBrands = await FavoriteBrandsLikedByInvestor.findOne({
        InvestorUserId: existsInvestor._id
      });

      likedBrandIds = investorLikedBrands
        ? investorLikedBrands.favoriteBrands.map(item => item.brandID.toString())
        : [];
    }

    // === Brand case ===
    if (brand) {
      const existsBrand = await BrandListing.findOne({ uuid: brand.uuid });
      if (!existsBrand) {
        return res.status(404).json(new ApiResponse(404, {}, "Brand not found"));
      }

      const brandLikedBrands = await FavoriteBrandsLikedBybrand.findOne({
        brandUserId: existsBrand._id
      });

      likedBrandIds = brandLikedBrands
        ? brandLikedBrands.favoriteBrandBybrand.map(item => item.likedBrandID.toString())
        : [];
    }

    // Get all brands
    const allBrands = await BrandListing.find({});
    if (!allBrands || allBrands.length === 0) {
      return res.status(404).json(new ApiResponse(404, {}, "Brands not registered yet"));
    }

    // Compose result with isLiked flag
    const result = allBrands.map(brand => {
      const { _id, updatedAt, createdAt, __v, ...rest } = brand.toObject();
      return {
        ...rest,
        isLiked: likedBrandIds.includes(_id.toString())
      };
    });

    return res.status(200).json(new ApiResponse(200, result, "All brands with liked status"));
  } catch (error) {
    console.error("getAllLikedAndUnlikedBrand error:", error);
    return res.status(500).json(new ApiResponse(500, {}, "Internal Server Error"));
  }
};


export const getBrandLikedByAll = async (req, res) => {
  try {
    const { uuid } = req.params;
    const brand = req.brandUser;

    // console.log("Requesting Likes for Brand UUID:", uuid);

    if (!brand || uuid !== brand.uuid) {
      return res.status(401).json(new ApiResponse(401, {}, "Unauthorized request"));
    }

    const allLiked = await FavoriteBrands.findOne({ brandUserId: brand._id });
    // console.log("All Liked Data:", allLiked);

   
    if (!allLiked || !Array.isArray(allLiked.favoriteBrandByInvestors) || allLiked.favoriteBrandByInvestors.length === 0) {
      return res.status(404).json(new ApiResponse(404, [], "No users have liked this brand yet."));
    }

    const data = [];

    for (const likeEntry of allLiked.favoriteBrandByInvestors) {
      const investorId = likeEntry?.investorID;

      if (investorId) {
        const investor = await InvsRegister.findById(investorId).select("-_id -createdAt -updatedAt -__v") ||
                         await BrandListing.findById(investorId).select("-_id -createdAt -updatedAt -__v");

        if (investor) {
          data.push(investor);
        }
      }
    }

    const updatedLike = data.reverse()

    return res.status(200).json(new ApiResponse(200, updatedLike, "Brand liked by users retrieved successfully."));
  } catch (error) {
    console.error("Error fetching liked users for brand:", error);
    return res.status(500).json(new ApiResponse(500, {}, "Internal Server Error"));
  }
};


