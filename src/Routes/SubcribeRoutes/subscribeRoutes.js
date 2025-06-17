import { Router } from "express";
import { getSubscribe } from "../../controller/Subscribe/SubscribeController.js";

export const subscribeRouter =  Router()

subscribeRouter.post("/getsubscribe", getSubscribe)