import { RegisterSuperAdmin } from "../../model/Admin/superAdmin/registerSuperAdmin.js";
import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { InvsRegister } from "../../model/Investor/invsRegister.js"
import { ThirdPartyAuth } from "../../model/ThirdpartyAuthentication/thirdpartyAuthentication.model.js"
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js"
import jwt from 'jsonwebtoken'

export const verifyJWT = async (req,res,next) => {
 
    try {
        const token =  req.header("Authorization")?.replace("Bearer ","") || req.body?.AccessToken || req.cookies?.adminAccessToken || req.cookies?.AccessToken 
    
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
        } else {
          return res.json(new ApiResponse(401, null, "User type not recognized"));    
        }

        // console.log("brand token",brandUser)
    
        if (token !== brandUser?.userNewVerifyToken && token !== investorUser?.userNewVerifyToken && token !== thirdPartyUser?.userNewVerifyToken &&token !== admin?.userNewVerifyToken ) {
          return res.json(
                new ApiResponse(
                    401, 
                    null,
                    "token Expired please login"
                )
            )
        }
    
        req.brandUser = brandUser
        req.investorUser = investorUser
        req.thirdPartyUser = thirdPartyUser
        req.admin = admin
        next()
    } catch (error) {
        console.error("Error in verifyJWT:", error);
        return res.json(
            new ApiResponse(500, null, "Internal server error while verifying token")
        );      
    }
}
