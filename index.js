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
import thirdPartyAuthRouter from './src/Routes/thirdpartyAuthenticationRouters.js'
import loginRouter from './src/Routes/LoginRoutes.js'
import { configureFacebookStrategy, configureGoogleStrategy } from './src/utils/thirdpartyauthutils.js';

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




// Routes
app.get('/', (req, res) => {
    res.send('✅ API is working');
});
app.use('/api',appRouter)

app.use('/api/v1/auth/', thirdPartyAuthRouter)
app.use('/api/v1/login/', loginRouter)

// Global Error Handler
app.use(errorHandler);



// Server Listener
app.listen(process.env.PORT, () => {
    console.log(`🚀 Server is running on port ${process.env.PORT}`);
});
