// Path: E:\EduQuest\server\src\app.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const prisma = require("./prisma");

// ── Middleware imports ─────────────────────────────────────
const { logger }      = require("./middleware/logger");
const { rateLimiter } = require("./middleware/rateLimiter");

// ── Route imports ──────────────────────────────────────────
const authRoutes         = require("./routes/auth.routes");
const userRoutes         = require("./routes/user.routes");
const courseRoutes       = require("./routes/course.routes");
const lessonRoutes       = require("./routes/lesson.routes");
const quizRoutes         = require("./routes/quiz.routes");
const questionRoutes     = require("./routes/question.routes");
const badgeRoutes        = require("./routes/badge.routes");
const notificationRoutes = require("./routes/notification.routes");
const leaderboardRoutes  = require("./routes/leaderboard.routes");
const reviewRoutes       = require("./routes/review.routes");
const certificateRoutes  = require("./routes/certificate.routes");
const instructorRoutes   = require("./routes/instructor.routes");
const adminRoutes        = require("./routes/admin.routes");
const docsRoutes         = require("./routes/docs.routes");

const app = express();

// ══════════════════════════════════════════════════════════════
// SECURITY & PERFORMANCE MIDDLEWARE
// ══════════════════════════════════════════════════════════════

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:5173"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Compress responses
app.use(compression());

// Body size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logger
app.use(logger);

// ══════════════════════════════════════════════════════════════
// HEALTH CHECK
// ══════════════════════════════════════════════════════════════
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "connected",
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
    });
  } catch (err) {
    return res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: err.message,
    });
  }
});

// ══════════════════════════════════════════════════════════════
// API ROUTES
// ══════════════════════════════════════════════════════════════
app.use("/api/auth",          rateLimiter(10, 15), authRoutes);
app.use("/api/user",          userRoutes);
app.use("/api/courses",       courseRoutes);
app.use("/api/lessons",       lessonRoutes);
app.use("/api/quizzes",       quizRoutes);
app.use("/api/questions",     questionRoutes);
app.use("/api/badges",        badgeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/leaderboard",   leaderboardRoutes);
app.use("/api/reviews",       reviewRoutes);
app.use("/api/certificates",  certificateRoutes);
app.use("/api/instructor",    instructorRoutes);
app.use("/api/admin",         adminRoutes);
app.use("/api/docs",          docsRoutes);

// ══════════════════════════════════════════════════════════════
// ERROR HANDLERS
// ══════════════════════════════════════════════════════════════

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);

  // CORS errors
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy: Origin not allowed",
      timestamp: new Date().toISOString(),
    });
  }

  // Prisma errors
  if (err.code && err.code.startsWith("P")) {
    return res.status(400).json({
      success: false,
      message: "Database error",
      error: process.env.NODE_ENV === "production" ? "Invalid request" : err.message,
      timestamp: new Date().toISOString(),
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Payload too large
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request payload too large",
      limit: "10mb",
      timestamp: new Date().toISOString(),
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "production" ? "Something went wrong" : err.stack,
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;