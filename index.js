import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDatabase from './src/config/DbConnection.js';
import errorHandler from './src/Middleware/errorHandler.js';
import session from 'express-session';
import passport from 'passport';
import { configureFacebookStrategy, configureGoogleStrategy } from './src/utils/ThirdpartUtils/thirdpartyauthutils.js';
import path from 'path';
import s3Uploads from './src/Routes/s3Uploads/upload.js';
import allRouters from './app.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import MongoStore from 'connect-mongo';
 
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
const app = express();

app.use(helmet()); // Adds security headers to the response
app.use(cors( {
    origin: ['https://fb.mrfranchise.in','http://localhost:5173','http://localhost:5174'],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],

    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    credentials: true,
    optionsSuccessStatus: 200,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store:MongoStore.create({
        mongoUrl: process.env.DB_URL,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60, // 14 days
    }),
    cookie: {
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    },
}));
app.use(limiter);
app.use(passport.initialize());
app.use(passport.session());
configureGoogleStrategy();
  configureFacebookStrategy();
   
  connectDatabase();


dotenv.config();  

// Middlewares

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));







  

// Routes
app.get('/', (req, res) => {    res.json({ message: 'Welcome to the Home Page!' });});

app.use('/api',limiter,allRouters,);

app.use("/api/v1/upload", limiter,s3Uploads);

// app.post('/api/v1/verify-captcha', async (req, res) => {
//   const { token } = req.body;
//   const secretKey = process.env.REACT_APP_RECAPTCHA_SECRET_KEY;

//   const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
//   const response = await fetch(url, { method: 'POST' });
//   const data = await response.json();

//   res.json(data); // returns success or error
// });


// Global Error Handler
app.use(errorHandler);

// Server Listener
app.listen(process.env.PORT, () => {
    console.log(`🚀 Server is running on port ${process.env.PORT}`);
});




