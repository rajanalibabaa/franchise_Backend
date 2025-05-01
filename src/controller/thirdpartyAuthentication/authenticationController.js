
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ThirdPartyAuth } from "../../model/ThirdpartyAuthentication/thirdpartyAuthentication.model.js";

import uuid from "../../utils/uuid.js";

const googleAuthProfile = async (req,res) => {
    if (req.isAuthenticated()) {
        const user = req.user;
      
        const firstName = user.name?.givenName;
        const lastName = user.name?.familyName;
        const email = user.emails?.[0].value;
        const profilePhoto = user.photos?.[0].value;
        const phone = user.phoneNumbers?.[0]?.value;
        // const accessToken = user.accessToken;
        
        // console.log("===== :", uuid());
       

        const exists = await ThirdPartyAuth.findOne({
            $and: [
              { email: email },
              { source: "google" }
            ]
          });
        if(exists){
            return res.json(
                new ApiResponse(
                    409 ,
                    null,
                    " user already exists"
                )
            )
        }

        const data = await ThirdPartyAuth.create({
            firstName,
            lastName,
            email,
            profilePhoto,
            phone,
            source: "google",
            uuid: uuid()
        })

        if (!data) {
            return res.json(
                new ApiResponse(
                    400,
                    null,
                    "user not created"
                )
            )
        }

      
        return res.json(
          new ApiResponse(
            200,
            {
             Data: data,
            //  accessToken: accessToken,
            },
            "User profile fetched successfully"
          )
        );
      } else {
        res.redirect('/api/v1/auth/google');
      }
      
}


const facebookAuthProfile = async(req,res) => {
    if (req.isAuthenticated()){
        const user = req.user;
        console.log("user : ", user)
        const firstName = user.name?.givenName || user.displayName
        const lastName = user.name?.familyName || user.familyName
        const email = user.emails?.[0].value
        const profilePhoto = user.photos?.[0].value
        const phone = user.phoneNumbers?.[0]?.value
        // const accessToken = user.accessToken

        console.log("user : ", firstName , lastName , email , profilePhoto, phone)

        const exists = await ThirdPartyAuth.findOne({
            $and: [
              { email: email },
              { source: "facebook" }
            ]
          });
        if(exists){
            return res.json(
                new ApiResponse(
                    409 ,
                    null,
                    " user already exists"
                )
            )
        }

        const data = await ThirdPartyAuth.create({
            firstName,
            lastName,
            email,
            profilePhoto,
            phone,
            source: "facebook",
            uuid: uuid()
        })

        if (!data) {
            return res.json(
                new ApiResponse(
                    400,
                    null,
                    "user not created"
                )
            )
        }

      
        return res.json(
          new ApiResponse(
            200,
            {
             Data: data,
            //  accessToken: accessToken,
            },
            "User profile fetched successfully"
          )
        );
    } else {
        res.redirect('/api/v1/auth/facebook');
      }
}
export {
    googleAuthProfile,
    facebookAuthProfile
}