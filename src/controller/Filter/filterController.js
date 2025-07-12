import BrandListing from "../../model/Brand/brandListingPage.js"
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js"


export const filterByCatogoryLocationInvRange = async (req,res) => {
    const { catogory , location, invRange } = req.body
    // console.log(req.body)//

    const filterData = await BrandListing.find(
        {
            "personalDetails.city": { $in: [location] },
            "personalDetails.brandCategories":{
                $elemMatch:{
                    main: catogory 
                }
            },
            "franchiseDetails.modelsOfFranchise":{ 
               $elemMatch: {
                investmentRange: invRange
                }
            }
        }
    )

                // console.log(filterData)

    return res.json(new ApiResponse(200, filterData,"Filter data fetch successfully"))
}