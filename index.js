import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDatabase from './src/config/DbConnection.js';
import errorHandler from './src/Middleware/errorHandler.js';
import appRouter from "./app.js";
import session from 'express-session';
import passport from 'passport';
import { configureFacebookStrategy, configureGoogleStrategy } from './src/utils/ThirdpartUtils/thirdpartyauthutils.js';
import { engine } from 'express-handlebars';
import path from 'path';
import s3Uploads from './src/Routes/s3Uploads/upload.js';
const app = express();

dotenv.config();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors( {
    origin:'*',
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],

    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

  configureGoogleStrategy();
  configureFacebookStrategy();

  
  // app.engine('hbs', engine({
  //   extname: '.hbs',
  //   defaultLayout: 'main',
  //   layoutsDir: path.join(process.cwd(), 'src', 'pages', 'layouts'),
  //   partialsDir: path.join(process.cwd(), 'src', 'pages', 'partials'),
  //   runtimeOptions: {
  //     allowProtoPropertiesByDefault: true,
  //     allowProtoMethodsByDefault: true
  //   }
  // }));
  // app.set('view engine', 'hbs');
  
  // app.set('views', path.join(process.cwd(), 'src','pages')); 
  // hbs.registerPartials(path.join(process.cwd(), 'src', 'pages', 'partials'));
   
  connectDatabase();

// Routes
app.get('/', (req, res) => {
    // res.render('home');
    // res.send('Welcome to the Home Page!');
    res.json({ message: 'Welcome to the Home Page!' });
});
app.use('/api',appRouter)
app.use("/api/v1/upload", s3Uploads)


// Global Error Handler
app.use(errorHandler);

// Server Listener
app.listen(process.env.PORT, () => {
    console.log(`🚀 Server is running on port ${process.env.PORT}`);
});