import { ApiResponse } from "../../Middleware/ApiResponse"
import { ThirdPartyAuth } from "../../model/ThirdpartyAuthentication/thirdpartyAuthentication.model"


const investorLogin = async (req,res) => {
    
    const {email,phone} = req.body

    if (!email || !phone) {
        return res.json(
            new ApiResponse(
                400,
                null,
                " Please provide email or phone number"
            )
        )
    }

    const data = await ThirdPartyAuth.findOne({
        $or:[
            { email: email },
            { phone: phone }
        ]
    })
    
}