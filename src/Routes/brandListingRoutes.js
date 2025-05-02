import express from "express";
import {CreateBrandListing,GetBrandListing} from "../controller/BrandController/BrandListingController.js" ;
import {verifyOTP} from "../controller/BrandController/sendOTPController.js"
const router=express.Router();

router.post("/createBrandListing",CreateBrandListing);
router.get("/getBrandListing",GetBrandListing);
// router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);


export default router  




