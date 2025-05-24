import { Router } from 'express';
import { createInvestor, deleteInvestor, getAllInvestors, getInvestorByUUID,  updateInvestor,deleteFavoriteBrand,getFavoriteBrands,toggleFavoriteBrand} from '../../controller/InvestorsControllers/InvRegisterController.js';
import { verifyJWT } from '../../Middleware/Authentication/authMiddleware.js';


const InvestorRouter = Router();

// Corrected method usage
InvestorRouter.post('/createInvestor', createInvestor);

InvestorRouter.get('/getInvestor', getAllInvestors);

InvestorRouter.get('/getInvestorByUUID/:uuid', verifyJWT,getInvestorByUUID);

InvestorRouter.patch('/updateInvestor/:uuid',verifyJWT, updateInvestor);

InvestorRouter.delete('/deleteInvestor/:uuid',verifyJWT, deleteInvestor);

InvestorRouter.post('/investor_favbrands/likedbrands',toggleFavoriteBrand)


InvestorRouter.get('/investor_favbrands/favbrands',getFavoriteBrands)

InvestorRouter.delete('/investor_favbrands/:uuid',deleteFavoriteBrand)



export { InvestorRouter };
