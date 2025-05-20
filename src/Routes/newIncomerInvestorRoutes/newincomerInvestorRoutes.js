import Routes from 'express';
import { newIncomerInvestorController, getNewInvestorLead} from '../../controller/Admin/investorRegisterLeadController.js';

const newIncomerInvestor = Routes.Router();

newIncomerInvestor.post('/newIncomer', newIncomerInvestorController);

newIncomerInvestor.get('/getNewIncomer', getNewInvestorLead)




export default newIncomerInvestor



