import express from "express";
import upload from "../../utils/Uploads/multerConfig.js";
import { createBrandListing,deleteBrandListingByUUID,getAllBrands,getBrandListingByUUID,updateBrandListingByUUID} from "../../controller/BrandController/BrandListingController.js"
import { verifyJWT } from "../../Middleware/Authentication/authMiddleware.js";
// import instaApplyBrnadFormController from "../../controller/BrandController/instaApplyBrnadFormController.js";

const router = express.Router();

 
 
router.post(
    "/createBrandListing",
upload.fields([
  { name: "brandLogo", maxCount: 10 },
  { name: "gstCertificate", maxCount: 10 },
  { name: "pancard", maxCount: 10 },
  { name: "exteriorOutlet", maxCount: 10 },
  { name: "interiorOutlet", maxCount: 10 },
  { name: "franchisePromotionVideo", maxCount: 10 },
  { name: "awardDoc", maxCount: 10 },
  { name: "businessPlan", maxCount: 10 }
])

,
      createBrandListing
    )
router.get("/getAllBrandListing", getAllBrands);
router.get("/getBrandListingByUUID/:id",verifyJWT,getBrandListingByUUID);
router.patch("/updateBrandListingByUUID/:id", updateBrandListingByUUID)
router.delete("/deleteBrandListingByUUID/:uuid", deleteBrandListingByUUID);

//brand Apply form for franchise ROutes

// router.post('/createInstaApply',instaApplyBrnadFormController)

export default router;

