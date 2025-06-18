import { Router } from "express";
import { recievingOtherIndustriesData } from "../../controller/OtherIndustries/OtherIndustriesController.js";

export const OtherIndustriesRouter = Router()

OtherIndustriesRouter.post("/recievingOtherIndustriesData",recievingOtherIndustriesData)