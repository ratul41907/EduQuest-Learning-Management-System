// Path: E:\EduQuest\server\src\routes\version.js

const express = require("express");
const logger = require("../config/logger");

/**
 * Version middleware - adds deprecation warnings
 */
function versionMiddleware(version) {
  return (req, res, next) => {
    req.apiVersion = version;
    
    // Add version header to response
    res.setHeader("X-API-Version", version);
    
    // Log API version usage
    logger.info("API version used", {
      version,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });

    next();
  };
}

/**
 * Deprecation warning middleware
 */
function deprecationWarning(message, sunset) {
  return (req, res, next) => {
    res.setHeader("Warning", `299 - "Deprecated API: ${message}"`);
    res.setHeader("Sunset", sunset); // RFC 8594
    
    logger.warn("Deprecated API used", {
      path: req.path,
      message,
      sunset,
      ip: req.ip,
    });

    next();
  };
}

/**
 * Version router factory
 */
function createVersionRouter(version, routes) {
  const router = express.Router();

  // Add version middleware
  router.use(versionMiddleware(version));

  // Mount all routes
  Object.entries(routes).forEach(([path, routeHandler]) => {
    router.use(path, routeHandler);
  });

  return router;
}

module.exports = {
  versionMiddleware,
  deprecationWarning,
  createVersionRouter,
};