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
import { getAllEndpoints } from './src/utils/endpoints/allEndPoints.js';
import allRouters from './app.js';
const app = express();

dotenv.config();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors( {
    origin: 'http://localhost:5173',
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
   
  connectDatabase();

// Routes
app.get('/', (req, res) => {
    // res.render('home');
    // res.send('Welcome to the Home Page!');
    res.json({ message: 'Welcome to the Home Page!' });
});
app.use('/api',allRouters);

app.use("/api/v1/upload", s3Uploads)

app.get('/endpoints', (req, res) => {
    const endpoints = getAllEndpoints(app);
    console.log("Extracted Endpoints:", endpoints); // Debugging output
    // let html = `
    //     <!DOCTYPE html>
    //     <html lang="en">
    //     <head>
    //         <meta charset="UTF-8">
    //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //         <title>API Endpoints</title>
    //         <style>
    //             body { font-family: Arial, sans-serif; margin: 20px; }
    //             h1 { color: #333; }
    //             ul { list-style-type: none; padding: 0; }
    //             li { margin: 5px 0; }
    //             strong { color: #007BFF; }
    //         </style>
    //     </head>
    //     <body>
    //         <h1>API Endpoints</h1>
    //         <ul>
    // `;

    // endpoints.forEach((endpoint) => {
    //     endpoint.methods.forEach((method) => {
    //         html += `<li><strong>[${method}]</strong> ${endpoint.path}</li>`;
    //     });
    // });

    // html += `
    //         </ul>
    //     </body>
    //     </html>
    // `;

    res.json(endpoints);
});

// Global Error Handler
app.use(errorHandler);

// Server Listener
app.listen(process.env.PORT, () => {
    console.log(`🚀 Server is running on port ${process.env.PORT}`);
});