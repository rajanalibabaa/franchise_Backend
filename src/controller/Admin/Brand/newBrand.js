import { log } from "console";
import { BrandDetails } from "../../../model/Brand/Brand.model/BrandDetails.model.js";
import { BrandExpansionLocationData } from "../../../model/Brand/Brand.model/ExpansionLocation.model.js";
import { BrandFranchiseDetails } from "../../../model/Brand/Brand.model/FranchiseDetails.model.js";
import { BrandUploads } from "../../../model/Brand/Brand.model/Uploads.model.js";
import NewIncomingBrands from "../../../model/Brand/newIncomigBrands.js";
import { ApiResponse } from "../../../utils/ApiResponse/ApiResponse.js";


export const getNewIncomingBrands = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;
    const id = req.query.id || null;
    // const NewIncomingBrands = mongoose.model("NewIncomingBrands");
    const brands = await NewIncomingBrands.aggregate([
        { $limit: limit },
        { $skip: skip },
        { $project: { 
            _id: 0,
            uuid: 1,
            brandID: 1,
            brandName: "$brandDetails.brandName",
            fullName: "$brandDetails.fullName",
            brandCategories: "$franchiseDetails.brandCategories",
            investmentRange:{ $cond: { if: { $gt: [ { $size: "$franchiseDetails.fico.investmentRange" }, 0 ] }, then: { $arrayElemAt: [ "$franchiseDetails.fico.investmentRange", 0 ] }, else: null } }, 
            // logo: {$arrayElemAt : ["$uploads.brandLogo"]}, 
            logo: { $cond: { if: { $gt: [ { $size: "$uploads.brandLogo" }, 0 ] }, then: { $arrayElemAt: [ "$uploads.brandLogo", 0 ] }, else: null } }, 
            seen: 1, 
            createdAt: 1
        } }
    ])
    
    if (brands.length === 0) {
      return res.json(
        new ApiResponse(304,null , "No new incoming brands found")
      )
    }

    const totalBrands = await NewIncomingBrands.countDocuments();
    const unSeenBrandsCount = await NewIncomingBrands.find({seen: false}).countDocuments();
    const totalPages = Math.ceil(totalBrands / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;


    return res.json(
      new ApiResponse(200, 
        {
            brands,
            currentPage: page,
            totalPages,
            totalBrands,
            hasNext,
            hasPrevious,
            unSeenBrandsCount
        }, "New incoming brands fetched successfully")
    )
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const getNewIncomingBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await NewIncomingBrands.findOne({uuid: id});
    if (!brand) {
      return res.json(
        new ApiResponse(304,null , "No brand found with the given ID")
      )
    }
    return res.json(
      new ApiResponse(200, brand, "Brand fetched successfully")
    )
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const brandApprove = async (req, res) => {
    try {
        const { id } = req.params;

        const brand = await NewIncomingBrands.findOne({uuid: id});
        if (!brand) {
            return res.json(
                new ApiResponse(404, null, "Brand not found")
            )
        }

        const existingBrand = await BrandDetails.findOne({ brandID: brand.brandID });

        if (existingBrand) {
            return res.json(
                new ApiResponse(409, null, "Brand with this brandID already exists")
            )
        }

         const [newBrand, newBrandFranchiseDetails, newBrandExpansionLocationData, newBrandUploads] = await Promise.all([
              BrandDetails.create({
                brandID : brand.brandID,
                uuid: brand.uuid,
                brandDetails : brand.brandDetails
              }),
              BrandFranchiseDetails.create({
                brandOwnerId: brand.uuid,
                franchiseDetails : brand.franchiseDetails
              }),
              BrandExpansionLocationData.create({
                brandOwnerId: brand.uuid,
                expansionLocationData : brand.expansionLocationData
              }),
              BrandUploads.create({
                brandOwnerId: brand.uuid,
                uploads : brand.uploads
              })
            ]);
        
            // Check if all records were created successfully
            if (!newBrand || !newBrandFranchiseDetails || !newBrandExpansionLocationData || !newBrandUploads) {
              return res.json(
                new ApiResponse(500, {}, "Failed to create one or more brand records")
              );
            }

            if (newBrand && newBrandFranchiseDetails && newBrandExpansionLocationData && newBrandUploads) {

                const deleted = await NewIncomingBrands.deleteOne({ uuid: id });
                console.log("Deleted count:", deleted);
                if (deleted.deletedCount === 0) {
                  return res.json(
                    new ApiResponse(500, {}, "Failed to delete the brand from incoming brands")
                  );
                }

            }
        
            return res.json(
              new ApiResponse(201, {
                brand: newBrand,
                franchise: newBrandFranchiseDetails,
                locations: newBrandExpansionLocationData,
                uploads: newBrandUploads
              }, "Brand listing created successfully")
            );

    } catch (error) {
        return res.json(
            new ApiResponse(500, null, "Internal Server Error")
        )
    }
}

export const deleteBrandById = async (req, res) => {
    try {
        const { id } = req.params;

        const [newBrand, newBrandFranchiseDetails, newBrandExpansionLocationData, newBrandUploads] = await Promise.all([
              BrandDetails.findOneAndDelete({
                uuid: id,
              }),
              BrandFranchiseDetails.findOneAndDelete({
                brandOwnerId: id
              }),
              BrandExpansionLocationData.findOneAndDelete({
                brandOwnerId: id
              }),
              BrandUploads.findOneAndDelete({
                brandOwnerId: id
              })
            ]);

        if (!newBrand && !newBrandFranchiseDetails && !newBrandExpansionLocationData && !newBrandUploads) {
            return res.json(
                new ApiResponse(404, null, "No brand found with the given ID")
            )
        }

        
        return res.json(
            new ApiResponse(200, {
                brand: newBrand,
                franchise: newBrandFranchiseDetails,
                locations: newBrandExpansionLocationData,
                uploads: newBrandUploads
              }, "Brand listing deleted successfully")
        )

    } catch (error) {
        return res.json(
            new ApiResponse(500, null, "Internal Server Error")
        )
    }
}