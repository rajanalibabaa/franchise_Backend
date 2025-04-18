
import { Router } from 'express';
import {
  createInvestor,
  getAllInvestors,
  getInvestorById,
  updateInvestor,
  deleteInvestor,
} from '../controller/InvestorsControllers/InvRegisterController.js'

const router = Router()

router.post('/createInvestor', createInvestor);

router.get('/getInvestor', getAllInvestors);

router.get('/getInvestor/:id', getInvestorById);

router.put('/getInvestor/:id', updateInvestor);

router.delete('/getInvestor/:id', deleteInvestor);


export default router;