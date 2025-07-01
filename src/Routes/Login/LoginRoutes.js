
import { Router } from "express";
import {  generateOTPforLogin,  verifyLogin, } from "../../controller/Login/LoginController.js"

const Login = Router()

Login.post('/v1/login/',verifyLogin)
Login.post('/v1/login/generateOTPforLogin',generateOTPforLogin)


export { Login } 