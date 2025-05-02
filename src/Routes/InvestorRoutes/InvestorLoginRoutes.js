
import { Router } from "express";
import { generateOTPforInvestor, getInvestorData, investorLogin } from "../../controller/Login/InvestorLogin.js"

const route = Router()

route.post('/investor',investorLogin)
route.post('/getInvestorData',getInvestorData)
route.post('/generateOTPforInvestor',generateOTPforInvestor)


export default route