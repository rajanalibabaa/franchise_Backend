import express from "express";
import upload from "../../utils/Uploads/multerConfig.js";
import {
  allId,
  createBrandListing,
  deleteBrandListingByUUID,
  getAllBrands,
  getBrandListingByUUID,
  reEntry,
  updateBrandListingByUUID,

  // getTopFoodFranchise,
  // getTopBeverageFranchise,
  // getTopLeadingFranchise,
  // getTopCafes,
  // getTopDesertAndBakery,
  // getTopTrucksAndKiosks,
  // getTopRestaurants,
  getBrandsByCategory,
  getBrandById,
  // getFoodAndBeverageCategory,
} from "../../controller/BrandController/BrandListingController.js";
import { verifyJWT } from "../../Middleware/Authentication/authMiddleware.js";
import { updateBrandImageById } from "../../controller/BrandController/uploadImages.js";
import {
  datafieldnewEntry,
  testgetAllBrands,
} from "../../controller/BrandController/anonymousFunction.js";
// import instaApplyBrnadFormController from "../../controller/BrandController/instaApplyBrnadFormController.js";

import {
  createPaymentPackage,
  getAllPaymentPackages,
  deletePaymentPackage,
  getPaymentPackageById,
  updatePaymentPackage,
  AddpackageUpdate,
} from "../../controller/BrandController/AdvertiseBrandController.js";

import {
  submitRequest,
  getAllRequests,
  deleteRequestByBrandUuid,
  getRequestByBrandId,
  getRequestById,
  updateRequestById,
} from "../../controller/BrandController/userRequesChanges/userRequestController.js";
const router = express.Router();

router.post(
  "/v1/brandlisting/createBrandListing",
  upload.fields([
    { name: "awardDoc", maxCount: 10 },
    { name: "brandLogo", maxCount: 1 },
    { name: "pancard", maxCount: 1 },
    { name: "businessPlan", maxCount: 1 },
    { name: "exteriorOutlet", maxCount: 5 },
    { name: "franchisePromotionVideo", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 },
    { name: "interiorOutlet", maxCount: 5 },
  ]),

  createBrandListing,
);

router.get("/v1/brandlisting/getAllBrandListing", getAllBrands);
router.get("/v1/brandlisting/getBrandListingByUUID/:id", getBrandListingByUUID);
router.get("/v1/brandlisting/getBrandById/:id", getBrandById);
router.get("/v1/brandlisting/getBrandsByChildCategory", getBrandsByCategory);

router.patch(
  "/v1/brandlisting/updateBrandListingByUUID/:id",
  upload.fields([
    { name: "awardDoc", maxCount: 10 },
    { name: "brandLogo", maxCount: 1 },
    { name: "pancard", maxCount: 1 },
    { name: "businessPlan", maxCount: 1 },
    { name: "exteriorOutlet", maxCount: 5 },
    { name: "franchisePromotionVideo", maxCount: 1 },
    { name: "brandPromotionVideo", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 },
    { name: "interiorOutlet", maxCount: 5 },
  ]),
  updateBrandListingByUUID,
);
router.patch(
  "/v1/brandlisting/updateBrandImageById/:id",
  upload.fields([
    { name: "awardDoc", maxCount: 10 },
    { name: "brandLogo", maxCount: 1 },
    { name: "pancard", maxCount: 1 },
    { name: "businessPlan", maxCount: 1 },
    { name: "exteriorOutlet", maxCount: 5 },
    { name: "franchisePromotionVideo", maxCount: 1 },
    { name: "brandPromotionVideo", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 },
    { name: "interiorOutlet", maxCount: 5 },
  ]),
  updateBrandImageById,
);
// Add both possibilities to be safe
router.delete("/v1/deleteBrandListingByUUID/:uuid", deleteBrandListingByUUID);
// router.delete('/deleteBrandListingByUUID/:id', deleteBrandListingByUUID); // Fallback

//brand Apply form for franchise ROutes

router.post("/reEntry", reEntry);
router.get("/allId", allId);

// anonymousFunction
router.get("/datafieldnewEntry", datafieldnewEntry);
router.get("/testgetAllBrands", testgetAllBrands);

// AdvertiseCreation router

router.post("/v1/brandadvertise/payment", createPaymentPackage);
router.get("/v1/brandadvertise/payment", getAllPaymentPackages);
router.delete(
  "/v1/brandadvertise/payment-packages/:uuid/:type/:index",
  deletePaymentPackage,
);
router.get("/v1/brandadvertise/payment", getPaymentPackageById);
router.put(
  "/v1/brandadvertise/payment-packages/:uuid/:type/:index",
  updatePaymentPackage,
);
router.post(
  "/v1/brandadvertise/payment-packages/:uuid/add/:type/:index",
  AddpackageUpdate,
);

// request Routes

router.post("/v1/brandlisting/userRequestNotification", submitRequest);
router.get("/v1/brandlisting/userRequestNotification", getAllRequests);
router.get(
  "/v1/brandlisting/userRequestNotificationByBrandId/:brandId",
  getRequestByBrandId,
);
router.delete(
  "/v1/brandlisting/userRequestNotification/:uuid",
  deleteRequestByBrandUuid,
);

router.get(
  "/v1/brandlisting/userRequestNotificationByUUID/:uuid",
  getRequestById,
);
router.patch(
  "/v1/brandlisting/userRequestNotification/:uuid",
  updateRequestById,
);

export default router;
