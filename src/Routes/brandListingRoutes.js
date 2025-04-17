import express from "express";
import {CreateBrandListing,GetBrandListing} from "../controller/BrandController/BrandListingController.js" ;
import { requestEmailOtp, verifyEmailOtp } from "../controller/BrandController/sentOtpEmailController.js";



const router=express.Router();

router.post("/createBrandListing",CreateBrandListing);
router.get("/getBrandListing",GetBrandListing);


router.post("/send-email-otp", requestEmailOtp);
router.post("/verify-email-otp", verifyEmailOtp );

export default router