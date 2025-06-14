
import {OtherIndustriesModel} from "../../model/OtherIndustries/OtherIndustriesModel.js"
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";



export const recievingOtherIndustriesData = async (req,res) => {
    const  {name, email,  mobileNumber, registerAs, category, message} = req.body
  console.log(req.body);

  if (!name || !email || !mobileNumber || !registerAs || !category ) {
    return res.json(
        new ApiResponse(
            404,
            {},
            "All the details are required"
        )
    )
  }

//   console.log(req.body);
  
//   const exists = await OtherIndustriesModel.find({email})    
//   console.log("===== ;",exists)     

const exists = await OtherIndustriesModel.findOne({email})

  if (exists) {
    return res.status(409).json(
        new ApiResponse
        (
            409,
            null,
            "Already Exists"
    ))
    
  }

  const newRecievingOtherIndustriesData = await OtherIndustriesModel ({
       name,
       email,
       mobileNumber,
       registerAs,
       category,
       message
  })

  

    await newRecievingOtherIndustriesData.save();

    if (!newRecievingOtherIndustriesData) {
    return res.json(
         new ApiResponse(
            404,
            null,
            "Something went wrong while storing the data in database "
            
         )
    )
    // console.log();
    
  }
    return res.json(        new ApiResponse(
            200,
            {},
            "Successfully submitted"
        )
    )
}
