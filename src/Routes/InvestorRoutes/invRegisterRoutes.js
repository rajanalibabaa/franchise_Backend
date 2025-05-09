import { Router } from 'express';
import { createInvestor, deleteInvestor, getAllInvestors, getInvestorByUUID, updateInvestor } from '../../controller/InvestorsControllers/InvRegisterController.js';
import { verifyInvestor } from '../../Middleware/Authentication/AuthMiddleware.js';


const InvestorRouter = Router();

// Corrected method usage
InvestorRouter.post('/createInvestor', createInvestor);

InvestorRouter.get('/getInvestor', getAllInvestors);

InvestorRouter.get('/getInvestorByUUID/:uuid', verifyInvestor,getInvestorByUUID);

InvestorRouter.patch('/updateInvestor/:uuid',verifyInvestor, updateInvestor);

InvestorRouter.delete('/deleteInvestor/:uuid',verifyInvestor, deleteInvestor);

export { InvestorRouter };
