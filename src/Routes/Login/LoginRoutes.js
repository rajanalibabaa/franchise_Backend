
import { Router } from "express";
import {  generateOTPforLogin,  verifyLogin, } from "../../controller/Login/LoginController.js"

const Login = Router()

Login.post('/',verifyLogin)
Login.post('/generateOTPforLogin',generateOTPforLogin)


export { Login }