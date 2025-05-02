import { InvsRegister } from "../../model/Investor/invsRegister.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";


const getAllInvestors = async (req, res) => {
    try {
      const investors = await InvsRegister.find()
      return res.json(
        new ApiResponse(200, investors, "All Investors Fetched Successfully")
      )
      
    } catch (error) {
      console.error("Error fetching investors:", error);
      return res.status(500).json(
        new ApiResponse(500, null, "Internal Server Error")
      );
    }
  };

const getInvestorById = async (req, res) => {

  console.log("Fetching investor by ID...");
    const { id } = req.params;
    console.log("ID:", id);
    try {
      const investor = await InvsRegister.findById(id);
      if (!investor) {
        return res.status(404).json(
          new ApiResponse(404, null, "Investor Not Found")
        );
      }
      return res.json(
        new ApiResponse(200, investor, "Investor Fetched Successfully")
      );
    } catch (error) {
      console.error("Error fetching investor:", error);
      return res.status(500).json(
        new ApiResponse(500, null, "Internal Server Error")
      );
    }
  }

  export { 
    getAllInvestors,
    getInvestorById
   };