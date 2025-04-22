import { InvsRegister } from "../../model/Investor/invsRegister.js";
import { ApiResponse } from "../../utils/ApiResponse.js";


const getAllInvestors = async (req, res) => {
    try {
      const investors = await InvsRegister.find()
      // return res.json(
      //   new ApiResponse(200, investors, "All Investors Fetched Successfully")
      // )
      
      return res.render('adminPanal/admin', {
        title: "All Investors",
        investors,
      });
    } catch (error) {
      console.error("Error fetching investors:", error);
      return res.status(500).json(
        new ApiResponse(500, null, "Internal Server Error")
      );
    }
  };



  export { 
    getAllInvestors,
   };