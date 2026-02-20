// Path: E:\EduQuest\server\src\middleware\logger.js

/**
 * Global request logger
 * Logs: METHOD /path STATUS Xms
 * Example: POST /api/auth/login 200 45ms
 */
function logger(req, res, next) {
  const start = Date.now();

  // Run after response is sent
  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;

    // Color code by status
    const color =
      status >= 500 ? "\x1b[31m" : // red
      status >= 400 ? "\x1b[33m" : // yellow
      status >= 200 ? "\x1b[32m" : // green
      "\x1b[0m";                    // reset

    const reset = "\x1b[0m";
    const time = new Date().toISOString().slice(11, 19); // HH:MM:SS

    console.log(
      `${color}[${time}] ${req.method} ${req.originalUrl} → ${status} (${duration}ms)${reset}`
    );
  });

  next();
}

module.exports = { logger };