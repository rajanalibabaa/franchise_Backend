import { Router } from "express";
import { creatBrandRegister, deleteBrandRegister, getAllBrandRegister, getBrandByRegisterId, updateBrandRegister } from "../../controller/BrandController/BrandRegistorController.js";

const BrandRegisterRoute = Router()

BrandRegisterRoute.post("/creatBrandRegister",creatBrandRegister)
BrandRegisterRoute.get("/getBrandByRegisterId/:uuid",getBrandByRegisterId)
BrandRegisterRoute.get("/getAllBrandRegister",getAllBrandRegister)
BrandRegisterRoute.patch("/updateBrandRegister/:uuid",updateBrandRegister)
BrandRegisterRoute.delete("/deleteBrandRegister/:uuid",deleteBrandRegister)


export { BrandRegisterRoute }