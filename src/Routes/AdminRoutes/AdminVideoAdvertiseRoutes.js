

import { Router } from "express";
import { createAdminVideoAdvertise, getAdminVideoAdvertise, getAdminVideoAdvertiseTopOne, getAdminVideoAdvertiseTopThree, getAdminVideoAdvertiseTopTwo, postAdminVideoAdvertiseTopOne, postAdminVideoAdvertiseTopThree, postAdminVideoAdvertiseTopTwo } from "../../controller/Admin/AdminVideoAdvertiseController.js";
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
route.get('/getAdminVideoAdvertiseTopOne',getAdminVideoAdvertiseTopOne)
route.get('/getAdminVideoAdvertiseTopTwo',getAdminVideoAdvertiseTopTwo)
route.get('/getAdminVideoAdvertiseTopThree',getAdminVideoAdvertiseTopThree)

route.post('/postAdminVideoAdvertiseTopOne',postAdminVideoAdvertiseTopOne)
route.post('/postAdminVideoAdvertiseTopTwo',postAdminVideoAdvertiseTopTwo)
route.post('/postAdminVideoAdvertiseTopThree',postAdminVideoAdvertiseTopThree)


export default route