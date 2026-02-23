// Path: E:\EduQuest\server\src\middleware\sanitize.js

const logger = require("../config/logger");

// ══════════════════════════════════════════════════════════════
// XSS PROTECTION (Manual Implementation)
// ══════════════════════════════════════════════════════════════
const xssProtection = (req, res, next) => {
  const stripXSS = (value) => {
    if (typeof value !== "string") return value;
    
    // Remove script tags and common XSS patterns
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  };

  const sanitize = (obj) => {
    if (typeof obj === "string") {
      return stripXSS(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === "object") {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};

// ══════════════════════════════════════════════════════════════
// NOSQL INJECTION PROTECTION (Manual Implementation)
// ══════════════════════════════════════════════════════════════
const noSqlInjectionProtection = (req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      Object.keys(obj).forEach((key) => {
        // Remove keys starting with $ or containing .
        if (key.startsWith("$") || key.includes(".")) {
          logger.logSecurity("NOSQL_INJECTION_ATTEMPT", {
            ip: req.ip,
            key,
            path: req.path,
          });
          delete obj[key];
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          sanitize(obj[key]);
        }
      });
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

// ══════════════════════════════════════════════════════════════
// CUSTOM SANITIZERS
// ══════════════════════════════════════════════════════════════

// Remove null bytes
const removeNullBytes = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === "string") {
      return obj.replace(/\0/g, "");
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === "object") {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};

// SQL injection keywords detection (additional layer)
const sqlInjectionDetection = (req, res, next) => {
  const sqlKeywords = [
    "SELECT", "INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER",
    "EXEC", "EXECUTE", "UNION", "OR 1=1", "AND 1=1", "--", "/*", "*/",
    "xp_", "sp_", "DECLARE", "CAST", "CONVERT"
  ];

  const checkForSQL = (value) => {
    if (typeof value !== "string") return false;
    const upperValue = value.toUpperCase();
    return sqlKeywords.some(keyword => upperValue.includes(keyword));
  };

  const scanObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "string" && checkForSQL(obj[key])) {
        return true;
      }
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (scanObject(obj[key])) return true;
      }
    }
    return false;
  };

  if (scanObject(req.body) || scanObject(req.query)) {
    logger.logSecurity("SQL_INJECTION_ATTEMPT", {
      ip: req.ip,
      path: req.path,
      body: req.body,
    });
    
    return res.status(400).json({
      success: false,
      message: "Invalid input detected",
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Trim whitespace from strings
const trimInputs = (req, res, next) => {
  const trim = (obj) => {
    if (typeof obj === "string") {
      return obj.trim();
    }
    if (Array.isArray(obj)) {
      return obj.map(trim);
    }
    if (obj && typeof obj === "object") {
      const trimmed = {};
      for (const key in obj) {
        trimmed[key] = trim(obj[key]);
      }
      return trimmed;
    }
    return obj;
  };

  if (req.body) req.body = trim(req.body);
  if (req.query) req.query = trim(req.query);

  next();
};

module.exports = {
  xssProtection,
  noSqlInjectionProtection,
  removeNullBytes,
  sqlInjectionDetection,
  trimInputs,
};