import { Router } from 'express';

import { verifyJWT } from '../../Middleware/Authentication/authMiddleware.js';
import { deleteViewBrandByID, getAllViewBrandByID, getAllViewBrands, postViewBrands } from '../../controller/ViewedBrands/ViewedBrandsControllers.js';

export const ViewedBrandsRouter = Router();

ViewedBrandsRouter.post("/postViewBrands/:id",verifyJWT,postViewBrands)
ViewedBrandsRouter.get("/getAllViewBrandByID/:id",verifyJWT,getAllViewBrandByID)
ViewedBrandsRouter.delete("/deleteViewBrandByID/:id",verifyJWT,deleteViewBrandByID)
ViewedBrandsRouter.get("/getAllViewBrands/:id",verifyJWT,getAllViewBrands)



