import { Router } from "express";
import { creatBrandRegister, deleteBrandRegister, getAllBrandRegister, getBrandByRegisterId, updateBrandRegister } from "../../controller/BrandController/BrandRegistorController.js";
import { verifyJWT } from "../../Middleware/Authentication/AuthMiddleware.js";

const BrandRegisterRoute = Router()

BrandRegisterRoute.post("/creatBrandRegister",creatBrandRegister)
BrandRegisterRoute.get("/getBrandByRegisterId/:uuid",verifyJWT,getBrandByRegisterId)
BrandRegisterRoute.get("/getAllBrandRegister",getAllBrandRegister)
BrandRegisterRoute.patch("/updateBrandRegister/:uuid",verifyJWT,updateBrandRegister)
BrandRegisterRoute.delete("/deleteBrandRegister/:uuid",verifyJWT,deleteBrandRegister)


export { BrandRegisterRoute }