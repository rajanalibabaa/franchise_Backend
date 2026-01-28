import { Router } from 'express';

import { verifyJWT } from '../../Middleware/Authentication/authMiddleware.js';
import { deleteFavoriteBrand, getAllFavoriteBrandsByID, getAllLikedAndUnlikedBrand, getBrandLikedByAll, toggleFavoriteBrand } from '../../controller/Like/LikeController.js';

const likeRouter = Router();

likeRouter.post('/v1/like/post-favbrands',verifyJWT,toggleFavoriteBrand)

likeRouter.get('/v1/like/get-favbrands/:uuid',verifyJWT,getAllFavoriteBrandsByID)

likeRouter.delete('/v1/like/delete-favbrand/:uuid',verifyJWT,deleteFavoriteBrand)

likeRouter.get('/v1/like/favbrands/getAllLikedAndUnlikedBrand/:uuid',verifyJWT,getAllLikedAndUnlikedBrand)

likeRouter.get('/v1/like/getBrandLikedByAll/:uuid',verifyJWT,getBrandLikedByAll)


export { likeRouter };
