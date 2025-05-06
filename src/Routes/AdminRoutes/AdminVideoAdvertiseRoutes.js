

import { Router } from "express";
import { createAdminVideoAdvertise, getAdminVideoAdvertise, getAdminVideoAdvertiseTopOne, getAdminVideoAdvertiseTopThree, getAdminVideoAdvertiseTopTwo } from "../../controller/Admin/AdminVideoAdvertiseController.js";
import upload from "../../utils/Uploads/multerConfig.js";

const route = Router()

route.post('/createAdminVideoAdvertise',upload.fields([
    {
        name: 'videos', maxCount: 10
    },
    {
        name: 'thumbnail', maxCount: 1    
    }
]) ,createAdminVideoAdvertise)
route.get('/getAdminVideoAdvertise',getAdminVideoAdvertise)
route.post('/getAdminVideoAdvertiseTopOne',getAdminVideoAdvertiseTopOne)
route.post('/getAdminVideoAdvertiseTopTwo',getAdminVideoAdvertiseTopTwo)
route.post('/getAdminVideoAdvertiseTopThree',getAdminVideoAdvertiseTopThree)


export default route