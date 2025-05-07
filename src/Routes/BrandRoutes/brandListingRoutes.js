import express from "express";
import { verifyOTP } from "../../controller/BrandController/sendOTPController.js";
import { createBrand, deleteBrand, getAllBrands, getBrandById, updateBrand, updateBrandImage } from "../../controller/BrandController/BrandListingController.js";

const router = express.Router();


// brandRouter.get("/getBrandListing", GetBrandListing);
// brandRouter.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

router.post("/createBrand", createBrand);
router.get("/getAllBrand", getAllBrands);
router.get("/getBrand/:id", getBrandById);
router.patch("/updateBrand/:id", updateBrand)
router.delete("/deleteBrand/:id", deleteBrand);
router.patch("/updateBrandImage/:id", updateBrandImage)

export default router;
