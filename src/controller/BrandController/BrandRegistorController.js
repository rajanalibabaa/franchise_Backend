import mongoose from "mongoose";
import { BrandRegister } from "../../model/Brand/BrandRegisterModel.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import uuid from "../../utils/uuid.js";

const creatBrandRegister = async (req, res) => {
  const { formData } = req.body;
  console.log("Request Body:", req.body);

  // Validate required fields
  if (
    !formData?.firstName ||
    !formData?.phone ||
    !formData?.email ||
    !formData?.brandName
  ) {
    return res.status(400).json(
      new ApiResponse(400, {}, "All required fields must be provided.")
    );
  }

  // Check for existing email or phone
  const exists = await BrandRegister.findOne({
    $or: [
      { email: formData.email }, 
      { phone: formData.phone }
    ]
  });

  if (exists) {
    return res.status(409).json(
      new ApiResponse(409, {}, "Brand already registered with this email or phone.")
    );
  }

  // Create new brand entry
  try {
    const brandCreated = await BrandRegister.create({
      firstName: formData.firstName,
      phone: formData.phone,
      email: formData.email,
      brandName: formData.brandName,
      companyName: formData.companyName,
      category: formData.category,
      franchiseType: formData.franchiseType,
      uuid : uuid()
    });

    if(!brandCreated){
        return res.json(
            new ApiResponse(
                500,
                {},
                "some think went wrong while storing the data in database "
            )
        )

    }

    return res.status(201).json(
      new ApiResponse(201, brandCreated, "Form submitted successfully")
    );
  } catch (error) {
    console.error("Error creating brand:", error);
    return res.status(500).json(
      new ApiResponse(500, {}, "Error while storing the data in the database")
    );
  }
};

const getBrandByRegisterId = async (req,res) => {
  const { uuid } = req.params;
  // console.log(uuid)
  // console.log(req.brandUser)

  if (uuid !== req?.brandUser?.uuid) {
    return res.json(
      new ApiResponse(
        401,
        null,
        "Unauthorized request"
      )
    )
  }

  try {
    const exists = await BrandRegister.findOne({uuid : req?.brandUser?.uuid}).select("-__v -_id -createdAt -updatedAt");;

    console.log(exists)
  
    if (!exists) {
      return res.json(
        new ApiResponse(
          409,
          {},
          "BrandRegister user not exists check the id you passing"
        )
      )
    }
  
    return res.json(
      new ApiResponse(
        200,
        exists,
        "BrandRegister data fetch successfully"
      )
    )
  } catch (error) {
    res.status(500).json({ error: "Failed to get brand by id", details: error.message });
  }
}

const getAllBrandRegister = async (req,res) => {

  try {
  const allBrandRegister = await BrandRegister.find({})

  console.log(allBrandRegister)

  
    if (!allBrandRegister) {
      return res.json(
        new ApiResponse(
          200,
          {},
          "some think went while fetch all data from data base"
        )
      )
    }
  
    return res.json(
      new ApiResponse(
        200,
        allBrandRegister,
        "BrandRegister all data fetch successfully"
      )
    )
  } catch (error) {
    res.status(500).json({ error: "Failed to get all brand", details: error.message });
  }
}

const updateBrandRegister = async (req, res) => {
  const { uuid } = req.params;
  const { firstName, phone, email, brandName, companyName, category } = req.body;

  console.log("Update request UUID:", uuid);
  console.log("Request body:", req.body);
   if (uuid !== req?.brandUser?.uuid) {
    return res.json(
      new ApiResponse(
        401,
        null,
        "Unauthorized request"
      )
    )
  }

  try {
    const updatedBrand = await BrandRegister.findOneAndUpdate(
      { uuid : req?.brandUser?.uuid }, 
      {
        firstName,
        phone,
        email,
        brandName,
        companyName,
        category,
      },
      { new: true, runValidators: true }
    );

    if (!updatedBrand) {
      return res.status(404).json({ message: "Brand not found with this UUID" });
    }

    return res.status(200).json({
      message: "Brand updated successfully",
      data: updatedBrand,
    });
  } catch (error) {
    console.error("Error updating brand:", error);
    return res.status(500).json({
      message: "Server error while updating brand",
      error: error.message,
    });
  }
};


const deleteBrandRegister = async (req,res) => {
  const { uuid } = req.params;
  console.log(uuid)

   if (uuid !== req?.brandUser?.uuid) {
    return res.json(
      new ApiResponse(
        401,
        null,
        "Unauthorized request"
      )
    )
  }
  try {
    const deletedBrand = await BrandRegister.findOneAndDelete({uuid : req?.brandUser?.uuid});

    if (!deletedBrand) {
        return res.status(404).json({ error: "Brand not found" });
    }

    res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Brand deleted successfully",
        )
    );
} catch (error) {
    res.status(500).json({ error: "Failed to delete brand", details: error.message });
}
}





export { creatBrandRegister, getBrandByRegisterId, getAllBrandRegister, updateBrandRegister, deleteBrandRegister};
