

import { Router } from "express";
import { createAdminVideoAdvertise, getAdminVideoAdvertise, getAdminVideoAdvertiseTopOne, getAdminVideoAdvertiseTopThree, getAdminVideoAdvertiseTopTwo, postAdminVideoAdvertiseTopOne, postAdminVideoAdvertiseTopThree, postAdminVideoAdvertiseTopTwo } from "../../controller/Admin/AdminVideoAdvertiseController.js";
import upload from "../../utils/Uploads/multerConfig.js";

export const videoAdvertiseRoute = Router()

videoAdvertiseRoute.post('/createAdminVideoAdvertise',upload.fields([
    {
        name: 'videos', maxCount: 10
    },
    {
        name: 'thumbnail', maxCount: 1    
    }
]) ,createAdminVideoAdvertise)
videoAdvertiseRoute.get('/getAdminVideoAdvertise',getAdminVideoAdvertise)
videoAdvertiseRoute.get('/getAdminVideoAdvertiseTopOne',getAdminVideoAdvertiseTopOne)
videoAdvertiseRoute.get('/getAdminVideoAdvertiseTopTwo',getAdminVideoAdvertiseTopTwo)
videoAdvertiseRoute.get('/getAdminVideoAdvertiseTopThree',getAdminVideoAdvertiseTopThree)

videoAdvertiseRoute.post('/postAdminVideoAdvertiseTopOne',postAdminVideoAdvertiseTopOne)
videoAdvertiseRoute.post('/postAdminVideoAdvertiseTopTwo',postAdminVideoAdvertiseTopTwo)
videoAdvertiseRoute.post('/postAdminVideoAdvertiseTopThree',postAdminVideoAdvertiseTopThree)


 