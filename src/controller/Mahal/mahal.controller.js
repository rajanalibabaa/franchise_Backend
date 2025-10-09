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

    const exist = await Mahal.findOne({
      $and: [{ startDate: startDate }, { mahal: mahal }],
    });

    

    if (exist) {
      return res.json(
        new ApiResponse(
          404,
          null,
          `${mahal} is already booked from ${startDate} ${exist?.startTime } to ${exist?.endDate} ${exist?.endTime}.`

        )
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
    return res.json(new ApiResponse(500, null, "Internal server error."));
  }
};

export const getAllBooking = async (req, res) => {
  try {
    const data = await Mahal.find({})
      .sort({ createdAt: -1 })
      .select("-_id");

    if (!data || data.length === 0) {
      return res.json(
        new ApiResponse(404, [], "No mahal bookings yet.")
      );
    }

    return res.json(
      new ApiResponse(200, data, "Mahal bookings fetched successfully.")
    );
  } catch (error) {
    console.error("Error fetching Mahal bookings:", error);
    res.json(
      new ApiResponse(500, null, "Internal server error.")
    );
  }
};


export const deleteBooking = async (req, res) => {
  const id = req.params.id;

  const findData = await Mahal.findOneAndDelete({ uuid: id });
  if (!findData) {
    return res.json(
      new ApiResponse(
        404,
        null,
        "Id don't exist or something went worng while deleting the data"
      )
    );
  }
  return res.json(new ApiResponse(200, findData, "Data deleted successfully"));
};

export const updateBooking = async (req, res) => {
  try {
    const id = req.params.id;
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

    console.log("Booking ID:", id);

    const existingBooking = await Mahal.findOne({ uuid: id });

    if (!existingBooking) {
      return res.json(new ApiResponse(404, null, "Booking not found."));
    }

    existingBooking.name = name ?? existingBooking.name;
    existingBooking.ph = ph ?? existingBooking.ph;
    existingBooking.title = title ?? existingBooking.title;
    existingBooking.mahal = mahal ?? existingBooking.mahal;
    existingBooking.startDate = startDate ?? existingBooking.startDate;
    existingBooking.endDate = endDate ?? existingBooking.endDate;
    existingBooking.startTime = startTime ?? existingBooking.startTime;
    existingBooking.endTime = endTime ?? existingBooking.endTime;
    existingBooking.date = date ?? existingBooking.date;

    await existingBooking.save();

    return res.json(
      new ApiResponse(200, existingBooking, "Booking updated successfully.")
    );
  } catch (error) {
    console.error("Error updating booking:", error);
    return res.json(new ApiResponse(500, null, "Internal server error."));
  }
};
