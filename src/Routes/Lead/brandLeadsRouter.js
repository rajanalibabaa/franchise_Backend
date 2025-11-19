import express from "express";
import {getLeadsBybrandId} from "../../controller/Leads/leadsControllers.js";


const brandleadsRouter=express.Router();

brandleadsRouter.get("/getleadsbybrandid/:brandId",getLeadsBybrandId);

export default brandleadsRouter;