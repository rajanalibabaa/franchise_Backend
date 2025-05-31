
import { Router } from "express";
import { filterByCatogoryLocationInvRange } from "../../controller/Filter/filterController.js";


export const filterRouter = Router();

filterRouter.post("/filterByCatogoryLocationInvRange",filterByCatogoryLocationInvRange)
