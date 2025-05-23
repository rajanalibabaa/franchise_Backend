import express from "express";
import upload from "../../utils/Uploads/multerConfig.js";
import { createBrandListing,deleteBrandListingByUUID,getAllBrands,getBrandListingByUUID,updateBrandListingByUUID} from "../../controller/BrandController/BrandListingController.js"
import { verifyJWT } from "../../Middleware/Authentication/authMiddleware.js";
import instaApplyBrnadFormController from "../../controller/BrandController/instaApplyBrnadFormController.js";

const router = express.Router();

 
 
router.post(
    "/createBrandListing",
upload.fields([
  { name: 'pancard', maxCount: 1 },
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'brandLogo', maxCount: 1 },
  // { name: 'companyImage', maxCount: 10 },
  { name: 'exteriorOutlet', maxCount: 10 },
  { name: 'interiorOutlet', maxCount: 10},
  { name: 'franchisePromotionVideo' , maxCount: 2},
  { name: 'brandPromotionVideo', maxCount: 2 },
])

,
      createBrandListing
    )
router.get("/getAllBrandListing", getAllBrands);
router.get("/getBrandListingByUUID/:uuid",getBrandListingByUUID);
router.patch("/updateBrandListingByUUID/:uuid", updateBrandListingByUUID)
router.delete("/deleteBrandListingByUUID/:uuid", deleteBrandListingByUUID);

//brand Apply form for franchise ROutes

router.post('/createInstaApply',instaApplyBrnadFormController)

export default router;

