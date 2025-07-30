import express from "express";
import upload from "../../utils/Uploads/multerConfig.js";
import { allId, createBrandListing,deleteBrandListingByUUID,getAllBrands,getBrandListingByUUID,reEntry,updateBrandListingByUUID,getTopFoodFranchise,getTopCafes} from "../../controller/BrandController/BrandListingController.js"
// import instaApplyBrnadFormController from "../../controller/BrandController/instaApplyBrnadFormController.js";

const router = express.Router();

 
 
router.post(

    "/v1/brandlisting/createBrandListing",
 upload.fields([
    { name: 'awardDoc', maxCount: 10 },
    { name: 'brandLogo', maxCount: 1 },
    { name: 'pancard', maxCount: 1},
    { name: 'businessPlan', maxCount: 1 },
    { name: 'exteriorOutlet', maxCount: 5 },
    { name: 'franchisePromotionVideo', maxCount: 1 },
    { name: 'gstCertificate', maxCount: 1 },
    { name: 'interiorOutlet', maxCount: 5 }
  ])
 
,createBrandListing )

router.get("/v1/brandlisting/getAllBrandListing", getAllBrands);
router.get("/v1/brandlisting/getBrandListingByUUID/:id",getBrandListingByUUID);
router.get("/v1/brandlisting/getTopFoodFranchise",getTopFoodFranchise)
router.patch(
  "/v1/brandlisting/updateBrandListingByUUID/:id",
  upload.fields([
    { name: 'awardDoc', maxCount: 10 },
    { name: 'brandLogo', maxCount: 1 },
    { name: 'pancard', maxCount: 1 },
    { name: 'businessPlan', maxCount: 1 },
    { name: 'exteriorOutlet', maxCount: 5 },
    { name: 'franchisePromotionVideo', maxCount: 1 },
    { name: 'brandPromotionVideo', maxCount: 1 },
    { name: 'gstCertificate', maxCount: 1 },
    { name: 'interiorOutlet', maxCount: 5 }
  ]),
  updateBrandListingByUUID
);
router.delete("/v1/brandlisting/deleteBrandListingByUUID/:uuid", deleteBrandListingByUUID);

//brand Apply form for franchise ROutes

router.post('/reEntry',reEntry)
router.get('/allId',allId)

router.get('/v1/brandlisting/getTopCafes',getTopCafes)

export default router;