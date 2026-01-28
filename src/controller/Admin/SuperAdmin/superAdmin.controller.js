import { RegisterSuperAdmin } from "../../../model/Admin/superAdmin/registerSuperAdmin.js";
import { ApiResponse } from "../../../utils/ApiResponse/ApiResponse.js";
import uuid from "../../../utils/uuid.js";

export const createSuperAdmin = async (req, res) => {
  const { adminName, adminEmail } = req.body
  // console.log('req.body',req.body);
  //   res.json('Create Super Admin SuccessFully')

  if (!adminName || !adminEmail) {
    return res.json(
      new ApiResponse(400, {}, "All fields are required")
    )

  }


  if (adminEmail && !/^\S+@\S+\.\S+$/.test(adminEmail)) {
    return res
      .json(new ApiResponse(400, null, "Invalid email format"));
  }

  const exist = await RegisterSuperAdmin.findOne({
    adminEmail
  })

  if (exist) {
    return res.json(
      new ApiResponse(301, {}, 'Email Already Exist')
    )
  }
  const generateUUId = uuid()
  // console.log("generateUUId :", generateUUId)

  const submitSuperAdmin = await RegisterSuperAdmin.create({
    adminName,
    adminEmail,
    uuid: generateUUId
  })

  return res.json(
    new ApiResponse(200, { submitSuperAdmin }, 'Super Admin Register Successfully')
  )
}