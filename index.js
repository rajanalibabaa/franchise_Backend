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
<<<<<<< HEAD
// import {sendEmailOTP} from "./src/utils/sendEmailOTP.js"
// import {generateOTP} from "./src/utils/generateOTP.js"
=======
import { engine } from 'express-handlebars';
import path from 'path';
import hbs from 'hbs';
>>>>>>> e34dc82f3035fc8900f28fa2d54d033d58b0e019
const app = express();

dotenv.config();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
<<<<<<< HEAD

=======
app.use(express.static(path.join(process.cwd(), 'public'))); 
>>>>>>> e34dc82f3035fc8900f28fa2d54d033d58b0e019

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  

  configureGoogleStrategy();
  configureFacebookStrategy();
<<<<<<< HEAD
  
   
  connectDatabase();

  // sendEmailOTP("aravind26052001@gmail.com",generateOTP())


// Routes
app.get('/', (req, res) => {
    res.send('✅ API is working');
=======

  
  app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(process.cwd(), 'src', 'pages', 'layouts'),
    partialsDir: path.join(process.cwd(), 'src', 'pages', 'partials'),
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true
    }
  }));
  app.set('view engine', 'hbs');
  
  app.set('views', path.join(process.cwd(), 'src','pages')); 
  // hbs.registerPartials(path.join(process.cwd(), 'src', 'pages', 'partials'));
   
  connectDatabase();



// Routes  
app.get('/', (req, res) => {
    // res.send('✅ API is working');
    res.render('home');
>>>>>>> e34dc82f3035fc8900f28fa2d54d033d58b0e019
});
app.use('/api',appRouter)


// Global Error Handler
app.use(errorHandler);

// Server Listener
app.listen(process.env.PORT, () => {
    console.log(`🚀 Server is running on port ${process.env.PORT}`);
});