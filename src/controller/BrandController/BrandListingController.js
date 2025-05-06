import FranchiseBrand from "../../model/Brand/brandListingPage.js";
import {ApiResponse} from "../../utils/ApiResponse/ApiResponse.js";

const createBrand = async (req, res) => {
    const { BrandDetails, ExpansionPlans, FranchiseModal, Documentation , Gallery} = req.body;

    console.log ("Brand data:", BrandDetails); 

    // Validate required fields
    if (!BrandDetails || !ExpansionPlans || !FranchiseModal || !Documentation || !Gallery) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const newBrand = new FranchiseBrand({
            
            BrandDetails,
            ExpansionPlans,
            FranchiseModal,
            Documentation,
            Gallery
        });

        await newBrand.save();
        res.status(201).json(
            new ApiResponse(
                201,
                {},
                "Brand created successfully",
            )
        );
    } catch (error) {
        res.status(500).json({ error: "Failed to create brand", details: error.message });
    }
}

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
    createBrand,
    getAllBrands,
    getBrandById,
    updateBrand,
    deleteBrand,
    updateBrandImage
 };