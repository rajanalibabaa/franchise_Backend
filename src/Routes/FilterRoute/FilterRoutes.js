
import { Router } from "express";
import { filterByCatogoryLocationInvRange } from "../../controller/Filter/filterController.js";


export const filterRouter = Router();

filterRouter.post("/v1/filter/filterByCatogoryLocationInvRange",filterByCatogoryLocationInvRange)
