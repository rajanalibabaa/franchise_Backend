
import { Router } from "express";
import { investorLogin } from "../controller/Login/InvestorLogin.js";

const route = Router()

route.post('/investor',investorLogin)


export default route