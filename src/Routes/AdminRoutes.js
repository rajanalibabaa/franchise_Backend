
import { Router } from "express";
import { getAllInvestors } from "../controller/Admin/AdminPanalController.js";

const route = Router()

route.get('/getAllInvestors',getAllInvestors)


export default route