import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";

const logOut = async (req,res) => {
    const { uuid } = req.params;
      // console.log(uuid)

      if (!uuid) {
        return res.status(400).json({ error: "UUID parameter is required" });
      }

      
  
        const matchedUser =
    (req?.investorUser && req?.investorUser?.uuid === uuid) ||
    (req?.brandUser && req.brandUser?.uuid === uuid);

    console.log("matchedUser :",matchedUser)

  if (!matchedUser) {
    return res.status(403).json(
      new ApiResponse(403, null, "Unauthorized access to this resource.")
    );
  }

      const option = {
         httpOnly: true,
        secure: process.env.NODE_ENV === "production", 
        sameSite: "Lax",
        path: "/",
      }

      return res.clearCookie("AccessToken",option)
      .json(
        new ApiResponse(200, null, "User logged out successfully.")
      )
}


export {
    logOut
}