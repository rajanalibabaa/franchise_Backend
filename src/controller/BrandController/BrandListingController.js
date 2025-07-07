import mongoose from "mongoose";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import {
  generateSignedUrl,
  uploadFileToR2,
  uploadFileToS3,
} from "../../utils/Uploads/s3Uploader.js";
import { InvsRegister } from "../../model/Investor/invsRegister.js";
import generateCustomId from "../../helpers/brandIdGenerater.js";




const createBrandListing = async (req, res) => {
  try {
    const fileFields = [
      "awardDoc",
      "brandLogo",
      "pancard",
      "businessPlan",
      "exteriorOutlet",
      "franchisePromotionVideo",
      "brandPromotionVideo",
      "gstCertificate",
      "interiorOutlet"
    ];
console.log("Available awardDoc files:", req.files?.awardDoc?.length || 0);
    // Parse incoming JSON strings safely
    // const brandDetails = req.body.brandDetails
    // const franchiseDetails = req.body.franchiseDetails 
    // const expansionLocationData = req.body.expansionLocationData 
    const brandDetails = JSON.parse(req.body.brandDetails || "{}");
    const franchiseDetails = JSON.parse(req.body.franchiseDetails || "{}");
    const expansionLocationData = JSON.parse(req.body.expansionLocationData || "{}");

    // ✅ Parse awardText safely as array
    let awardDis = [];



    if (Array.isArray(brandDetails.awardText)) {
      awardDis = brandDetails.awardText;
    } else if (typeof brandDetails.awardText === "string") {
      try {
        awardDis = JSON.parse(brandDetails.awardText);
      } catch (e) {
        console.warn("Invalid awardText JSON:", e);
        awardDis = [];
      }
    }

    // Generate brand ID using groupId if provided
    const group = franchiseDetails?.brandCategories?.groupId || null;
    const customId = await generateCustomId(group);


   

    // Upload files to R2
    const uploadedFiles = {};
    for (const field of fileFields) {
      const files = req.files?.[field];
      console.log("files :",field)
      if (!field) {
         console.log("field not found :",field)
         return
      }
      if (files?.length > 0) {
        const isVideo = field.toLowerCase().includes("video");
        const urls = await Promise.all(
          files.map((file) => {
            const contentType = isVideo ? "video/mp4" : file.mimetype;
            return uploadFileToR2(file.path, contentType);
          })
        );
        uploadedFiles[field] = urls;
      }
    }

    // ✅ Build structured awards array
    const awardDocs = uploadedFiles.awardDoc || [];
    const awards = awardDocs.map((fileUrl, index) => ({
      awardDescription: awardDis[index] || "",
      awardImage: fileUrl
    }));

    // Create the brand listing document
    const newBrand = await BrandListing.create({
      brandID: customId,
      brandDetails,
      franchiseDetails,
      expansionLocationData,
      uploads: {
        brandLogo: uploadedFiles.brandLogo || [],
        gstCertificate: uploadedFiles.gstCertificate || [],
        pancard: uploadedFiles.pancard || [],
        exteriorOutlet: uploadedFiles.exteriorOutlet || [],
        interiorOutlet: uploadedFiles.interiorOutlet || [],
        franchisePromotionVideo: uploadedFiles.franchisePromotionVideo || [],
        brandPromotionVideo: uploadedFiles.brandPromotionVideo || [],
        businessPlan: uploadedFiles.businessPlan || [],
        awards: awards
      }
    });

    if (!newBrand) {
      return res.status(400).json({
        success: false,
        message: "Failed to create brand listing in the database"
      });
    }

    return res.json(
      new ApiResponse(
        200,
      newBrand,
       "Brand listing created successfully",
      
      )
    );

  } catch (error) {
    console.error("❌ Brand Creation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create brand listing",
      error: error.message
    });
  }
};




const getAllBrands = async (req, res) => {
  try {
    const brands = await BrandListing.find().select(
      " -brandDetails?.brandPromotionVideo"
    );

    brands.forEach((brand) => {
      console.log("brand videos :", {
        franchisePromotionVideo: brand.brandDetails?.franchisePromotionVideo,
        brandPromotionVideo: brand.brandDetails?.brandPromotionVideo,
      });
    });
    return res
      .status(200)
      .json(new ApiResponse(200, brands, "✅ Brands fetched successfully"));
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch brands", details: error.message });
  }
};

// const getBrandListingByUUID = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const brandData = req.brandUser;

//     if (id !== brandData?.uuid) {
//       return res.status(403).json(
//         new ApiResponse(403, null, "Unauthorized request")
//       );
//     }

//     const brand = await BrandListing.findOne({ uuid: brandData.uuid })
//       .select("-_id -createdAt -updatedAt -__v");

//     if (!brand) {
//       return res.status(404).json(
//         new ApiResponse(404, null, "Brand not found")
//       );
//     }

//     return res.status(200).json(
//       new ApiResponse(200, brand, "✅ Brand fetched successfully")
//     );

//   } catch (error) {
//     console.error("getBrandListingByUUID error:", error);
//     return res.status(500).json(
//       new ApiResponse(500, null, "Failed to fetch brand")
//     );
//   }
// };

const getBrandListingByUUID = async (req, res) => {
  try {
    const { id: uuid } = req.params;
    // const brandData = req.brandUser;

    // if (uuid !== brandData?.uuid) {
    //   return res
    //     .status(403)
    //     .json(new ApiResponse(403, null, "Unauthorized request"));
    // }

    let brand = await BrandListing.findOne({ uuid }).select(
      "-_id -createdAt -updatedAt -__v"
    );

    if (!brand) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Brand not found"));
    }

    const mediaFields = [
      "pancard",
      "gstCertificate",
      "brandLogo",
      "interiorOutlet",
      "franchisePromotionVideo",
      "brandPromotionVideo",
      "exteriorOutlet",
    ];

    brand = brand.toObject();

    for (const field of mediaFields) {
      if (Array.isArray(brand[field])) {
        brand[field] = await Promise.all(
          brand[field].map(async (key) => {
            if (!key) return null;
            try {
              return await generateSignedUrl(key);
            } catch {
              return null;
            }
          })
        );
        brand[field] = brand[field].filter(Boolean);
      }
    }

    return res
      .status(200)
      .json(new ApiResponse(200, brand, "✅ Brand fetched successfully"));
  } catch (error) {
    console.error("getBrandListingByUUID error:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to fetch brand"));
  }
};

const updateBrandListingByUUID = async (req, res) => {
  try {
    const { id } = req.params;
    const personalDetails = JSON.parse(req.body.personalDetails || "{}");
    const franchiseDetails = JSON.parse(req.body.franchiseDetails || "{}");
    const brandDetails = JSON.parse(req.body.brandDetails || "{}");

    // Upload new images if provided
    const uploadedFiles = {};
    for (const field of singleFileFields) {
      const files = req.files?.[field];
      if (files && files.length > 0) {
        const urls = await Promise.all(
          files.map((file) => uploadFileToS3(file.path, file.mimetype))
        );
        uploadedFiles[field] = urls.length === 1 ? urls[0] : urls;
      }
    }

    const updatedBrand = await BrandListing.findByIdAndUpdate(
      id,
      {
        personalDetails,
        franchiseDetails,
        brandDetails: {
          ...brandDetails,
          ...uploadedFiles,
        },
      },
      { new: true }
    );

    if (!updatedBrand)
      return res.status(404).json({ error: "Brand not found" });

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedBrand, "✅ Brand updated successfully")
      );
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to update brand", details: error.message });
  }
};

const deleteBrandListingByUUID = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BrandListing.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Brand not found" });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "✅ Brand deleted successfully"));
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to delete brand", details: error.message });
  }
};

export {
  createBrandListing,
  getAllBrands,
  getBrandListingByUUID,
  updateBrandListingByUUID,
  deleteBrandListingByUUID,
};