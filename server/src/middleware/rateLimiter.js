// Path: E:\EduQuest\server\src\middleware\rateLimiter.js

const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const logger = require("../config/logger");

// ══════════════════════════════════════════════════════════════
// MEMORY STORE FOR BLOCKED IPS
// ══════════════════════════════════════════════════════════════
const blockedIPs = new Map();

const isIPBlocked = (ip) => {
  const blockInfo = blockedIPs.get(ip);
  if (!blockInfo) return false;
  
  // Check if block has expired
  if (Date.now() > blockInfo.until) {
    blockedIPs.delete(ip);
    return false;
  }
  
  return true;
};

const blockIP = (ip, minutes = 15) => {
  const until = Date.now() + (minutes * 60 * 1000);
  blockedIPs.set(ip, { until, blockedAt: new Date() });
  
  logger.logSecurity("IP_BLOCKED", {
    ip,
    duration: `${minutes} minutes`,
    until: new Date(until).toISOString(),
  });
};

// ══════════════════════════════════════════════════════════════
// IP BLOCKING MIDDLEWARE
// ══════════════════════════════════════════════════════════════
const checkBlockedIP = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  const blockInfo = blockedIPs.get(ip);
  if (blockInfo) {
    if (Date.now() > blockInfo.until) {
      blockedIPs.delete(ip);
      return next();
    }
    
    const minutesLeft = Math.ceil((blockInfo.until - Date.now()) / (1000 * 60));
    
    return res.status(403).json({
      success: false,
      message: "Your IP has been temporarily blocked due to suspicious activity",
      retryAfter: `${minutesLeft} minutes`,
      blockedUntil: new Date(blockInfo.until).toISOString(),
      timestamp: new Date().toISOString(),
    });
  }
  
  next();
};

// ══════════════════════════════════════════════════════════════
// RATE LIMITERS
// ══════════════════════════════════════════════════════════════

// Global rate limiter - 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    
    logger.logSecurity("RATE_LIMIT_EXCEEDED", {
      ip,
      path: req.path,
      limit: "100 requests per 15 minutes",
    });
    
    // Block IP after 3 rate limit hits
    const hits = (req.rateLimit?.current || 0);
    
    if (hits > 120) {
      blockIP(ip, 30); // Block for 30 minutes
    }
    
    res.status(429).json({
      success: false,
      message: "Too many requests, please slow down",
      retryAfter: "15 minutes",
      timestamp: new Date().toISOString(),
    });
  },
});

// Strict rate limiter for auth endpoints - 10 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
    retryAfter: "15 minutes",
  },
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    
    logger.logSecurity("AUTH_RATE_LIMIT_EXCEEDED", {
      ip,
      path: req.path,
      limit: "10 requests per 15 minutes",
    });
    
    blockIP(ip, 60); // Block for 1 hour on auth abuse
    
    res.status(429).json({
      success: false,
      message: "Too many login/registration attempts. IP temporarily blocked.",
      retryAfter: "1 hour",
      timestamp: new Date().toISOString(),
    });
  },
});

// Speed limiter - slows down requests after threshold
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: 500,
  maxDelayMs: 5000,
});

// File upload rate limiter - 20 uploads per hour
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many file uploads, please try again later",
    retryAfter: "1 hour",
  },
});

// Admin actions rate limiter - 200 per 15 minutes
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: "Too many admin actions, please slow down",
  },
});

// ══════════════════════════════════════════════════════════════
// LEGACY EXPORT (for backwards compatibility)
// ══════════════════════════════════════════════════════════════
function rateLimiter(maxRequests, windowMinutes) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: {
      success: false,
      message: "Too many requests, please try again later",
    },
  });
}

module.exports = {
  rateLimiter, // Legacy function
  globalLimiter,
  authLimiter,
  speedLimiter,
  uploadLimiter,
  adminLimiter,
  checkBlockedIP,
  blockIP,
  isIPBlocked,
};