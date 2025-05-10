import jwt from 'jsonwebtoken'
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js"
import { InvsRegister } from '../../model/Investor/invsRegister.js'


export const verifyInvestor = async (req,res,next) => {
    const token = req.cookies?.investorAccessToken || req.header("Authorization")?.replace("Bearer ","")

    // console.log("======== : ",token)
    if (!token) {
        return res.json(
            new ApiResponse(
                401, 
                null,
                "Unauthorized request"
            )
        )
    }

    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

    // console.log("decodedToken : ",decodedToken)
    const investorUser = await InvsRegister.findOne({ uuid: decodedToken.uuid });


    // console.log("investorUser : ",investorUser)

    req.investorUser = investorUser
    next()
}