import express from "express";
import upload from "../../utils/Uploads/multerConfig.js";
import { createBrandListing,deleteBrandListingByUUID,getAllBrands,getBrandListingByUUID,updateBrandListingByUUID} from "../../controller/BrandController/BrandListingController.js"
import { verifyJWT } from "../../Middleware/Authentication/authMiddleware.js";
// import instaApplyBrnadFormController from "../../controller/BrandController/instaApplyBrnadFormController.js";

const router = express.Router();

 
 
router.post(

    "/v1/brandlisting/createBrandListing",
 upload.fields([
  { name: "brandLogo", maxCount: 1 },
  { name: "gstCertificate", maxCount: 1 },
  { name: "pancard", maxCount: 1 },
  { name: "exteriorOutlet", maxCount: 5 },
  { name: "interiorOutlet", maxCount: 5 },
  { name: "franchisePromotionVideo", maxCount: 1 },
  { name: "awardDoc", maxCount: 5 },
  { name: "businessPlan", maxCount: 1 }
  ])
,
      createBrandListing
    )
router.get("/v1/brandlisting/getAllBrandListing", getAllBrands);
router.get("/v1/brandlisting/getBrandListingByUUID/:id",getBrandListingByUUID);
router.patch("/v1/brandlisting/updateBrandListingByUUID/:id", updateBrandListingByUUID)
router.delete("/v1/brandlisting/deleteBrandListingByUUID/:uuid", deleteBrandListingByUUID);

//brand Apply form for franchise ROutes

// router.post('/createInstaApply',instaApplyBrnadFormController)

export default router;

