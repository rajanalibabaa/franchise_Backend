import { Router } from "express";
import { creatBrandRegister } from "../../controller/BrandController/BrandRegistorController.js";

const BrandRegisterRoute = Router()

BrandRegisterRoute.post("/creatBrandRegister",creatBrandRegister)

export { BrandRegisterRoute }