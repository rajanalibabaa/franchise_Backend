import { Router } from 'express';
import { createInvestor, deleteInvestor, getAllInvestors, getInvestorByUUID,  updateInvestor} from '../../controller/InvestorsControllers/InvRegisterController.js';
import { verifyJWT } from '../../Middleware/Authentication/authMiddleware.js';


const InvestorRouter = Router();

// Corrected method usage
InvestorRouter.post('/createInvestor', createInvestor);

InvestorRouter.get('/getInvestor', getAllInvestors);

InvestorRouter.get('/getInvestorByUUID/:uuid', verifyJWT,getInvestorByUUID);

InvestorRouter.patch('/updateInvestor/:uuid',verifyJWT, updateInvestor);

InvestorRouter.delete('/deleteInvestor/:uuid',verifyJWT, deleteInvestor);

// InvestorRouter.post('/investor_favbrands/likedbrands',verifyJWT,toggleFavoriteBrand)


// InvestorRouter.get('/investor_favbrands/favbrands/:uuid',verifyJWT,getFavoriteBrandsLikedByInvestorID)

// InvestorRouter.delete('/investor_favbrands/delete/:uuid',verifyJWT,deleteFavoriteBrand)

// InvestorRouter.get('/investor_favbrands/getAllLikedAndUnlikedBrand/:uuid',verifyJWT,getAllLikedAndUnlikedBrand)



export { InvestorRouter };
