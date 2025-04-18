import express from "express";
import {CreateBrandListing,GetBrandListing} from "../controller/BrandController/BrandListingController.js" ;


import {
    requestEmailOtp,
    verifyEmailOtp,
    requestMobileOtp,
    verifyMobileOtp,
    requestWhatsappOtp,
    verifyWhatsappOtp,
} from "../controller/BrandController/sendOTPController.js";



const router=express.Router();

router.post("/createBrandListing",CreateBrandListing);
router.get("/getBrandListing",GetBrandListing);
router.post("/send-email-otp", requestEmailOtp);
router.post("/send-mobile-otp", requestMobileOtp);
router.post("/send-whatsapp-otp", requestWhatsappOtp);
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/verify-mobile-otp", verifyMobileOtp);
router.post("/verify-whatsapp-otp", verifyWhatsappOtp);

export default router  


router.post("/send-email-otp", requestEmailOtp);
router.post("/verify-email-otp", verifyEmailOtp );

