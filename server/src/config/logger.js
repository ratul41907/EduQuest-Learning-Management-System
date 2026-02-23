// Path: E:\EduQuest\server\src\config\logger.js

const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");

// ══════════════════════════════════════════════════════════════
// LOG DIRECTORY
// ══════════════════════════════════════════════════════════════
const logDir = path.join(__dirname, "../../logs");

// ══════════════════════════════════════════════════════════════
// CUSTOM LOG FORMAT
// ══════════════════════════════════════════════════════════════
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format (colored and readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    
    return msg;
  })
);

// ══════════════════════════════════════════════════════════════
// TRANSPORT: DAILY ROTATE FILES
// ══════════════════════════════════════════════════════════════

// All logs (info and above)
const allLogsTransport = new DailyRotateFile({
  filename: path.join(logDir, "application-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d", // Keep logs for 14 days
  level: "info",
  format: logFormat,
});

// Error logs only
const errorLogsTransport = new DailyRotateFile({
  filename: path.join(logDir, "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "30d", // Keep error logs for 30 days
  level: "error",
  format: logFormat,
});

// HTTP request logs
const httpLogsTransport = new DailyRotateFile({
  filename: path.join(logDir, "http-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "7d", // Keep HTTP logs for 7 days
  level: "http",
  format: logFormat,
});

// ══════════════════════════════════════════════════════════════
// CREATE LOGGER INSTANCE
// ══════════════════════════════════════════════════════════════
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: { service: "eduquest-api" },
  transports: [
    allLogsTransport,
    errorLogsTransport,
    httpLogsTransport,
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, "exceptions-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, "rejections-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
    }),
  ],
});

// ══════════════════════════════════════════════════════════════
// CONSOLE LOGGING (Development Only)
// ══════════════════════════════════════════════════════════════
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// ══════════════════════════════════════════════════════════════
// CUSTOM LOG LEVELS
// ══════════════════════════════════════════════════════════════
winston.addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "cyan",
});

// ══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════

// Log HTTP requests
logger.logRequest = (req, res, duration) => {
  logger.http("HTTP Request", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    userId: req.user?.sub || "anonymous",
  });
};

// Log errors with context
logger.logError = (error, req) => {
  logger.error("Application Error", {
    message: error.message,
    stack: error.stack,
    url: req?.originalUrl,
    method: req?.method,
    ip: req?.ip,
    userId: req?.user?.sub || "anonymous",
    body: req?.body,
  });
};

// Log authentication events
logger.logAuth = (event, userId, email, success, ip) => {
  logger.info("Authentication Event", {
    event,
    userId,
    email,
    success,
    ip,
  });
};

// Log database queries (for debugging)
logger.logQuery = (query, duration) => {
  logger.debug("Database Query", {
    query,
    duration: `${duration}ms`,
  });
};

// Log security events
logger.logSecurity = (event, details) => {
  logger.warn("Security Event", {
    event,
    ...details,
  });
};

module.exports = logger;