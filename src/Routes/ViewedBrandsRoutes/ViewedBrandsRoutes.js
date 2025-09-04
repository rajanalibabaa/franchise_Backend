import { Router } from 'express';

import { verifyJWT } from '../../Middleware/Authentication/authMiddleware.js';
import { deleteViewBrandByID, getAllViewBrandByID, getViewBrandsByAll, postViewBrands } from '../../controller/ViewedBrands/ViewedBrandsControllers.js';

export const ViewedBrandsRouter = Router();

ViewedBrandsRouter.post("/v1/view/postViewBrands/:id",verifyJWT,postViewBrands)
ViewedBrandsRouter.get("/v1/view/getAllViewBrandByID/:id",verifyJWT,getAllViewBrandByID)
ViewedBrandsRouter.delete("/v1/view/deleteViewBrandByID/:id",verifyJWT,deleteViewBrandByID)
ViewedBrandsRouter.get("/v1/view/getViewBrandsByAll/:id",verifyJWT,getViewBrandsByAll)   