
import { Router } from 'express';
import {createInvestor,
getInvestorByUUID,
getAllInvestors,
getInvestorById,
updateInvestor, 
deleteInvestor,} from '../controller/InvestorsControllers/InvRegisterController.js'
import {validateInvestor} from '../Validation/InvesterListing/InvesterListing.js'

const router = Router()

router.post('/createInvestor',validateInvestor, createInvestor);

router.get('/getInvestor', getAllInvestors);

router.get('/getInvestor/:id', getInvestorById);

router.get('/getInvestor/:uuid', getInvestorByUUID);

router.put('/getInvestor/:id', updateInvestor);

router.delete('/getInvestor/:id', deleteInvestor);


export default router;