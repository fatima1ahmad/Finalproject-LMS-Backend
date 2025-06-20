import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import authRoute from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import "./config/db.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import adminRoutes from "./routes/adminRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import moduleRoutes from "./routes/moduleRoutes.js";
import lessonsRoutes from "./routes/lessonRoutes.js";
import AssignmentRoutes from "./routes/assignmentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import attachmentRoutes from "./routes/attachmentRoutes.js";
dotenv.config();

// Import configurations
import sessionConfig from "./config/session.js";
import passport from "./config/passport.js";

// Import utilities
import { createResponse } from "./utils/helpers.js";

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: createResponse(
    false,
    "Too many requests",
    null,
    "Rate limit exceeded"
  ),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Session middleware
app.use(session(sessionConfig));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
//for courses and categories and modules
app.use("/api/courses", courseRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", moduleRoutes);
app.use("/api/lessons", lessonsRoutes);
app.use("/api/assignments", AssignmentRoutes);
app.use("/api/submissions", submissionRoutes);
//for enrollment
app.use("/api/enrollments", enrollmentRoutes);
// for quizzes and questions
app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/attachments", attachmentRoutes);

app.get("/", (req, res) => {
  res.json(
    createResponse(true, "OAuth 2 Google Authentication API", {
      version: "1.0.0",
      endpoints: {
        auth: "/auth/google",
        callback: "/auth/google/callback",
        user: "/auth/user",
        logout: "/auth/logout",
        profile: "/user/profile",
      },
    })
  );
});

// Health check
app.get("/health", (req, res) => {
  res.json(
    createResponse(true, "Server is running", {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  );
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
