
import { Router } from "express";
import { getAllInvestors, getInvestorById } from "../../controller/Admin/AdminPanalController.js";

const route = Router()

route.get('/getAllInvestors',getAllInvestors)
route.post('/getInvestorById/:id',getInvestorById)


export default route