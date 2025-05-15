import { BrandRegister } from "../../model/Brand/BrandRegisterModel.js"
import { InvsRegister } from "../../model/Investor/invsRegister.js"
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js"
import jwt from 'jsonwebtoken'

export const verifyJWT = async (req,res,next) => {

    // console.log("AccessToken",req.body?.AccessToken)

    // console.log("req.cookies?.AccessToken :",req.cookies?.AccessToken )
    
    // const token = req.body?.AccessToken || req.header("Authorization")?.replace("Bearer ","") || req.header['authorization'] 
    const token =  req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ","") || req.body?.AccessToken

    // console.log("ttttttttt: ",req.cookies?.AccessToken)
    console.log("============== : ",req.header("Authorization")?.replace("Bearer ","") )

    if (!token) {
        return res.json(
            new ApiResponse(
                401, 
                null,
                "token not found pleace login"
            )
        )
    }

    // if (token !== req.cookies?.AccessToken ) {
    //     return res.json(
    //         new ApiResponse(
    //             401, 
    //             null,
    //             "Unauthorized request pleace login"
    //         )
    //     )
    // }
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
    // console.log("brandUser: ",brandUser)
    // console.log("investorUser: ",investorUser)

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