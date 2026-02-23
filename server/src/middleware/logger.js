// Path: E:\EduQuest\server\src\middleware\logger.js

const logger = require("../config/logger");

function loggerMiddleware(req, res, next) {
  const startTime = Date.now();

  // Log request
  logger.http("Incoming Request", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  // Capture response
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    
    logger.logRequest(req, res, duration);

    // Log slow requests
    if (duration > 1000) {
      logger.warn("Slow Request Detected", {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
      });
    }

    // Log errors
    if (res.statusCode >= 400) {
      logger.warn("Error Response", {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    }
  });

  next();
}

module.exports = { logger: loggerMiddleware };