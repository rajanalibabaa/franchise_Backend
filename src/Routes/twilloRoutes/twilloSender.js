import  express  from "express";
import { requestMobileOtp } from "../../controller/BrandController/sendOTPController";
const router = express.Router();

router.post('/sendOTPSms', requestMobileOtp)
export default router;
