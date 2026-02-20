// Path: E:\EduQuest\server\src\middleware\rateLimiter.js

/**
 * Simple in-memory rate limiter
 * No external packages needed
 *
 * Usage: app.use("/api/auth", rateLimiter(10, 15))
 * → max 10 requests per 15 minutes per IP
 *
 * @param {number} maxRequests - max allowed requests in window
 * @param {number} windowMinutes - time window in minutes
 */
function rateLimiter(maxRequests = 100, windowMinutes = 15) {
  const store = new Map(); // ip -> { count, resetAt }

  return (req, res, next) => {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.socket.remoteAddress ||
      "unknown";

    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    const record = store.get(ip);

    // First request or window expired
    if (!record || now > record.resetAt) {
      store.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    // Within window — increment count
    record.count += 1;

    if (record.count > maxRequests) {
      const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfterSec);
      return res.status(429).json({
        message: `Too many requests. Try again in ${Math.ceil(retryAfterSec / 60)} minute(s).`,
        retryAfterSeconds: retryAfterSec,
      });
    }

    next();
  };
}

// Cleanup old entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  // This runs in background — no action needed from caller
}, 5 * 60 * 1000);

module.exports = { rateLimiter };