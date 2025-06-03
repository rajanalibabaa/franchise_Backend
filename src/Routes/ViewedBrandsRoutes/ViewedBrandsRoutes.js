import { Router } from 'express';

import { verifyJWT } from '../../Middleware/Authentication/authMiddleware.js';
import { getAllViewBrands, postViewBrands } from '../../controller/ViewedBrands/ViewedBrandsControllers.js';

export const ViewedBrandsRouter = Router();

ViewedBrandsRouter.post("/postViewBrands/:id",verifyJWT,postViewBrands)
ViewedBrandsRouter.get("/getAllViewBrands/:id",verifyJWT,getAllViewBrands)



