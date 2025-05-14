import express from "express";
import { createBrandListing,  deleteBrandListingByUUID, getAllBrands, getBrandListingByUUID,  updateBrandImageListingByUUID, updateBrandListingByUUID } from "../../controller/BrandController/brandListingController.js";
import upload from "../../utils/Uploads/multerConfig.js";
import { verifyJWT } from "../../Middleware/Authentication/authMiddleware.js";

const brandListingRoutes = express.Router();


// brandRouter.get("/getBrandListing", GetBrandListing);
// brandRouter.post("/send-otp", sendOTP);

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
brandListingRoutes.post("/createBrandListing",upload.fields([{ name: 'brandLogo' },{ name: 'businessRegistration' },{ name: 'gstCertificate' },{ name: 'franchiseAgreement' },{ name: 'menuCatalog' },{ name: 'interiorPhotos' },{ name: 'fssaiLicense' }, { name: 'panCard' },{ name: 'aadhaarCard' },{ name: 'gallery'},]),createBrandListing)
brandListingRoutes.get("/getAllBrand", getAllBrands);
brandListingRoutes.get("/getBrand/:id", getBrandListingByUUID);
brandListingRoutes.patch("/updateBrand/:id", updateBrandListingByUUID)
brandListingRoutes.delete("/deleteBrand/:id", deleteBrandListingByUUID);
brandListingRoutes.patch("/updateBrandImage/:id", updateBrandImageListingByUUID)

export default brandListingRoutes;
