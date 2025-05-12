import Routes from 'express';
import { newIncomerInvestorController } from '../../controller/newIncomerInvestorController/newIncomerInvestorController.js';


const newIncomerInvestor = Routes.Router();

newIncomerInvestor.post('/newIncomer', newIncomerInvestorController);


export { newIncomerInvestor}



