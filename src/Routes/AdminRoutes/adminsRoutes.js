
import { Router } from "express";
import { getAllInvestors, getInvestorById } from "../../controller/Admin/AdminPanalController.js";

const route = Router()

route.get('/admin/getAllInvestors',getAllInvestors)
route.post('/admin/getInvestorById/:id',getInvestorById)


export default route