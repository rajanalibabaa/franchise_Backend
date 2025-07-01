

import { Router } from "express";
import { createAdminVideoAdvertise, getAdminVideoAdvertise, getAdminVideoAdvertiseTopOne, getAdminVideoAdvertiseTopThree, getAdminVideoAdvertiseTopTwo, postAdminVideoAdvertiseTopOne, postAdminVideoAdvertiseTopThree, postAdminVideoAdvertiseTopTwo } from "../../controller/Admin/AdminVideoAdvertiseController.js";
import upload from "../../utils/Uploads/multerConfig.js";

export const videoAdvertiseRoute = Router()

videoAdvertiseRoute.post('/v1/admin/videoAdvertise/createAdminVideoAdvertise',upload.fields([
    {
        name: 'videos', maxCount: 10
    },
    {
        name: 'thumbnail', maxCount: 1    
    }
]) ,createAdminVideoAdvertise)
videoAdvertiseRoute.get('/v1/admin/videoAdvertise/getAdminVideoAdvertise',getAdminVideoAdvertise)
videoAdvertiseRoute.get('/v1/admin/videoAdvertise/getAdminVideoAdvertiseTopOne',getAdminVideoAdvertiseTopOne)
videoAdvertiseRoute.get('/v1/admin/videoAdvertise/getAdminVideoAdvertiseTopTwo',getAdminVideoAdvertiseTopTwo)
videoAdvertiseRoute.get('/v1/admin/videoAdvertise/getAdminVideoAdvertiseTopThree',getAdminVideoAdvertiseTopThree)

videoAdvertiseRoute.post('/v1/admin/videoAdvertise/postAdminVideoAdvertiseTopOne',postAdminVideoAdvertiseTopOne)
videoAdvertiseRoute.post('/v1/admin/videoAdvertise/postAdminVideoAdvertiseTopTwo',postAdminVideoAdvertiseTopTwo)
videoAdvertiseRoute.post('/v1/admin/videoAdvertise/postAdminVideoAdvertiseTopThree',postAdminVideoAdvertiseTopThree)


 