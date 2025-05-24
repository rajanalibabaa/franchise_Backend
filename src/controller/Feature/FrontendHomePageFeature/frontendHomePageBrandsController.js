import BrandListing from "../../../model/Brand/brandListingPage.js"
import { ApiResponse } from "../../../utils/ApiResponse.js"

const getAllnewRegisterBrands = async (req,res) => {
    
    try {
        const newRegisterBrands = await BrandListing.find({}).sort({ createdAt : -1 }).select(" -_id -__v -createdAt -updatedAt  -personalDetails.email -personalDetails.email -personalDetails.mobileNumber -personalDetails.whatsappNumber -personalDetails.pancardNumber -personalDetails.gstNumber -personalDetails.facebook -personalDetails.instagram  -personalDetails.linkedin -personalDetails.fullName -brandDetails.pancard -brandDetails.gstCertificate ")
    
        if (!newRegisterBrands) {
            return res.json(
                new ApiResponse(400,null,"No brand registered yet")
            )
        }
    
        return res.json(
            new ApiResponse(200,newRegisterBrands,"All new registered brands")
        )
    } catch (error) {
        return res.json(
            new ApiResponse(500,null,"Internal server error",error)
        )
    }
}

const getbrandsbyCityName = async (req,res) => {
    
    const city  = req.body?.city

    try {
        
            if (!city) {
                const brandsbyCityName = await BrandListing.find({}).select(" -_id -__v -createdAt -updatedAt -uuid -personalDetails.email -personalDetails.email -personalDetails.mobileNumber -personalDetails.whatsappNumber -personalDetails.pancardNumber -personalDetails.gstNumber -personalDetails.facebook -personalDetails.instagram  -personalDetails.linkedin -personalDetails.fullName -brandDetails.pancard -brandDetails.gstCertificate ")
                return res.json(
                    new ApiResponse(200,brandsbyCityName," All brands fetch successfully ")
                )
            }
        
            const brandsbyCityName = await BrandListing.find({
                    "personalDetails.city": city
                }).select(" -_id -__v -createdAt -updatedAt -uuid -personalDetails.email -personalDetails.email -personalDetails.mobileNumber -personalDetails.whatsappNumber -personalDetails.pancardNumber -personalDetails.gstNumber -personalDetails.facebook -personalDetails.instagram  -personalDetails.linkedin -personalDetails.fullName -brandDetails.pancard -brandDetails.gstCertificate ");
        
        
        
            if (!brandsbyCityName) {
                return res.json(
                    new ApiResponse(400,null, " No brand registered yet in this city :" + city)
                )
            }
        
            return res.json(
                new ApiResponse(200,brandsbyCityName," All brands by city name fetch successfully ")
            )
        
    } catch (error) {
        return res.json(
            new ApiResponse(500,null,"Internal server error",error)
        )
    }
}

const getbrandsbyInvestmentRange = async (req, res) => {
  const investmentRangeInput = req.body?.investmentRange;
  console.log("Requested investment range:", investmentRangeInput);


  const projection = "-_id -__v -createdAt -updatedAt -uuid "
    + "-personalDetails.email -personalDetails.mobileNumber -personalDetails.whatsappNumber "
    + "-personalDetails.pancardNumber -personalDetails.gstNumber "
    + "-personalDetails.facebook -personalDetails.instagram -personalDetails.linkedin "
    + "-personalDetails.fullName "
    + "-brandDetails.pancard -brandDetails.gstCertificate";

  try {
    if (!investmentRangeInput || (Array.isArray(investmentRangeInput) && investmentRangeInput.length === 0)) {
      const allBrands = await BrandListing.find({}).select(projection);
      return res.json(
        new ApiResponse(200, allBrands, "All brands fetched successfully")
      );
    }

    const rangeFilter = Array.isArray(investmentRangeInput) ? investmentRangeInput : [investmentRangeInput];

    const filteredBrands = await BrandListing.find({
      "franchiseDetails.modelsOfFranchise.investmentRange": { $in: rangeFilter }
    }).select(projection);

    if (!filteredBrands || filteredBrands.length === 0) {
      return res.json(
        new ApiResponse(404, null, `No brands found in investment range: ${rangeFilter.join(', ')}`)
      );
    }

    console.log("Filtered brands:", filteredBrands.length);

    return res.json(
      new ApiResponse(200, filteredBrands, "Brands filtered by investment range fetched successfully")
    );

  } catch (error) {
    console.error("Error fetching brands by investment range:", error);
    return res.status(500).json(
      new ApiResponse(500, null, "Internal server error", error)
    );
  }
};


export {
    getAllnewRegisterBrands,
    getbrandsbyCityName,
    getbrandsbyInvestmentRange
}