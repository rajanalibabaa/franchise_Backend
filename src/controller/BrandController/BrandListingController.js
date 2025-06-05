import mongoose from "mongoose";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import { uploadFileToS3 } from "../../utils/Uploads/s3Uploader.js";
import { InvsRegister } from "../../model/Investor/invsRegister.js";

// Fields expected as file uploads (keyed by req.files)
const singleFileFields = [
  "brandLogo",
  "gstCertificate",
  "pancard",
  "companyImage",
  "exterioroutlet",
  "interiorOutlet",
  "franchisePromotionVideo",
  "brandPromotionVideo",
];

const createBrandListing = async (req, res) => {
  try {
    if (!req.body.personalDetails || !req.body.franchiseDetails) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const personalDetails = JSON.parse(req.body.personalDetails || '{}');
    const franchiseDetails = JSON.parse(req.body.franchiseDetails || '{}');
    const brandDetails = req.body.brandDetails ? JSON.parse(req.body.brandDetails || '{}') : {};


    const existingBrand = await BrandListing.findOne({
      "personalDetails.email": personalDetails.email,
    });
    if (existingBrand) {
      return res.status(409).json({
        success: false,
        message: "Brand with this email already exists",
      });
    }
    const exists = await InvsRegister.find({email :personalDetails.email})
    if (!exists) {
      return res.json(new ApiResponse(403,null,"Email already exists"))
    }

    // Upload files to S3 and store URLs
    const uploadedFiles = {};
    for (const field of singleFileFields) {
      const files = req.files?.[field];

      if (files && files.length > 0) {
        const isVideoField = field.includes("Video");
        const contentType = isVideoField ? "video/mp4" : undefined;

        const urls = await Promise.all(
          files.map((file) => uploadFileToS3(file.path, file.mimetype))
        );

        uploadedFiles[field] = urls; // Store single or array
      }
    }

    console.log("✅ Uploaded File URLs:", uploadedFiles);
    // Construct brand data for MongoDB
    const newBrand = await BrandListing.create({
      personalDetails: {
        ...personalDetails,
      },
      franchiseDetails: {
        ...franchiseDetails,
      },
      brandDetails: {
        ...brandDetails,
        pancard: uploadedFiles.pancard || [],
        gstCertificate: uploadedFiles.gstCertificate || [],
        brandLogo: uploadedFiles.brandLogo || [],
        exterioroutlet: uploadedFiles.exterioroutlet || [],
        interiorOutlet: uploadedFiles.interiorOutlet || [],
        franchisePromotionVideo: uploadedFiles.franchisePromotionVideo || [],
        brandPromotionVideo: uploadedFiles.brandPromotionVideo || [],
      },
      // brandOwnerUUID: req.brandUser?.uuid || null,
    });
    await newBrand.save();


    if (!newBrand) {
      return res
        .status(500)
        .JSON({ success: false, message: "Failed to create brand listing" });
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, newBrand, "✅ Brand listing created successfully")
      );
  } catch (error) {
    console.error("❌ createBrandListing error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to create brand listing",
        error: error.message,
      });
  }
};

const getAllBrands = async (req, res) => {
  try {
    const brands = await BrandListing.find();

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

const getBrandListingByUUID = async (req, res) => {
  try {
    const { id } = req.params;
    const brandData = req.brandUser;

    if (id !== brandData?.uuid) {
      return res.status(403).json(
        new ApiResponse(403, null, "Unauthorized request")
      );
    }

    const brand = await BrandListing.findOne({ uuid: brandData.uuid })
      .select("-_id -createdAt -updatedAt -__v");

    if (!brand) {
      return res.status(404).json(
        new ApiResponse(404, null, "Brand not found")
      );
    }

    return res.status(200).json(
      new ApiResponse(200, brand, "✅ Brand fetched successfully")
    );

  } catch (error) {
    console.error("getBrandListingByUUID error:", error);
    return res.status(500).json(
      new ApiResponse(500, null, "Failed to fetch brand")
    );
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
