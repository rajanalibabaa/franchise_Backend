import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDatabase from "./src/config/DbConnection.js";
import errorHandler from "./src/Middleware/errorHandler.js";
import session from "express-session";
import passport from "passport";
import {
  configureFacebookStrategy,
  configureGoogleStrategy,
} from "./src/utils/ThirdpartUtils/thirdpartyauthutils.js";
import path from "path";
import s3Uploads from "./src/Routes/s3Uploads/upload.js";
import allRouters from "./app.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import MongoStore from "connect-mongo";
import compression from "compression";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { mainSocket } from "./src/socket/mainSocket.js";
import { registerNotificationSocket } from "./src/socket/notificationSocket.js";
import dns from "dns";
import { startBrandExpiryJob } from "./src/controller/BrandPackagePlans/brandPackagePlans.js";
// import { createLeadRulesForAllBrands } from "./src/controller/CMS/LeadDistributionAdminAccess/leadMatchingRulePerBrand.js";

dotenv.config(); // ✅ Load env FIRST

const app = express();
app.set("trust proxy", 1); // trust first proxy

app.get("/api/image-proxy", async (req, res) => {
  try {
    const imageUrl = req.query.url;


    if (!imageUrl) {
      return res.status(400).send("Missing image URL");
    }

    const response = await fetch(imageUrl);

    if (!response.ok) {
      return res.status(500).send("Failed to fetch image");
    }

    const buffer = await response.arrayBuffer();

    res.set("Content-Type", response.headers.get("content-type"));
    res.set("Access-Control-Allow-Origin", "*");
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).send("Proxy error");
  }
});

// Rate Limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // 🔥 increased limit
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* legacy headers
  message: {
    status: 429,
    message: "Too many requests. Please try again later.",
  },
});

const webhookslimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 🔥 increased limit for webhooks
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* legacy headers
  message: {
    status: 429,
    message: "Too many requests to webhooks. Please try again later.",
  },
});

app.use(helmet());
app.use(compression());

const allowedOrigins = [
  "https://mrfranchise.in",
  "https://fb.mrfranchise.in",
  "https://www.mrfranchise.in",
  "https://admin.mrfranchise.in",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://thirumalthirumagal.com",
  "https://www.thirumalthirumagal.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser requests like Postman

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`CORS policy: This origin ${origin} is not allowed`);
      return callback(null, false);
    },
    credentials: true,
  }),
);

// app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), "public")));

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
);

// Passport
app.use(passport.initialize());
app.use(passport.session());
configureGoogleStrategy();
configureFacebookStrategy();
// Do not start cron jobs until DB connection is established
// Global rate limit
app.use("/uploads", express.static(path.resolve("./uploads")));
// Connect to DB (ensure DB is connected before listening)

// ✅ Create HTTP server & Socket.IO
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [
      "https://mrfranchise.in",
      "https://fb.mrfranchise.in",
      "https://www.mrfranchise.in",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://admin.mrfranchise.in",
      "http://localhost:3000",
      "http://localhost:3001",
      "https://thirumalthirumagal.com",
      "https://www.thirumalthirumagal.com",
    ],
    credentials: true,
  },
});

// ✅ Socket.IO connection
io.on("connection", (socket) => mainSocket(socket, io));
registerNotificationSocket(io);
app.set("io", io);

// ✅ Start server
const startServer = async () => {
  try {
    await connectDatabase();
    console.log("✅ Database connected");
    // Start scheduled jobs only after DB is connected
    try {
      startBrandExpiryJob();
      // await createLeadRulesForAllBrands();
      console.log("⏱️ Brand expiry cron job started");
    } catch (cronErr) {
      console.error("Failed to start Brand expiry cron job:", cronErr);
    }

    // Routes
    app.get("/", (req, res) => {
      res.json({ message: "Welcome to the Home Page!" });
    });

    app.use("/api", limiter, allRouters);
    app.use("/api/v1/upload", limiter, s3Uploads);
    // ✅ This is for webhook verification
    app.get("/api/webhooks", webhookslimiter, (req, res) => {
      const VERIFY_TOKEN = "IG_VERIFY_TOKEN"; // <-- you define this

      const mode = req.query["hub.mode"];
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];

      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        // console.log("Webhook verified ✅");
        res.status(200).send(challenge); // must return challenge
      } else {
        res.sendStatus(403);
      }
    });

    app.post("/api/webhooks", webhookslimiter, (req, res) => {
      // console.log("Incoming webhook event:", req.body);
      res.sendStatus(200);
    });

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


