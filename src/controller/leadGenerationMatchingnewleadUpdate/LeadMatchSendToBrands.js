import {BrandDetails} from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { sendInstantApplyEmail } from "../../utils/Centralized Email/centralizedEmail.js";

export const FindBrandSendLeadToBrands = async (req, res) => {
    try {
        const { brandOwnerId } = req.body;


        const EnquiryData= req.body;

        // console.log("EnquiryData", EnquiryData);

        if (
            !brandOwnerId ||
            !Array.isArray(brandOwnerId) ||
            brandOwnerId.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Brand owner IDs are required",
            });
        }

        const matchingBrands = await BrandDetails.find({
            uuid: { $in: brandOwnerId },
        })

const emails = matchingBrands.map(
  (brand) => brand?.brandDetails?.email
);

// console.log("All Emails:", emails);

// Send email to every matched brand
   await Promise.all(
  matchingBrands.map(async (brand) => {
    await sendInstantApplyEmail({
        InvstorId: EnquiryData?.investorId,
        brandOwnerId: brand?.uuid,
      fullName: EnquiryData?.investorName,
      email: EnquiryData?.investorEmail,
      mobileNumber: EnquiryData?.investorPhone,
      investmentRange: EnquiryData?.investmentRange,
      industry: EnquiryData?.Industry,
      category: EnquiryData?.Category,
      state: EnquiryData?.state,
      district: EnquiryData?.district,
      planToInvest: EnquiryData?.planToInvest,
      readyToInvest: EnquiryData?.readyToInvest,
      brandName: brand?.brandDetails?.brandName,
      brandEmail: brand?.brandDetails?.email,
    });
  })
);



        return res.status(200).json({
            success: true,
            totalBrands: matchingBrands.length,
            matchingBrands: matchingBrands.map((brand) => ({
                brandOwnerId: brand.uuid,
                brandName: brand?.brandDetails?.brandName,
                email: brand?.brandDetails?.email,
                mobileNumber: brand?.brandDetails?.mobileNumber,

            })),
        });
    } catch (error) {
        console.error("Error finding matching brands:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while finding matching brands.",
        });
    }
};