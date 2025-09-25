import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";

const logOut = async (req, res) => {
  const { uuid } = req.params;

  if (!uuid) {
    return res.json(new ApiResponse(400, null, "UUID parameter is required"));
  }

  let matchedUser = null;

  const option = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/", 
  };

  // 👇 Log all cookies first
  // await console.log("🔑 Existing cookies from client request:", req.cookies);

  if (req?.admin && req.admin.uuid === uuid) {
    matchedUser = req.admin;

    return res
      .clearCookie("adminAccessToken", option)
      .json(new ApiResponse(200, null, "Admin logged out successfully."));
  } else if (req?.investorUser && req.investorUser.uuid === uuid) {
    matchedUser = req.investorUser;
  } else if (req?.brandUser && req.brandUser.uuid === uuid) {
    matchedUser = req.brandUser;
  } else if (req?.thirdPartyUser && req.thirdPartyUser.uuid === uuid) {
    matchedUser = req.thirdPartyUser;
  }

  // console.log("Matched user:", matchedUser);

  if (!matchedUser) {
    return res.json(
      new ApiResponse(403, null, "Unauthorized access to this resource.")
    );
  }

  res.clearCookie("AccessToken", option);

  return res.json(new ApiResponse(200, null, "User logged out successfully."));
};

export { logOut };
