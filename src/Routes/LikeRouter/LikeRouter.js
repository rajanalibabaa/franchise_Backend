import { Router } from 'express';

import { verifyJWT } from '../../Middleware/Authentication/authMiddleware.js';
import { deleteFavoriteBrand, getAllFavoriteBrandsByID, getAllLikedAndUnlikedBrand, toggleFavoriteBrand } from '../../controller/Like/LikeController.js';


const likeRouter = Router();


likeRouter.post('/post-favbrands',verifyJWT,toggleFavoriteBrand)


likeRouter.get('/get-favbrands/:uuid',verifyJWT,getAllFavoriteBrandsByID)

likeRouter.delete('/delete-favbrand/:uuid',verifyJWT,deleteFavoriteBrand)

likeRouter.get('/favbrands/getAllLikedAndUnlikedBrand/:uuid',verifyJWT,getAllLikedAndUnlikedBrand)



export { likeRouter };
