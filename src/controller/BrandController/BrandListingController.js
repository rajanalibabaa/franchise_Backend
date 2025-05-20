import mongoose from "mongoose";
import BrandListing from "../../model/Brand/brandListingPage.js";
import {ApiResponse} from "../../utils/ApiResponse/ApiResponse.js";
import { uploadFileToS3 } from "../../utils/Uploads/s3Uploader.js";


// import { GetObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
// import s3 from "../../utils/Uploads/s3.js";
// import dotenv from 'dotenv';
// dotenv.config();

// const createBrandListing = async (req, res) => {
//   try {
//     // Parse JSON fields safely
//     const brandDetails = JSON.parse(req.body.brandDetails || '{}');
//     const expansionPlans = JSON.parse(req.body.expansionPlans || '{}');
//     const investmentDetails = JSON.parse(req.body.FranchiseModal || '{}');

//     // Define file fields to expect
//     const fileFields = [
//       'brandLogo',
//       'businessRegistration',
//       'gstCertificate',
//       'franchiseAgreement',
//       'menuCatalog',
//       'interiorPhotos',
//       'fssaiLicense',
//       'panCard',
//       'aadhaarCard',
//       'gallery' // Multi-file
//     ];

//     const uploadedFileUrls = {};

//     // Handle all uploads
//     await Promise.all(
//       fileFields.map(async (field) => {
//         const files = req.files?.[field];

//         if (!files || files.length === 0) {
//           console.warn(`[SKIP] No file uploaded for field: ${field}`);
//           return;
//         }

//         // Handle gallery (multi-file)
//         if (field === 'gallery') {
//           const galleryResults = await Promise.all(
//             files.map(async (file, index) => {
//               try {
//                 const url = await uploadFileToS3(file.path, file.mimetype);
//                 return url;
//               } catch (err) {
//                 console.error(`[ERROR] Failed to upload gallery[${index}]:`, err.message);
//                 return null;
//               }
//             })
//           );
//           uploadedFileUrls.gallery = galleryResults.filter(Boolean);
//         } else {
//           // Handle single file fields
//           const file = files[0];
//           if (file?.path) {
//             try {
//               const url = await uploadFileToS3(file.path, file.mimetype);
//               uploadedFileUrls[field] = url;
//             } catch (err) {
//               console.error(`[ERROR] Failed to upload ${field}:`, err.message);
//             }
//           }
//         }
//       })
//     );

//     console.log("✅ Uploaded file URLs:", uploadedFileUrls);

//     // Create the brand listing
//     const createdBrand = await BrandListing.create({
//       BrandDetails: {
//         companyName: brandDetails.companyName,
//         brandName: brandDetails.brandName,
//         gstin: brandDetails.gstin,
//         categories: brandDetails.categories,
//         ownerName: brandDetails.ownerName,
//         description: brandDetails.description,
//         address: brandDetails.address,
//         country: brandDetails.country,
//         pincode: brandDetails.pincode,
//         location: brandDetails.location,
//         whatsappNumber: brandDetails.whatsappNumber,
//         email: brandDetails.email,
//         website: brandDetails.website,
//       },
//       ExpansionPlans: {
//         expansionType: expansionPlans.expansionType, 
//         selectedCountries: expansionPlans.selectedCountries || [],
//         selectedStates: expansionPlans.selectedStates || [],
//         selectedCities: expansionPlans.selectedCities || [],
//         selectedIndianStates: expansionPlans.selectedIndianStates || [],
//         selectedIndianDistricts: expansionPlans.selectedIndianDistricts || [],
//       },
//       FranchiseModal: {
//         totalInvestment: investmentDetails.totalInvestment,
//         franchiseFee: investmentDetails.franchiseFee,
//         royaltyFee: investmentDetails.royaltyFee,
//         equipmentCost: investmentDetails.equipmentCost,
//         expectedRevenue: investmentDetails.expectedRevenue,
//         expectedProfit: investmentDetails.expectedProfit,
//         spaceRequired: investmentDetails.spaceRequired,
//         paybackPeriod: investmentDetails.paybackPeriod,
//         minimumCashRequired: investmentDetails.minimumCashRequired,
//         companyOwnedOutlets: investmentDetails.companyOwnedOutlets,
//         franchiseOutlets: investmentDetails.franchiseOutlets,
//         targetCities: investmentDetails.targetCities,
//         targetStates: investmentDetails.targetStates,
//         expansionFranchiseFee: investmentDetails.expansionFranchiseFee,
//         expansionRoyalty: investmentDetails.expansionRoyalty,
//         paymentTerms: investmentDetails.paymentTerms,
//       },
//       Documentation: {
//         brandLogo: uploadedFileUrls.brandLogo,
//         businessRegistration: uploadedFileUrls.businessRegistration,
//         gstCertificate: uploadedFileUrls.gstCertificate,
//         franchiseAgreement: uploadedFileUrls.franchiseAgreement,
//         menuCatalog: uploadedFileUrls.menuCatalog,
//         interiorPhotos: uploadedFileUrls.interiorPhotos,
//         fssaiLicense: uploadedFileUrls.fssaiLicense,
//         panCard: uploadedFileUrls.panCard,
//         aadhaarCard: uploadedFileUrls.aadhaarCard,
//       },
//       Gallery: {
//         mediaFiles: uploadedFileUrls.gallery || [],
//       },
//       brandOwnerUUID: req.brandUser.uuid
//     });

//     if (!createdBrand) {
//       return res.status(500).json({
//         success: false,
//         message: "❌ Error storing data in database",
//       });
//     }

//     return res.status(201).json({
//       success: true,
//       message: "✅ Brand listing created successfully",
//       data: createdBrand,
//     });

//   } catch (error) {
//     console.error('[FATAL] createBrandListing error:', error);
//     return res.status(500).json({
//       success: false,
//       message: '❌ Failed to create brand listing',
//       details: error.message,
//     });
//   }
// };

// const createBrandListing = async (req, res) => {
//   try {
   

//     // Define file fields to expect
//     const fileFields = [
//       'brandLogo',
//       'businessRegistration',
//       'gstCertificate',
//       'franchiseAgreement',
//       'menuCatalog',
//       'interiorPhotos',
//       'fssaiLicense',
//       'panCard',
//       'aadhaarCard',
//       'gallery' // Multi-file
//     ];

//     const uploadedFileUrls = {};

//     // Handle all uploads
//     await Promise.all(
//       fileFields.map(async (field) => {
//         const files = req.files?.[field];

//         if (!files || files.length === 0) {
//           console.warn(`[SKIP] No file uploaded for field: ${field}`);
//           return;
//         }

//         // Handle gallery (multi-file)
//         if (field === 'gallery') {
//           const galleryResults = await Promise.all(
//             files.map(async (file, index) => {
//               try {
//                 const url = await uploadFileToS3(file.path, file.mimetype);
//                 return url;
//               } catch (err) {
//                 console.error(`[ERROR] Failed to upload gallery[${index}]:`, err.message);
//                 return null;
//               }
//             })
//           );
//           uploadedFileUrls.gallery = galleryResults.filter(Boolean);
//         } else {
//           // Handle single file fields
//           const file = files[0];
//           if (file?.path) {
//             try {
//               const url = await uploadFileToS3(file.path, file.mimetype);
//               uploadedFileUrls[field] = url;
//             } catch (err) {
//               console.error(`[ERROR] Failed to upload ${field}:`, err.message);
//             }
//           }
//         }
//       })
//     );

//     console.log("✅ Uploaded file URLs:", uploadedFileUrls);

//     // Create the brand listing
//     const createdBrand = await BrandListing.create({
    
//       Documentation: {
//         brandLogo: uploadedFileUrls.brandLogo,
//         businessRegistration: uploadedFileUrls.businessRegistration,
//         gstCertificate: uploadedFileUrls.gstCertificate,
//         franchiseAgreement: uploadedFileUrls.franchiseAgreement,
//         menuCatalog: uploadedFileUrls.menuCatalog,
//         interiorPhotos: uploadedFileUrls.interiorPhotos,
//         fssaiLicense: uploadedFileUrls.fssaiLicense,
//         panCard: uploadedFileUrls.panCard,
//         aadhaarCard: uploadedFileUrls.aadhaarCard,
//       },
//       Gallery: {
//         mediaFiles: uploadedFileUrls.gallery || [],
//       },
//     });

//     if (!createdBrand) {
//       return res.status(500).json({
//         success: false,
//         message: "❌ Error storing data in database",
//       });
//     }

//     return res.status(201).json({
//       success: true,
//       message: "✅ Brand listing created successfully",
//       data: createdBrand,
//     });

//   } catch (error) {
//     console.error('[FATAL] createBrandListing error:', error);
//     return res.status(500).json({
//       success: false,
//       message: '❌ Failed to create brand listing',
//       details: error.message,
//     });
//   }
// };


// const getAllBrands = async (req, res) => {
//     try {
//         const brands = await BrandListing.find({});

//         const brandWithUrls=brands.map(brand=>({
//           ...brand.toObject(),
//         }));
//         res.status(200).json(
//             new ApiResponse(
//                 200,
//                 brands,
//                 "Brands fetched successfully",
//             )
//         );
//     } catch (error) {
//         res.status(500).json({ error: "Failed to fetch brands", details: error.message });
//     }
// }



// const getBrandListingByUUID = async (req, res) => {
//   console.log("========================")
//   const {uuid} = req.params


//   try {
//     const userUUID = req.brandUser?.uuid && uuid;
//     const brand = await BrandListing.findOne({ brandOwnerUUID: userUUID });
//     if (!brand) {
//       return res.status(404).json({ error: "Brand not found" });
//     }

//     console.log("Gallery:", brand.Gallery.mediaFiles.length);
//     console.log("documentationKeys:", Object.keys(brand.Documentation).length);

//     const documentation = brand.Documentation;
//     const documentationWithUrls = {};

//     // Generate signed URLs for documentation (sequential)
//     for (const [name, value] of Object.entries(documentation)) {
//       try {
//         const command = new GetObjectCommand({
//           Bucket: process.env.S3_BUCKET_NAME,
//           Key: value,
//         });
//         const url = await getSignedUrl(s3, command, { expiresIn: 30  }); 

//         documentationWithUrls[name] = url;
//       } catch (err) {
//         console.error(`Error getting URL for ${name}:`, err.message);
//         documentationWithUrls[name] = null;
//       }
//     }

//     // Generate signed URLs for media files (sequential)
//     const mediaFilesWithUrls = [];
//     for (const value of brand.Gallery.mediaFiles) {
//       try {
//         const command = new GetObjectCommand({
//           Bucket: process.env.S3_BUCKET_NAME,
//           Key: value,
//         });
//         const url = await getSignedUrl(s3, command, { expiresIn: 86400  });
//         mediaFilesWithUrls.push(url);
//       } catch (err) {
//         console.error(`Error getting URL for media file ${value}:`, err.message);
//         mediaFilesWithUrls.push(null);
//       }
//     }

//     // Construct full brand data with signed URLs
//     const fullBrandData = {
//       ...brand.toObject(),
//       Documentation: documentationWithUrls,
//       Gallery: {
//         ...brand.Gallery,
//         mediaFiles: mediaFilesWithUrls,
//       },
//     };

//     console.log(fullBrandData)

//     res.status(200).json(
//       new ApiResponse(
//         200,
//         fullBrandData,
//         "Brand fetched successfully"
//       )
//     );
//   } catch (error) {
//     console.error("Fetch error:", error.message);
//     res.status(500).json({ error: "Failed to fetch brand", details: error.message });
//   }
// };

// const getBrandListingByUUID = async (req, res) => {
//     const { id } = req.params;
    
//     try {
//         const brand = await BrandListing.findById(id);
//         if (!brand) {
//             return res.status(404).json({ error: "Brand not found" });
//         }
//         res.status(200).json(
//             new ApiResponse(
//                 200,
//                 brand,
//                 "Brand fetched successfully",
//             )
//         );
//     } catch (error) {
//         res.status(500).json({ error: "Failed to fetch brand", details: error.message });
//     }
//   }

// const updateBrandListingByUUID = async (req, res) => {
//     const { id } = req.params;
//     const { BrandDetails, ExpansionPlans, FranchiseModal, Documentation  } = req.body;
//     console.log ("Brand data:", BrandDetails);

//     try {
//         const updatedBrand = await BrandListing.findByIdAndUpdate(id, {
            
//             BrandDetails : {
//                 ...BrandDetails,
//             },
//             ExpansionPlans : {
//                 ...ExpansionPlans,
//             },
//             FranchiseModal : {
//                 ...FranchiseModal,
//             },
//             Documentation : {
//                 ...Documentation,
//             },
//         }, { new: true });

//         if (!updatedBrand) {
//             return res.status(404).json({ error: "Brand not found" });
//         }

//         res.status(200).json(
//             new ApiResponse(
//                 200,
//                 updatedBrand,
//                 "Brand updated successfully",
//             )
//         );
//     } catch (error) {
//         res.status(500).json({ error: "Failed to update brand", details: error.message });
//     }
// }

// const updateBrandImageListingByUUID = async (req, res) => {
//     const { id } = req.params;
//     console.log("Image URL:", id);
// }
// const deleteBrandListingByUUID = async (req, res) => {
//     const { id } = req.params;

//     try {
//         const deletedBrand = await BrandListing.findByIdAndDelete(id);

//         if (!deletedBrand) {
//             return res.status(404).json({ error: "Brand not found" });
//         }

//         res.status(200).json(
//             new ApiResponse(
//                 200,
//                 {},
//                 "Brand deleted successfully",
//             )
//         );
//     } catch (error) {
//         res.status(500).json({ error: "Failed to delete brand", details: error.message });
//     }
// }


// export { 
//     createBrandListing,
//     getAllBrands,
//     getBrandListingByUUID,
//     updateBrandListingByUUID,
//     deleteBrandListingByUUID,
//     updateBrandImageListingByUUID
//  };


// Fields expected as file uploads (keyed by req.files)
const singleFileFields = [
  'brandLogo',
  'gstCertificate',
  'pancard',
  'companyImage',
  'exterioroutlet',
  'interiorOutlet',
  'franchisePromotionVideo',
  'brandPromotionVideo'
];


const createBrandListing = async (req, res) => {
  try {
    // Parse form data from req.body
    const personalDetails = JSON.parse(req.body.personalDetails || '{}');
    const franchiseDetails = JSON.parse(req.body.franchiseDetails || '{}');
    const brandDetails = JSON.parse(req.body.brandDetails || '{}');
console.log("🚀 ~ file: BrandListingController.js:97 ~ createBrandListing ~ brandDetails:", brandDetails);
console.log("🚀 ~ file: BrandListingController.js:97 ~ createBrandListing ~ personalDetails:", personalDetails);
console.log("🚀 ~ file: BrandListingController.js:97 ~ createBrandListing ~ franchiseDetails:", franchiseDetails);


    // Upload files to S3 and store URLs
    const uploadedFiles = {};
    for (const field of singleFileFields) {
      const files = req.files?.[field];

      if (files && files.length > 0) {
        const isVideoField = field.includes('Video');
    const contentType = isVideoField ? 'video/mp4' : undefined;

        const urls = await Promise.all(
          files.map(file => uploadFileToS3(file.path, file.mimetype))
        );

        uploadedFiles[field] = urls; // Store single or array
      }
    }

    console.log("✅ Uploaded File URLs:", uploadedFiles);
    // Construct brand data for MongoDB
    const newBrand = await BrandListing.create({
      personalDetails:{
        ...personalDetails,
      },
      franchiseDetails:{
        ...franchiseDetails
      },
      brandDetails: {
        ...brandDetails,
      pancard: uploadedFiles.pancard || [],
        gstCertificate: uploadedFiles.gstCertificate || [],
        brandLogo: uploadedFiles.brandLogo || [],
        companyImage: uploadedFiles.companyImage || [],
        exterioroutlet: uploadedFiles.exterioroutlet || [],
        interiorOutlet: uploadedFiles.interiorOutlet || [],
        franchisePromotionVideo: uploadedFiles.franchisePromotionVideo || [],
        brandPromotionVideo: uploadedFiles.brandPromotionVideo || [],
      },
      // brandOwnerUUID: req.brandUser?.uuid || null,
    });
    await newBrand.save();

    if(!newBrand){
      return res.status(500).JSON({success: false, message: "Failed to create brand listing"});
    }

    return res.status(201).json(
      new ApiResponse(201, newBrand, "✅ Brand listing created successfully")
    );
  } catch (error) {
    console.error("❌ createBrandListing error:", error);
    return res.status(500).json({ success: false, message: "Failed to create brand listing", error: error.message });
  }
};

const getAllBrands = async (req, res) => {
  try {
    const brands = await BrandListing.find();


    brands.forEach(brand => {
      console.log('brand videos :',{
        franchisePromotionVideo: brand.brandDetails?.franchisePromotionVideo,
        brandPromotionVideo: brand.brandDetails?.brandPromotionVideo
      });
      
    })
    return res.status(200).json(
      new ApiResponse(200, brands, "✅ Brands fetched successfully")
    );
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch brands", details: error.message });
  }
};

const getBrandListingByUUID = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await BrandListing.findById(id);
    if (!brand) return res.status(404).json({ error: "Brand not found" });

    return res.status(200).json(new ApiResponse(200, brand, "✅ Brand fetched successfully"));
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch brand", details: error.message });
  }
};

const updateBrandListingByUUID = async (req, res) => {
  try {
    const { id } = req.params;
    const personalDetails = JSON.parse(req.body.personalDetails || '{}');
    const franchiseDetails = JSON.parse(req.body.franchiseDetails || '{}');
    const brandDetails = JSON.parse(req.body.brandDetails || '{}');

    // Upload new images if provided
    const uploadedFiles = {};
    for (const field of singleFileFields) {
      const files = req.files?.[field];
      if (files && files.length > 0) {
        const urls = await Promise.all(
          files.map(file => uploadFileToS3(file.path, file.mimetype))
        );
        uploadedFiles[field] = urls.length === 1 ? urls[0] : urls;
      }
    }

    const updatedBrand = await BrandListing.findByIdAndUpdate(
      id,
      {
        personalDetails,
        franchiseDetails,
        brandDetails: {
          ...brandDetails,
          ...uploadedFiles,
        },
      },
      { new: true }
    );

    if (!updatedBrand) return res.status(404).json({ error: "Brand not found" });

    return res.status(200).json(new ApiResponse(200, updatedBrand, "✅ Brand updated successfully"));
  } catch (error) {
    return res.status(500).json({ error: "Failed to update brand", details: error.message });
  }
};

const deleteBrandListingByUUID = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BrandListing.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Brand not found" });

    return res.status(200).json(new ApiResponse(200, {}, "✅ Brand deleted successfully"));
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete brand", details: error.message });
  }
};

export {
  createBrandListing,
  getAllBrands,
  getBrandListingByUUID,
  updateBrandListingByUUID,
  deleteBrandListingByUUID
};