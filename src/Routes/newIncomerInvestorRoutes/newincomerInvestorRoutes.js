import Routes from 'express';
import { newIncomerInvestorController } from '../../controller/newIncomerInvestorController/newIncomerInvestorController.js';


const router = Routes.Router();

router.post('/newIncomerInvestor', newIncomerInvestorController);


export default router;


