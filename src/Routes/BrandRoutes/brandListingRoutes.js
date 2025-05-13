import express from "express";
import { verifyOTP } from "../../controller/BrandController/sendOTPController.js";
import { createBrandListing,  deleteBrandListingByUUID, getAllBrands, getBrandListingByUUID,  updateBrandImageListingByUUID, updateBrandListingByUUID } from "../../controller/BrandController/BrandListingController.js";
import upload from "../../utils/Uploads/multerConfig.js";
import { verifyJWT } from "../../Middleware/Authentication/AuthMiddleware.js";

const router = express.Router();


// brandRouter.get("/getBrandListing", GetBrandListing);
// brandRouter.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// router.post(
//     "/createBrandListing",
//     upload.fields([
//         { name: 'Gallery', maxCount: 1000 },
//         { name: 'brandLogo', maxCount: 1 },
//         { name: 'businessRegistration', maxCount: 1 },
//         { name: 'gstCertificate', maxCount: 1 },
//         { name: 'franchiseAgreement', maxCount: 1 },
//         { name: 'menuCatalog', maxCount: 1 },
//         { name: 'interiorPhotos', maxCount: 1 },
//         { name: 'fssaiLicense', maxCount: 1 },
//         { name: 'panCard', maxCount: 1 },
//         { name: 'aadhaarCard', maxCount: 1 },
//       ]),
//       createBrandListing
//     ) 
router.post(
    "/createBrandListing",
    upload.fields([
        
         { name: 'brandLogo' },
  { name: 'businessRegistration' },
  { name: 'gstCertificate' },
  { name: 'franchiseAgreement' },
  { name: 'menuCatalog' },
  { name: 'interiorPhotos' },
  { name: 'fssaiLicense' },
  { name: 'panCard' },
  { name: 'aadhaarCard' },
  { name: 'gallery'},
  
      ]),
      createBrandListing
    )
router.get("/getAllBrand", getAllBrands);
router.get("/getBrand/:id", getBrandListingByUUID);
router.patch("/updateBrand/:id", updateBrandListingByUUID)
router.delete("/deleteBrand/:id", deleteBrandListingByUUID);
router.patch("/updateBrandImage/:id", updateBrandImageListingByUUID)

export default router;
