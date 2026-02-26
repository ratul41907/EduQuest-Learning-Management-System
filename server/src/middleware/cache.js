// Path: E:\EduQuest\server\src\middleware\cache.js

const { getCache, setCache, isRedisConnected } = require("../config/redis");
const logger = require("../config/logger");

/**
 * Cache middleware - caches GET requests
 * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
 * @returns {Function} Express middleware
 */
function cacheMiddleware(ttl = 300) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Skip if Redis not connected
    if (!isRedisConnected()) {
      logger.warn("Cache skipped - Redis not connected");
      return next();
    }

    // Generate cache key from URL and query params
    const cacheKey = `cache:${req.originalUrl}`;

    try {
      // Try to get from cache
      const cachedData = await getCache(cacheKey);

      if (cachedData) {
        logger.debug("Cache hit", { key: cacheKey });
        return res.json(cachedData);
      }

      // Cache miss - continue to route handler
      logger.debug("Cache miss", { key: cacheKey });

      // Override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        // Only cache successful responses
        if (res.statusCode === 200) {
          setCache(cacheKey, data, ttl).catch(err =>
            logger.error("Cache set error in middleware", { error: err.message })
          );
        }
        return originalJson(data);
      };

      next();
    } catch (err) {
      logger.error("Cache middleware error", { error: err.message });
      next();
    }
  };
}

/**
 * Cache user-specific data (includes userId in key)
 * @param {number} ttl - Time to live in seconds
 * @returns {Function} Express middleware
 */
function cacheUserData(ttl = 300) {
  return async (req, res, next) => {
    if (req.method !== "GET" || !req.user) {
      return next();
    }

    if (!isRedisConnected()) {
      return next();
    }

    const cacheKey = `cache:user:${req.user.sub}:${req.originalUrl}`;

    try {
      const cachedData = await getCache(cacheKey);

      if (cachedData) {
        logger.debug("User cache hit", { key: cacheKey });
        return res.json(cachedData);
      }

      logger.debug("User cache miss", { key: cacheKey });

      const originalJson = res.json.bind(res);
      res.json = (data) => {
        if (res.statusCode === 200) {
          setCache(cacheKey, data, ttl).catch(err =>
            logger.error("User cache set error", { error: err.message })
          );
        }
        return originalJson(data);
      };

      next();
    } catch (err) {
      logger.error("User cache middleware error", { error: err.message });
      next();
    }
  };
}

module.exports = {
  cacheMiddleware,
  cacheUserData,
};