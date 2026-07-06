// routes/filterBlock.routes.js
import express from "express";
import {
  getFilterBlock,
  updateFilterBlock,
  removeFilterBlock,
} from "../../../../controller/Admin/CMS/FillterBlock/FillterBlockCms.js";

const FilterBlockRouter = express.Router();

FilterBlockRouter.get("/v1/admin/getblocks", getFilterBlock);
FilterBlockRouter.patch("/v1/admin/updateblocks", updateFilterBlock); // checkbox ticked
FilterBlockRouter.patch("/v1/admin/removeblocks", removeFilterBlock); // checkbox unticked

export default FilterBlockRouter;