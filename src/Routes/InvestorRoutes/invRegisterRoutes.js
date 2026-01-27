import { Router } from 'express';
import { createInvestor, deleteInvestor, deleteInvestorProfileImage, getAllInvestors, getInvestorByUUID,  updateInvestor} from '../../controller/InvestorsControllers/InvRegisterController.js';
import { verifyJWT } from '../../Middleware/Authentication/authMiddleware.js';
import upload from '../../utils/Uploads/multerConfig.js';


const InvestorRouter = Router();

// Corrected method usage
InvestorRouter.post('/v1/investor/createInvestor', createInvestor);

InvestorRouter.get('/v1/investor/getInvestor', getAllInvestors);

InvestorRouter.get('/v1/investor/getInvestorByUUID/:uuid', verifyJWT,getInvestorByUUID);

InvestorRouter.patch('/v1/investor/updateInvestor/:uuid',upload.single("profileImage"),verifyJWT, updateInvestor);

InvestorRouter.delete('/v1/investor/deleteInvestor/:uuid', deleteInvestor);
InvestorRouter.patch('/v1/investor/deleteInvestorProfileImage/:uuid',verifyJWT, deleteInvestorProfileImage);
InvestorRouter.patch(
  '/v1/admin/updateInvestor/:uuid',           // ← New admin endpoint
  upload.single("profileImage"),
  // NO verifyJWT here!
  updateInvestor
);



// InvestorRouter.post('/investor_favbrands/likedbrands',verifyJWT,toggleFavoriteBrand)


// InvestorRouter.get('/investor_favbrands/favbrands/:uuid',verifyJWT,getFavoriteBrandsLikedByInvestorID)

// InvestorRouter.delete('/investor_favbrands/delete/:uuid',verifyJWT,deleteFavoriteBrand)

// InvestorRouter.get('/investor_favbrands/getAllLikedAndUnlikedBrand/:uuid',verifyJWT,getAllLikedAndUnlikedBrand)



export { InvestorRouter };
