import express from "express";
import { verifyOTP } from "../../controller/otpController/sendOTPController.js";
import { createBrandListing, deleteBrand, getAllBrands, getBrandById, updateBrand, updateBrandImage } from "../../controller/BrandController/BrandListingController.js";
import upload from "../../utils/Uploads/multerConfig.js";

const router = express.Router();


// brandRouter.get("/getBrandListing", GetBrandListing);
// brandRouter.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

router.post(
    "/createBrandListing",
    upload.fields([
        { name: 'Gallery', maxCount: 1000 },
        { name: 'brandLogo', maxCount: 1 },
        { name: 'businessRegistration', maxCount: 1 },
        { name: 'gstCertificate', maxCount: 1 },
        { name: 'franchiseAgreement', maxCount: 1 },
        { name: 'menuCatalog', maxCount: 1 },
        { name: 'interiorPhotos', maxCount: 1 },
        { name: 'fssaiLicense', maxCount: 1 },
        { name: 'panCard', maxCount: 1 },
        { name: 'aadhaarCard', maxCount: 1 },
      ]),
      createBrandListing
    )
router.get("/getAllBrand", getAllBrands);
router.get("/getBrand/:id", getBrandById);
router.patch("/updateBrand/:id", updateBrand)
router.delete("/deleteBrand/:id", deleteBrand);
router.patch("/updateBrandImage/:id", updateBrandImage)

export default router;
