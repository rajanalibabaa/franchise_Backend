import { BrandUploads } from "../../model/Brand/Brand.model/Uploads.model.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import { deleteFileFromR2, uploadFileToR2 } from "../../utils/Uploads/s3Uploader.js";

export const updateBrandImageById = async (req, res) => {
  
  try {
    const  { imageDeleteData,awardsToDelete  } = req.body;

    console.log("deleteAwards delete data:", awardsToDelete );

    let data = null;
    
    if (imageDeleteData) {
      for (const [key, value] of Object.entries(imageDeleteData)) {
        console.log(`Field to delete from: ${key}`);
        for (const img of value) {
          await deleteFileFromR2(img);
          data = await BrandUploads.findOneAndUpdate(
            {
              $and: [
                { brandOwnerId: req.params.id },
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
   
    

    const oldUploads = await BrandUploads.findOne({
      brandOwnerId: req.params.id,
    });
    

    if (!oldUploads) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "No uploads found for this brand owner"));
    }

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

    if (awardsToDelete?.length > 0) {
    awardsToDelete.sort((a, b) => b - a);

    for (const index of awardsToDelete) {
      const award = oldUploads.uploads.awards[index];
      if (!award) continue;

      if (award.awardImage) {
        await deleteFileFromR2(award.awardImage);
      }

      oldUploads.uploads.awards.splice(index, 1);
    }

    data = await oldUploads.save();
    }
 
    const awardFiles = req.files?.awardDoc || [];
    const awardDescriptions = req.body.addAwardDescription || [];

   
    const descriptions = Array.isArray(awardDescriptions) ? awardDescriptions : [awardDescriptions];

    
    const uploadedFiles = awardFiles.length > 0
    ? await Promise.all(awardFiles.map((file) => uploadFileToR2(file.path, file.mimetype)))
    : [];

    
    const awardsToInsert = [];

    for (let i = 0; i < Math.max(descriptions.length, uploadedFiles.length); i++) {
    awardsToInsert.push({
        awardDescription: descriptions[i] || "",   
        awardImage: uploadedFiles[i] || ""        
    });
    }


    if (awardsToInsert.length > 0) {
    data = await BrandUploads.findOneAndUpdate(
        { brandOwnerId: req.params.id },
        { $push: { "uploads.awards": { $each: awardsToInsert } } },
        { new: true, runValidators: true }
    );
    }


    return res.json(
      new ApiResponse(200, data, "Brand images updated successfully")
    );
    
  } catch (error) {
    console.error(error);
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