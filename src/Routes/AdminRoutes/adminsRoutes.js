
import { Router } from "express";
import { getAllInvestors, getInvestorById } from "../../controller/Admin/AdminPanalController.js";

const route = Router()

route.get('/v1/admin/getAllInvestors',getAllInvestors)
route.post('/v1/admin/getInvestorById/:id',getInvestorById)


export default route