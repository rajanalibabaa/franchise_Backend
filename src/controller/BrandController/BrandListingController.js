import BrandListingPage from "../../model/Brand/brandListingPage.js";
import { brandListingSchema } from "../../Validation/BrandListing/BrandListing.js";

export const CreateBrandListing = async (req, res) => {
    try {
        const { error } = brandListingSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const brandListing = new BrandListingPage(req.body);
        await brandListing.save();
        res.status(201).json({ message: "Brand listing created successfully", brandListing });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const GetBrandListing = async (req, res) => {
    try {
        const brandListing = await BrandListingPage.find();
        res.status(200).json({ message: "Brand listing fetched successfully", brandListing });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}