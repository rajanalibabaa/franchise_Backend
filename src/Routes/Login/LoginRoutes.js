
import { Router } from "express";
import {  generateOTPforAdminLogin, generateOTPforLogin,  verifyAdminLoginOTP,  verifyLogin, } from "../../controller/Login/LoginController.js"

const Login = Router()

Login.post('/v1/login/',verifyLogin)
Login.post('/v1/login/generateOTPforLogin',generateOTPforLogin)
Login.post('/v1/login/generateOTPforAdminLogin',generateOTPforAdminLogin)
Login.post('/v1/login/verifyAdminLoginOTP',verifyAdminLoginOTP)



export { Login } 