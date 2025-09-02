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
import compression from "compression";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { mainSocket } from './src/socket/mainSocket.js';

dotenv.config();  // ✅ Load env FIRST

const app = express();

// Middlewares
app.use(compression());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: "Too many requests, try again later."
});

app.use(helmet());
app.use(cors({
  origin: ['https://fb.mrfranchise.in', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  optionsSuccessStatus: 200,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || "default_secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DB_URL,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60, // 14 days
  }),
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());
configureGoogleStrategy();
configureFacebookStrategy();

// Global rate limit
app.use(limiter);
app.use('/uploads', express.static(path.resolve('./uploads')));
// Connect to DB (ensure DB is connected before listening)

// ✅ Create HTTP server & Socket.IO
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ['https://fb.mrfranchise.in', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  },
});

// ✅ Socket.IO connection
io.on("connection", (socket) => mainSocket(socket, io));


// ✅ Start server
const startServer = async () => {
  try {
    await connectDatabase();
    console.log("✅ Database connected");

    // Routes
    app.get('/', (req, res) => {
      res.json({ message: 'Welcome to the Home Page!' });
    });

    app.use('/api', allRouters);
    app.use('/api/v1/upload', s3Uploads);

    // Error handler
    app.use(errorHandler);

    // ✅ Use httpServer.listen (not app.listen)
    httpServer.listen(process.env.PORT, () => {
      console.log(`🚀 Server is running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
