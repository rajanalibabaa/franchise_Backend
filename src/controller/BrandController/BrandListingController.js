import FranchiseBrand from "../../model/Brand/brandListingPage.js";
import {ApiResponse} from "../../utils/ApiResponse/ApiResponse.js";
import { uploadFileToS3 } from "../../utils/Uploads/s3Uploader.js";

const createBrandListing = async (req, res) => {
    try {
      console.log("================");
  
      // Extract form fields from req.body
    //   const { BrandDetails, ExpansionPlans, FranchiseModal, Documentation } = req.body;
  
    //   // Parse JSON strings if sent via multipart/form-data
    //   const parsedBrandDetails = typeof BrandDetails === 'string' ? JSON.parse(BrandDetails) : BrandDetails;
    //   const parsedExpansionPlans = typeof ExpansionPlans === 'string' ? JSON.parse(ExpansionPlans) : ExpansionPlans;
    //   const parsedFranchiseModal = typeof FranchiseModal === 'string' ? JSON.parse(FranchiseModal) : FranchiseModal;
    //   const parsedDocumentation = typeof Documentation === 'string' ? JSON.parse(Documentation) : Documentation;
  
      // Validate required fields
    //   if (!parsedBrandDetails || !parsedExpansionPlans || !parsedFranchiseModal || !parsedDocumentation) {
    //     return res.status(400).json(
    //       new ApiResponse(400, null, "All required fields must be provided")
    //     );
    //   }
  
      // Extract media file paths (assuming req.files is populated via multer)
      const mediaFiles = req.files?.Gallery?.map(file => file.path) || [];
      console.log("Uploaded media files:", mediaFiles);
  
      const uploadedS3Urls = [];

    for (const filePath of mediaFiles) {
    const url = await uploadFileToS3(filePath);
    uploadedS3Urls.push(url);
    }

    console.log(uploadedS3Urls)
      const newBrand = new FranchiseBrand({
    //     // BrandDetails: parsedBrandDetails,
    //     // ExpansionPlans: parsedExpansionPlans,
    //     // FranchiseModal: parsedFranchiseModal,
    //     // Documentation: parsedDocumentation,
        Gallery: {
            mediaFiles: uploadedS3Urls
        }
      });
  
      await newBrand.save();
  
      return res.status(201).json(
        new ApiResponse(201, newBrand, "Brand created successfully")
      );
  
    } catch (error) {
      console.error("Error creating brand:", error);
      return res.status(500).json({
        error: "Failed to create brand",
        details: error.message
      });
    }
  };
  

const getAllBrands = async (req, res) => {
    try {
        const brands = await FranchiseBrand.find({});
        res.status(200).json(
            new ApiResponse(
                200,
                brands,
                "Brands fetched successfully",
            )
        );
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch brands", details: error.message });
    }
}

const getBrandById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const brand = await FranchiseBrand.findById(id);
        if (!brand) {
            return res.status(404).json({ error: "Brand not found" });
        }
        res.status(200).json(
            new ApiResponse(
                200,
                brand,
                "Brand fetched successfully",
            )
        );
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch brand", details: error.message });
    }
}

const updateBrand = async (req, res) => {
    const { id } = req.params;
    const { BrandDetails, ExpansionPlans, FranchiseModal, Documentation  } = req.body;
    console.log ("Brand data:", BrandDetails);

    try {
        const updatedBrand = await FranchiseBrand.findByIdAndUpdate(id, {
            
            BrandDetails : {
                ...BrandDetails,
            },
            ExpansionPlans : {
                ...ExpansionPlans,
            },
            FranchiseModal : {
                ...FranchiseModal,
            },
            Documentation : {
                ...Documentation,
            },
        }, { new: true });

        if (!updatedBrand) {
            return res.status(404).json({ error: "Brand not found" });
        }

        res.status(200).json(
            new ApiResponse(
                200,
                updatedBrand,
                "Brand updated successfully",
            )
        );
    } catch (error) {
        res.status(500).json({ error: "Failed to update brand", details: error.message });
    }
}

const updateBrandImage = async (req, res) => {
    const { id } = req.params;
    console.log("Image URL:", id);
}
const deleteBrand = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedBrand = await FranchiseBrand.findByIdAndDelete(id);

        if (!deletedBrand) {
            return res.status(404).json({ error: "Brand not found" });
        }

        res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Brand deleted successfully",
            )
        );
    } catch (error) {
        res.status(500).json({ error: "Failed to delete brand", details: error.message });
    }
}


export { 
    createBrandListing,
    getAllBrands,
    getBrandById,
    updateBrand,
    deleteBrand,
    updateBrandImage
 };