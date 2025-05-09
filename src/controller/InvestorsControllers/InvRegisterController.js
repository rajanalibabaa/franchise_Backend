import { InvsRegister } from "../../model/Investor/invsRegister.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import uuid from "../../utils/uuid.js";


export const createInvestor = async (req, res) => {
  try {
    const {
      firstName,
      mobileNumber,
      whatsappNumber,
      email,
      address,
      country,
      pincode,
      state,
      district,
      city,
      category,
      investmentRange,
      occupation,
      propertytype,
      lookingFor
    } = req.body;

    // console.log("Incoming data:", req.body);

    
    
    const exists = await InvsRegister.findOne({
      $or: [
        { email },
        { mobileNumber }
      ]
    });

    if (exists) {
      return res.status(409).json(
        new ApiResponse(
          409,
          null,
          "Investor already exists"
        )
      );
    }

    const investor = new InvsRegister({
      firstName,
      mobileNumber,
      whatsappNumber,
      email,
      address,
      country,
      pincode,
      state,
      district,
      city,
      category,
      investmentRange,
      occupation,
      propertytype,
      lookingFor,
      uuid: uuid()
    });

    await investor.save();

    return res.status(201).json(
      new ApiResponse(201, null, "Investor created successfully")
    );
  } catch (err) {
    console.error("Create Investor Error:", err);
    return res.status(400).json({
      error: "Failed to create investor",
      details: err.message
    });
  }
};


  export const getAllInvestors = async (req, res) => {
    try {
      const investors = await InvsRegister.find({});
      res.status(200).json(investors);
    } catch (err) {
      res.status(500).json({ error: err.message });  
    }
  };
  

export const getInvestorByUUID = async (req, res) => {
  try {

    // console.log(req.investorUser.uuid)
    const { uuid } = req.params;


  

    // console.log(uuid)

    if (req.investorUser.uuid !== uuid) {
      return res.json(
        new ApiResponse(
          403,
          null,
          "Unauthorized access to this resource"
        )
      )
    }

    const investor = await InvsRegister.findOne({ uuid:req.investorUser.uuid }).select("-__v -_id -createdAt -updatedAt");

    if (!investor) {
      return res.status(404).json(
        new ApiResponse(404, null, "Investor not found")
      );
    }

    return res.status(200).json(
      new ApiResponse(200, investor, "Investor retrieved successfully")
    );
  } catch (err) {
    console.error("Error fetching investor:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
};

  
export const updateInvestor = async (req, res) => {
  try {
    const { uuid } = req.params;
    const {
      firstName,
      mobileNumber,
      whatsappNumber,
      email,
      address,
      country,
      pincode,
      state,
      district,
      city,
      category,
      investmentRange,
      occupation,
      propertytype,
      lookingFor
    } = req.body;


    // console.log(uuid)
    // console.log(req.body)
    // console.log(req.investorUser.uuid)
    
    if (!uuid) {
      return res.status(400).json({ error: "UUID parameter is required" });
    }

    if (req.investorUser.uuid !== uuid) {
      return res.json(
        new ApiResponse(
          403,
          null,
          "Unauthorized access to this resource"
        )
      )
    }

    const updatedInvestor = await InvsRegister.findOneAndUpdate(
      { uuid:req.investorUser.uuid },
      {
        firstName,
        mobileNumber,
        whatsappNumber,
        email,
        address,
        country,
        pincode,
        state,
        district,
        city,
        category,
        investmentRange,
        occupation,
        propertytype,
        lookingFor
      }
    )



    if (!updatedInvestor) {
      return res.status(404).json(
        new ApiResponse(404, null, "Investor not found")
      );
    }

    const data = await InvsRegister.findById(updatedInvestor._id).select("-__v -_id -createdAt -updatedAt");

    return res.status(200).json(
      new ApiResponse(
        200,
        data,
       "Investor updated successfully"
      )
    );
  } catch (err) {
    console.error("Update investor error:", err);
    return res.status(400).json({
      error: "Failed to update investor",
      details: err.message,
    });
  }
};

  
  export const deleteInvestor = async (req, res) => {
    const { uuid } = req.params;
      // console.log(uuid)

      if (!uuid) {
        return res.status(400).json({ error: "UUID parameter is required" });
      }
  
      if (req.investorUser.uuid !== uuid) {
        return res.json(
          new ApiResponse(
            403,
            null,
            "Unauthorized access to this resource"
          )
        )
      }
      try {
        // console.log("======================")
        const deletedBrand = await InvsRegister.findOneAndDelete({uuid :req.investorUser.uuid });
        // console.log("==========: ",deletedBrand)
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
  };