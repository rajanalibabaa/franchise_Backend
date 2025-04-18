import express from "express";
import {CreateBrandListing,GetBrandListing} from "../controller/BrandController/BrandListingController.js" ;
<<<<<<< HEAD
import { requestEmailOtp, verifyEmailOtp } from "../controller/BrandController/sentOtpEmailController.js";

=======
<<<<<<< HEAD
import {
    requestEmailOtp,
    verifyEmailOtp,
    requestMobileOtp,
    verifyMobileOtp,
    requestWhatsappOtp,
    verifyWhatsappOtp,
} from "../controller/BrandController/sendOTPController.js";
=======
import { requestEmailOtp, verifyEmailOtp } from "../controller/BrandController/sentOtpEmailController.js";

>>>>>>> 984cedd3c91169da5c9b7da3a7fa5ba77a974b75
>>>>>>> 3e7954f980a44a0ff8e0734c11b5fc05bd36c29d


const router=express.Router();

router.post("/createBrandListing",CreateBrandListing);
router.get("/getBrandListing",GetBrandListing);
<<<<<<< HEAD
=======
<<<<<<< HEAD
router.post("/send-email-otp", requestEmailOtp);
router.post("/send-mobile-otp", requestMobileOtp);
router.post("/send-whatsapp-otp", requestWhatsappOtp);
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/verify-mobile-otp", verifyMobileOtp);
router.post("/verify-whatsapp-otp", verifyWhatsappOtp);

export default router  
=======
>>>>>>> 3e7954f980a44a0ff8e0734c11b5fc05bd36c29d


router.post("/send-email-otp", requestEmailOtp);
router.post("/verify-email-otp", verifyEmailOtp );

<<<<<<< HEAD
export default router
=======
export default router
>>>>>>> 984cedd3c91169da5c9b7da3a7fa5ba77a974b75
>>>>>>> 3e7954f980a44a0ff8e0734c11b5fc05bd36c29d
