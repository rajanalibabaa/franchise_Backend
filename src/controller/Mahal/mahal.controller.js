import { Mahal } from "../../model/Mahal/mahal.model.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import uuid from "../../utils/uuid.js";



export const createBooking = async (req, res) => {
  try {
    const {
      name,
      ph,
      title,
      mahal,
      startDate,
      endDate,
      startTime,
      endTime,
      date,
    } = req.body;

   
    if (!name || !ph) {
      return res.json(
        new ApiResponse(404, null, "Name and phone number are required.")
      );
    }

 
    const generateuuid = uuid();

    const newMahal = await Mahal.create({
      uuid: generateuuid,
      name,
      ph,
      title,
      mahal,
      startDate,
      endDate,
      startTime,
      endTime,
      date,
    });

    return res.json(
      new ApiResponse(200, newMahal, "Mahal booking created successfully.")
    );
  } catch (error) {
    console.error("Error creating Mahal:", error);
    return res.json(
      new ApiResponse(500, null, "Internal server error.")
    );
  }
};



export const getAllBooking = async(req, res) => {
 
    try {
        const data = await Mahal.find({}).sort({ createdAt: -1 })

    if (data.length < 0) {
        return res.json(
             new ApiResponse(400,null,"no mahal booked yet")
        )
    }
    return res.json(
        new ApiResponse(200,data,"Mahal booking created successfully.")
    );
    } catch (error) {
        console.error("Error creating Mahal:", error);
    res.json(
        new ApiResponse(500,null,"Internal server error.")
    );
    }
};
export const deleteBooking = (req, res) => {
  console.log("deleteBooking");
};
