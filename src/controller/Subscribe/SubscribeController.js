import { SubscribeModel } from "../../model/Subscribe/subscribeModel.js"
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js"

export const getSubscribe = async (req,res) => {
    
    const email = req.body.email

    if (!email) {
        return res.json(
            new ApiResponse(
                404,
                {},
                "email is required"
            )
        )
    }



     if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res
        .json(new ApiResponse(400, null, "Invalid email format"));
        
    }


    // email already esixts

    const exists = await SubscribeModel.findOne({email})

    if (exists) {
        return res
        .json(new ApiResponse(400, null, "email already exists"));
    }
    


    const data = await SubscribeModel.create(
        {
            email
        }
    )

    // console.log(data)

 

    if (!data) {
         return res.json(
            new ApiResponse(
                404,
                {},
                "Something went wrong while storing the data in database "
            )
        )
    }


    return res.json(
            new ApiResponse(
                200,
                {},
               "Thanks for subscribing!"
            )
        )

}