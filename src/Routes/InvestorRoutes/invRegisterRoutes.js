import { Router } from 'express';
import { createInvestor, deleteInvestor, getAllInvestors, getInvestorByUUID, updateInvestor } from '../../controller/InvestorsControllers/InvRegisterController.js';
import { verifyJWT } from '../../Middleware/Authentication/AuthMiddleware.js';


const InvestorRouter = Router();

// Corrected method usage
InvestorRouter.post('/createInvestor', createInvestor);

InvestorRouter.get('/getInvestor', getAllInvestors);

InvestorRouter.get('/getInvestorByUUID/:uuid', verifyJWT,getInvestorByUUID);

InvestorRouter.patch('/updateInvestor/:uuid',verifyJWT, updateInvestor);

InvestorRouter.delete('/deleteInvestor/:uuid',verifyJWT, deleteInvestor);

export { InvestorRouter };
