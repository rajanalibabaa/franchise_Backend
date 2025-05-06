import express from "express";
import {
  CreateBrandListing,
  GetBrandListing,
} from "../controller/BrandController/BrandListingController.js";
import {
  verifyOTP,
  requestMobileOtp, // Correctly import requestMobileOtp as a named export
} from "../controller/BrandController/sendOTPController.js";

const router = express.Router();


router.post("/createBrandListing", CreateBrandListing);
router.get("/getBrandListing", GetBrandListing);

export default router;
