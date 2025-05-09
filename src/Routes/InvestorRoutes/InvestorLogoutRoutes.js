import { Router } from "express";
import { investorlogOut } from "../../controller/Logout/InvestorLogout.js";


const InvestorLogoutRoutes = Router()

InvestorLogoutRoutes.post("/investorlogOut",investorlogOut)

export { InvestorLogoutRoutes }