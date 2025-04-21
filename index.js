import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDatabase from './src/config/DbConnection.js';
import errorHandler from './src/Middleware/errorHandler.js';
import appRouter from "./app.js";
import session from 'express-session';
import passport from 'passport';
import { configureFacebookStrategy, configureGoogleStrategy } from './src/utils/thirdpartyauthutils.js';
// import {sendEmailOTP} from "./src/utils/sendEmailOTP.js"
// import {generateOTP} from "./src/utils/generateOTP.js"
const app = express();

dotenv.config();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  

  configureGoogleStrategy();
  configureFacebookStrategy();
  
   
  connectDatabase();

  // sendEmailOTP("aravind26052001@gmail.com",generateOTP())


// Routes
app.get('/', (req, res) => {
    res.send('✅ API is working');
});
app.use('/api',appRouter)


// Global Error Handler
app.use(errorHandler);

// Server Listener
app.listen(process.env.PORT, () => {
    console.log(`🚀 Server is running on port ${process.env.PORT}`);
});