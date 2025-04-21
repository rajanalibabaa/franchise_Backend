
import { Router } from "express";
import { getInvestorData, investorLogin } from "../controller/Login/InvestorLogin.js";

const route = Router()

route.post('/login',investorLogin)
route.post('/getInvestorData',getInvestorData)


export default route