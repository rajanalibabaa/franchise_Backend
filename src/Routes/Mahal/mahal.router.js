import { Router } from "express";
import { createBooking, deleteBooking, getAllBooking, updateBooking } from "../../controller/Mahal/mahal.controller.js";

export const mahalRouter = Router()

mahalRouter.post("/v1/createBooking",createBooking)
mahalRouter.get("/v1/getAllBooking",getAllBooking)
mahalRouter.delete("/v1/deleteBooking/:id",deleteBooking)
mahalRouter.patch("/v1/updateBooking/:id",updateBooking)