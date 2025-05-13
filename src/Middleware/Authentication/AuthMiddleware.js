import { BrandRegister } from "../../model/Brand/BrandRegisterModel.js"
import { InvsRegister } from "../../model/Investor/invsRegister.js"
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js"
import jwt from 'jsonwebtoken'

export const verifyJWT = async (req,res,next) => {
    
    const token = req.body || req.header("Authorization")?.replace("Bearer ","") || req.header['authorization'] || req.cookies?.AccessToken 

    // console.log("ttttttttt: ",token)

    if (!token) {
        return res.json(
            new ApiResponse(
                401, 
                null,
                "Unauthorized request token not found pleace login"
            )
        )
    }

    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

    //  console.log("decodedToken: ",decodedToken)
    if (!decodedToken) {
        return res.json(
            new ApiResponse(
                401, 
                null,
                "Unauthorized request token not match"
            )
        )
    }

    const brandUser = await BrandRegister?.findOne({ uuid: decodedToken.brandUserUUID })
    const investorUser = await InvsRegister.findOne({ uuid: decodedToken.investorUUID });
    console.log("brandUser: ",brandUser)

    if (!brandUser && !investorUser) {
         res.json(
            new ApiResponse(
                401, 
                null,
                "some think went wrong while getting the  data from database "
            )
        )
    }

    req.brandUser = brandUser
    req.investorUser = investorUser
    next()
}