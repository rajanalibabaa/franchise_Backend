import express from "express";
import {getLeadsBybrandId} from "../../controller/Leads/leadsControllers.js";


export const brandleadsRouter = express.Router();

brandleadsRouter.get("/v1/getleadsbybrandid/:id",getLeadsBybrandId);

