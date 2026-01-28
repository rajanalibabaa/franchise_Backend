import { Router } from 'express';
import { deleteShortListedById, getShortListedById, getShortListedDataForOwner, postShortListed } from '../../controller/ShortListeController/shortListController.js';
import { verifyJWT } from '../../Middleware/Authentication/authMiddleware.js';

const shortListRouter = Router();

shortListRouter.post('/v1/shortList/post/:id',verifyJWT,postShortListed)
shortListRouter.get('/v1/shortList/getShortListedById/:id',verifyJWT,getShortListedById)
shortListRouter.get('/v1/shortList/getShortListedDataForOwner/:id',verifyJWT,getShortListedDataForOwner)
shortListRouter.delete('/v1/shortList/deleteShortListedById/:id',verifyJWT,deleteShortListedById)

export { shortListRouter };
