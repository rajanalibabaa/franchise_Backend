

import { Router } from "express";
import { createAdminVideoAdvertise, getAdminVideoAdvertise, getAdminVideoAdvertiseTopOne, getAdminVideoAdvertiseTopThree, getAdminVideoAdvertiseTopTwo } from "../../controller/Admin/AdminVideoAdvertiseController.js";

const route = Router()

route.post('/createAdminVideoAdvertise',createAdminVideoAdvertise)
route.get('/getAdminVideoAdvertise',getAdminVideoAdvertise)
route.get('/getAdminVideoAdvertiseTopOne',getAdminVideoAdvertiseTopOne)
route.get('/getAdminVideoAdvertiseTopTwo',getAdminVideoAdvertiseTopTwo)
route.get('/getAdminVideoAdvertiseTopThree',getAdminVideoAdvertiseTopThree)


export default route