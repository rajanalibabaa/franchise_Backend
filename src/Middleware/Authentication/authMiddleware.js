import { RegisterSuperAdmin } from "../../model/Admin/superAdmin/registerSuperAdmin.js";
import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { InvsRegister } from "../../model/Investor/invsRegister.js"
import { ThirdPartyAuth } from "../../model/ThirdpartyAuthentication/thirdpartyAuthentication.model.js"
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js"
import jwt from 'jsonwebtoken'

export const verifyJWT = async (req,res,next) => {
 
    const token =  req.cookies?.adminAccessToken || req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ","") || req.body?.AccessToken

    if (!token) {
        return res.json(
            new ApiResponse(
                401, 
                null,
                "token not found pleace login"
            )
        )
    }


    let decodedToken = null;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      try {
        decodedToken = jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN_SECRET);
      } catch (error) {
        return res.json(
          new ApiResponse(401, null, "Unauthorized request, token invalid")
        );
      }
    }
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

    let admin = null
    let brandUser = null
    let investorUser = null
    let thirdPartyUser = null

    if (decodedToken.adminUUID) {
      admin = await RegisterSuperAdmin.findOne({ uuid: decodedToken.adminUUID });
    } else if (decodedToken.brandUserUUID) {
      brandUser = await BrandDetails.findOne({ uuid: decodedToken.brandUserUUID });
    } else if (decodedToken.investorUUID) {
      investorUser = await InvsRegister.findOne({ uuid: decodedToken.investorUUID });
    } else if (decodedToken.thirdPartyUUID) {
      thirdPartyUser = await ThirdPartyAuth.findOne({ uuid: decodedToken.thirdPartyUUID });
    }

    if (!brandUser && !investorUser && !thirdPartyUser && !admin) {
         return res.json(
            new ApiResponse(
                401, 
                null,
                "some think went wrong while getting the  data from database "
            )
        )
    }

    req.brandUser = brandUser
    req.investorUser = investorUser
    req.thirdPartyUser = thirdPartyUser
    req.admin = admin
    next()
}
