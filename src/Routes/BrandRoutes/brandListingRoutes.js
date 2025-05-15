import express from "express";
import { createBrandListing,  deleteBrandListingByUUID,getAllBrands,getBrandListingByUUID,updateBrandImageListingByUUID, updateBrandListingByUUID } from "../../controller/BrandController/brandListingController.js";
import upload from "../../utils/Uploads/multerConfig.js";
import { verifyJWT } from "../../Middleware/Authentication/authMiddleware.js";

const router = express.Router();

 
 
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
router.get("/getAllBrandListing", getAllBrands);
router.get("/getBrandListingByUUID/:uuid", getBrandListingByUUID);
router.patch("/updateBrandListingByUUID/:uuid", updateBrandListingByUUID)
router.delete("/deleteBrandListingByUUID/:uuid", deleteBrandListingByUUID);
router.patch("/updateBrandImageListingByUUID/:uuid", updateBrandImageListingByUUID)

export default router;

