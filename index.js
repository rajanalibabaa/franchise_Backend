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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import thirdPartyAuthRouter from './src/Routes/thirdpartyAuthenticationRouters.js'
import loginRouter from './src/Routes/LoginRoutes.js'
=======
>>>>>>> 312cfaec8e5bfca49aa0c913b32405f0d9db3ed3
import { configureFacebookStrategy, configureGoogleStrategy } from './src/utils/thirdpartyauthutils.js';
=======
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import thirdPartyAuthRouter from './src/Routes/thirdpartyAuthenticationRouters.js'
>>>>>>> 984cedd3c91169da5c9b7da3a7fa5ba77a974b75
=======
import thirdPartyAuthRouter from './src/Routes/thirdpartyAuthenticationRouters.js'
import loginRouter from './src/Routes/LoginRoutes.js'
import { configureFacebookStrategy, configureGoogleStrategy } from './src/utils/thirdpartyauthutils.js';
>>>>>>> 45b275d88db78de56d6686a242705d46fd263322

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
  
<<<<<<< HEAD
<<<<<<< HEAD

  configureGoogleStrategy();
  configureFacebookStrategy();
  
  
=======
  // Serialize and Deserialize User for Passport Session
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
  
  
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  (accessToken, refreshToken, profile, done) => {
    // profile.accessToken = accessToken;
    // console.log(" profile: ",profile)
    return done(null, profile);
  }));
  
  
  
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'emails'] // Required to access name/email
  }, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }));


// DB Connection
>>>>>>> 984cedd3c91169da5c9b7da3a7fa5ba77a974b75
=======

  configureGoogleStrategy();
  configureFacebookStrategy();
  
  
>>>>>>> 45b275d88db78de56d6686a242705d46fd263322
connectDatabase();




// Routes
app.get('/', (req, res) => {
    res.send('✅ API is working');
});
app.use('/api',appRouter)

<<<<<<< HEAD
app.use('/api/v1/auth/', thirdPartyAuthRouter)
<<<<<<< HEAD
<<<<<<< HEAD
app.use('/api/v1/login/', loginRouter)
=======
>>>>>>> 984cedd3c91169da5c9b7da3a7fa5ba77a974b75
=======
app.use('/api/v1/login/', loginRouter)
>>>>>>> 45b275d88db78de56d6686a242705d46fd263322
=======
>>>>>>> 312cfaec8e5bfca49aa0c913b32405f0d9db3ed3

// Global Error Handler
app.use(errorHandler);

<<<<<<< HEAD


=======
>>>>>>> 984cedd3c91169da5c9b7da3a7fa5ba77a974b75
// Server Listener
app.listen(process.env.PORT, () => {
    console.log(`🚀 Server is running on port ${process.env.PORT}`);
});
