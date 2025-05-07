import express from "express";
import { verifyOTP } from "../../controller/BrandController/sendOTPController.js";
import { createBrand, deleteBrand, getAllBrands, getBrandById, updateBrand, updateBrandImage } from "../../controller/BrandController/BrandListingController.js";

const brandRouter = express.Router();


// brandRouter.get("/getBrandListing", GetBrandListing);
// brandRouter.post("/send-otp", sendOTP);
brandRouter.post("/verify-otp", verifyOTP);

brandRouter.post("/createBrand", createBrand);
brandRouter.get("/getAllBrand", getAllBrands);
brandRouter.get("/getBrand/:id", getBrandById);
brandRouter.patch("/updateBrand/:id", updateBrand)
brandRouter.delete("/deleteBrand/:id", deleteBrand);
brandRouter.patch("/updateBrandImage/:id", updateBrandImage)

export { brandRouter };
