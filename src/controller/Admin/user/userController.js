import { BrandDetails } from "../../../model/Brand/Brand.model/BrandDetails.model.js";
import { instantApply } from "../../../model/Brand/brandFranchiseApply.js";
import NewIncomingBrands from "../../../model/Brand/newIncomigBrands.js";
import { InvsRegister } from "../../../model/Investor/invsRegister.js";
import { ApiResponse } from "../../../utils/ApiResponse/ApiResponse.js";

export const userCount = async(req,res) => {
    

    const brandsCount = await BrandDetails?.countDocuments() || 0
    const newBrandsCount = await NewIncomingBrands?.countDocuments() || 0
    const investorsCount = await InvsRegister?.countDocuments() || 0
    const instantApplyCount = await instantApply?.countDocuments() || 0


    return res.json(
        new ApiResponse(200,{brandsCount,newBrandsCount,investorsCount,instantApplyCount},"all user count fetch successfully")
    )
}