import { BrandRegister } from "../../model/Brand/BrandRegisterModel.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";

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

export { creatBrandRegister };
