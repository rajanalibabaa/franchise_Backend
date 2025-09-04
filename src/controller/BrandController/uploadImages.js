import { BrandUploads } from "../../model/Brand/Brand.model/Uploads.model.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import { deleteFileFromR2, uploadFileToR2 } from "../../utils/Uploads/s3Uploader.js";

// export const updateBrandImageById = async (req, res) => {
  
//   try {
//     const  { imageDeleteData  } = req?.body;
//     const  awardsToDelete = JSON.parse(req?.body?.awardsToDelete);
    

//     // console.log("Request Body:", JSON.stringify(req.body.imageDeleteData));
//     console.log("req.body:", req.body);
//     // console.log("Request Body:", req.body.exteriorOutlet);

//     // console.log("imageDeleteData :", imageDeleteData);

//     // console.log("uploadFormData:", req.body.uploadFormData );

//     let data = null;
    
//     if (imageDeleteData) {
//       for (const [key, value] of Object.entries(JSON.parse(req?.body?.imageDeleteData))) {
//         // console.log(`Field to delete from: ${key}`);
//         for (const img of value) {
//           await deleteFileFromR2(img);
//           data = await BrandUploads.findOneAndUpdate(
//             {
//               $and: [
//                 { brandOwnerId: req.params?.id },
//                 { [`uploads.${key}`]: { $in: [img] } },
//               ],
//             },
//             { $pull: { [`uploads.${key}`]: img } },
//             { new: true, runValidators: true }
//           );
//         }
//       }
//     }

//     const fileFields = [
//       "brandLogo",
//       "franchisePromotionVideo",
//       "gstCertificate",
//       "pancard",
//       "businessPlan",
//     ];
//     const multiFileFields = ["exteriorOutlet", "interiorOutlet"];
   
    

//     const oldUploads = await BrandUploads.findOne({
//       brandOwnerId: req.params?.id,
//     });
    

//     if (!oldUploads) {
//       return res
//         .status(404)
//         .json(new ApiResponse(404, {}, "No uploads found for this brand owner"));
//     }

//     for (const field of fileFields) {
//       const uploadedFile = req.files?.[field]?.[0];
//       if (uploadedFile) {
//         if (oldUploads.uploads?.[field]?.length > 0) {
//           await deleteFileFromR2(oldUploads.uploads[field][0]);
//         }

//         const newFileUrl = await uploadFileToR2(
//           uploadedFile.path,
//           uploadedFile.mimetype
//         );

//         data = await BrandUploads.findOneAndUpdate(
//           { brandOwnerId: req.params.id },
//           { $set: { [`uploads.${field}`]: [newFileUrl] } },
//           { new: true, runValidators: true }
//         );
//       }
//     }

//     for (const field of multiFileFields) {
//       const uploadedFiles = req.files?.[field];
//       if (uploadedFiles && uploadedFiles.length > 0) {
//         const newFileUrls = await Promise.all(
//           uploadedFiles.map((file) =>
//             uploadFileToR2(file.path, file.mimetype)
//           )
//         );

//         data = await BrandUploads.findOneAndUpdate(
//           { brandOwnerId: req.params.id },
//           { $push: { [`uploads.${field}`]: { $each: newFileUrls } } },
//           { new: true, runValidators: true }
//         );
//       }
//     }

//     if (awardsToDelete?.length > 0) {
//     awardsToDelete.sort((a, b) => b - a);

//     for (const index of awardsToDelete) {
//       const award = oldUploads.uploads.awards[index];
//       if (!award) continue;

//       if (award.awardImage) {
//         await deleteFileFromR2(award.awardImage);
//       }

//       oldUploads.uploads.awards.splice(index, 1);
//     }

//     data = await oldUploads.save();
//     }
 
//     const awardFiles = req.files?.awardDoc || [];
//     const awardDescriptions = req.body.addAwardDescription;
//     console.log("Award Descriptions:", awardDescriptions);

   
//     const descriptions = Array.isArray(awardDescriptions) ? awardDescriptions : [awardDescriptions];

    
//     const uploadedFiles = awardFiles.length > 0
//     ? await Promise.all(awardFiles.map((file) => uploadFileToR2(file.path, file.mimetype)))
//     : [];

    
//     const awardsToInsert = [];

//     for (let i = 0; i < Math.max(descriptions.length, uploadedFiles.length); i++) {
//     awardsToInsert.push({
//         awardDescription: descriptions[i] || "",   
//         awardImage: uploadedFiles[i] || ""        
//     });
//     }


//     if (awardsToInsert.length > 0) {
//     data = await BrandUploads.findOneAndUpdate(
//         { brandOwnerId: req.params.id },
//         { $push: { "uploads.awards": { $each: awardsToInsert } } },
//         { new: true, runValidators: true }
//     );
//     }


//     return res.json(
//       new ApiResponse(200, data, "Brand images updated successfully")
//     );
    
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json(
//         new ApiResponse(
//           500,
//           {},
//           "Something went wrong while updating brand images"
//         )
//       );
//   }
// };


export const updateBrandImageById = async (req, res) => {
  try {
    let imageDeleteData = null;
    let awardsToDelete = [];
    let awardDescriptions = [];

    // Parse imageDeleteData safely
    if (req.body?.imageDeleteData) {
      try {
        imageDeleteData = typeof req.body.imageDeleteData === 'string' 
          ? JSON.parse(req.body.imageDeleteData) 
          : req.body.imageDeleteData;
      } catch (error) {
        console.error("Error parsing imageDeleteData:", error);
        imageDeleteData = null;
      }
    }

    // Parse awardsToDelete safely
    if (req.body?.awardsToDelete) {
      try {
        awardsToDelete = typeof req.body.awardsToDelete === 'string'
          ? JSON.parse(req.body.awardsToDelete)
          : req.body.awardsToDelete;
      } catch (error) {
        console.error("Error parsing awardsToDelete:", error);
        awardsToDelete = [];
      }
    }

    // Parse awardDescriptions safely (CHANGED FROM addAwardDescription)
    if (req.body?.awardDescriptions) {
      try {
        awardDescriptions = typeof req.body.awardDescriptions === 'string'
          ? JSON.parse(req.body.awardDescriptions)
          : req.body.awardDescriptions;
      } catch (error) {
        console.error("Error parsing awardDescriptions:", error);
        awardDescriptions = [];
      }
    }

    console.log("imageDeleteData:", imageDeleteData);
    console.log("awardsToDelete:", awardsToDelete);
    console.log("awardDescriptions:", awardDescriptions);

    let data = null;
    const oldUploads = await BrandUploads.findOne({
      brandOwnerId: req.params?.id,
    });

    if (!oldUploads) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "No uploads found for this brand owner"));
    }

    // Handle file deletions
    if (imageDeleteData) {
      for (const [key, value] of Object.entries(imageDeleteData)) {
        console.log(`Field to delete from: ${key}`);
        for (const img of value) {
          await deleteFileFromR2(img);
          data = await BrandUploads.findOneAndUpdate(
            {
              $and: [
                { brandOwnerId: req.params?.id },
                { [`uploads.${key}`]: { $in: [img] } },
              ],
            },
            { $pull: { [`uploads.${key}`]: img } },
            { new: true, runValidators: true }
          );
        }
      }
    }

    const fileFields = [
      "brandLogo",
      "franchisePromotionVideo",
      "gstCertificate",
      "pancard",
      "businessPlan",
    ];
    const multiFileFields = ["exteriorOutlet", "interiorOutlet"];

    // Handle single file uploads
    for (const field of fileFields) {
      const uploadedFile = req.files?.[field]?.[0];
      if (uploadedFile) {
        if (oldUploads.uploads?.[field]?.length > 0) {
          await deleteFileFromR2(oldUploads.uploads[field][0]);
        }

        const newFileUrl = await uploadFileToR2(
          uploadedFile.path,
          uploadedFile.mimetype
        );

        data = await BrandUploads.findOneAndUpdate(
          { brandOwnerId: req.params.id },
          { $set: { [`uploads.${field}`]: [newFileUrl] } },
          { new: true, runValidators: true }
        );
      }
    }
    
    // Handle multiple file uploads
    for (const field of multiFileFields) {
      const uploadedFiles = req.files?.[field];
      if (uploadedFiles && uploadedFiles.length > 0) {
        const newFileUrls = await Promise.all(
          uploadedFiles.map((file) =>
            uploadFileToR2(file.path, file.mimetype)
          )
        );

        data = await BrandUploads.findOneAndUpdate(
          { brandOwnerId: req.params.id },
          { $push: { [`uploads.${field}`]: { $each: newFileUrls } } },
          { new: true, runValidators: true }
        );
      }
    }

    // Handle award deletions FIRST (to maintain correct indices)
    if (awardsToDelete?.length > 0) {
      awardsToDelete.sort((a, b) => b - a); // Sort descending to avoid index issues

      for (const index of awardsToDelete) {
        const award = oldUploads.uploads.awards[index];
        if (!award) continue;

        if (award.awardImage) {
          await deleteFileFromR2(award.awardImage);
        }

        oldUploads.uploads.awards.splice(index, 1);
      }

      await oldUploads.save();
    }

    // Handle new award uploads and updates
    const awardFiles = req.files?.awardDoc || [];
    const uploadedFiles = awardFiles.length > 0
      ? await Promise.all(awardFiles.map((file) => uploadFileToR2(file.path, file.mimetype)))
      : [];

    // Process awards - this handles both new awards and updates to existing ones
    if (awardDescriptions.length > 0 || uploadedFiles.length > 0) {
      // Get current awards after deletions
      const currentUploads = await BrandUploads.findOne({ brandOwnerId: req.params.id });
      let currentAwards = currentUploads.uploads.awards || [];

      // Update existing awards with new descriptions
      awardDescriptions.forEach((awardDesc, index) => {
        if (index < currentAwards.length) {
          // Update existing award description
          currentAwards[index].awardDescription = awardDesc.awardDescription || awardDesc;
        } else {
          // Add new award
          currentAwards.push({
            awardDescription: awardDesc.awardDescription || awardDesc,
            awardImage: uploadedFiles[index] || ""
          });
        }
      });

      // Handle file updates for existing awards
      uploadedFiles.forEach((fileUrl, index) => {
        if (index < currentAwards.length) {
          // Replace image for existing award
          if (currentAwards[index].awardImage) {
            deleteFileFromR2(currentAwards[index].awardImage).catch(console.error);
          }
          currentAwards[index].awardImage = fileUrl;
        }
      });

      // Save updated awards
      data = await BrandUploads.findOneAndUpdate(
        { brandOwnerId: req.params.id },
        { $set: { "uploads.awards": currentAwards } },
        { new: true, runValidators: true }
      );
    }

    return res.json(
      new ApiResponse(200, data, "Brand images updated successfully")
    );
    
  } catch (error) {
    console.error("Error in updateBrandImageById:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          {},
          "Something went wrong while updating brand images"
        )
      );
  }
};