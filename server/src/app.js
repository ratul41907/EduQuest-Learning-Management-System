// Path: E:\EduQuest\server\src\app.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const path = require("path");
const prisma = require("./prisma");

// ── Middleware imports ─────────────────────────────────────
const { logger } = require("./middleware/logger");
const { 
  globalLimiter, 
  authLimiter, 
  speedLimiter, 
  uploadLimiter, 
  adminLimiter,
  checkBlockedIP 
} = require("./middleware/rateLimiter");
const { 
  xssProtection, 
  noSqlInjectionProtection, 
  removeNullBytes, 
  sqlInjectionDetection, 
  trimInputs 
} = require("./middleware/sanitize");
const { trackRequest, getAnalytics } = require("./middleware/analytics");

const app = express();

// ══════════════════════════════════════════════════════════════
// SECURITY & PERFORMANCE MIDDLEWARE
// ══════════════════════════════════════════════════════════════

// Trust proxy (for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

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

// ══════════════════════════════════════════════════════════════
// DAY 17: ENHANCED SECURITY & ANALYTICS
// ══════════════════════════════════════════════════════════════

// Check for blocked IPs first
app.use(checkBlockedIP);

// Input sanitization (correct order)
app.use(noSqlInjectionProtection);
app.use(xssProtection);
app.use(trimInputs);
app.use(removeNullBytes);
app.use(sqlInjectionDetection);

// Global rate limiting & speed control
app.use(globalLimiter);
app.use(speedLimiter);

// Request tracking
app.use(trackRequest);

// Request logger
app.use(logger);

// ══════════════════════════════════════════════════════════════
// SERVE STATIC FILES (uploads)
// ══════════════════════════════════════════════════════════════
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Day 20: Serve WebSocket test page
app.use(express.static(path.join(__dirname, "../public")));

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
      version: "2.0.0",
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
// ANALYTICS ENDPOINT (Admin only in production)
// ══════════════════════════════════════════════════════════════
app.get("/analytics", getAnalytics);

// ══════════════════════════════════════════════════════════════
// DAY 22: VERSION INFO
// ══════════════════════════════════════════════════════════════
const versionInfoRoutes = require("./routes/version-info.routes");
app.use("/api/version", versionInfoRoutes);

// ══════════════════════════════════════════════════════════════
// DAY 22: API ROUTES - VERSIONED
// ══════════════════════════════════════════════════════════════
const v1Routes = require("./routes/v1");
const v2Routes = require("./routes/v2");

// Mount versioned routes
app.use("/api/v1", v1Routes);
app.use("/api/v2", v2Routes);

// Default version (v2 is now default)
app.use("/api", v2Routes);

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
  // Day 18: Log error with context
  const winstonLogger = require("./config/logger");
  winstonLogger.logError(err, req);

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