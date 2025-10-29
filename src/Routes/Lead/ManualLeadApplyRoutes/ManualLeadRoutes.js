

import express from "express";

import { createLead,deleteLead,getAllLeads,getLeadByUUID,updateLead,getLeadStats} from "../../../controller/Leads/ManualLeadController.js";

const ManualLeadRouter = express.Router();

ManualLeadRouter.post("/createlead",createLead)
ManualLeadRouter.get("/getallleads",getAllLeads)
ManualLeadRouter.get("/getleadbyuuid/:uuid",getLeadByUUID)
ManualLeadRouter.put("/updatelead/:id",updateLead)
ManualLeadRouter.delete("/deletelead/:id",deleteLead)
ManualLeadRouter.get("/getleadstats",getLeadStats)

export default ManualLeadRouter