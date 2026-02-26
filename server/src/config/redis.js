// Path: E:\EduQuest\server\src\config\redis.js

const Redis = require("ioredis");
const logger = require("./logger");

// ══════════════════════════════════════════════════════════════
// REDIS CLIENT CONFIGURATION
// ══════════════════════════════════════════════════════════════
const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err) {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});

// ══════════════════════════════════════════════════════════════
// CONNECTION EVENT HANDLERS
// ══════════════════════════════════════════════════════════════
redisClient.on("connect", () => {
  logger.info("Redis client connected");
});

redisClient.on("ready", () => {
  logger.info("Redis client ready");
});

redisClient.on("error", (err) => {
  logger.error("Redis client error", { error: err.message });
});

redisClient.on("close", () => {
  logger.warn("Redis client connection closed");
});

redisClient.on("reconnecting", () => {
  logger.info("Redis client reconnecting");
});

// ══════════════════════════════════════════════════════════════
// CACHE HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} - Parsed JSON data or null
 */
async function getCache(key) {
  try {
    const data = await redisClient.get(key);
    if (!data) return null;
    
    logger.debug("Cache hit", { key });
    return JSON.parse(data);
  } catch (err) {
    logger.error("Cache get error", { key, error: err.message });
    return null;
  }
}

/**
 * Set cached data with TTL
 * @param {string} key - Cache key
 * @param {any} value - Data to cache
 * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
 */
async function setCache(key, value, ttl = 300) {
  try {
    await redisClient.setex(key, ttl, JSON.stringify(value));
    logger.debug("Cache set", { key, ttl });
  } catch (err) {
    logger.error("Cache set error", { key, error: err.message });
  }
}

/**
 * Delete cached data
 * @param {string|string[]} keys - Cache key(s) to delete
 */
async function deleteCache(keys) {
  try {
    if (Array.isArray(keys)) {
      await redisClient.del(...keys);
      logger.debug("Cache deleted", { keys: keys.join(", ") });
    } else {
      await redisClient.del(keys);
      logger.debug("Cache deleted", { key: keys });
    }
  } catch (err) {
    logger.error("Cache delete error", { keys, error: err.message });
  }
}

/**
 * Delete all cached data matching pattern
 * @param {string} pattern - Key pattern (e.g., "courses:*")
 */
async function deleteCachePattern(pattern) {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
      logger.debug("Cache pattern deleted", { pattern, count: keys.length });
    }
  } catch (err) {
    logger.error("Cache pattern delete error", { pattern, error: err.message });
  }
}

/**
 * Check if Redis is connected
 * @returns {boolean}
 */
function isRedisConnected() {
  return redisClient.status === "ready";
}

/**
 * Get cache statistics
 * @returns {Promise<object>}
 */
async function getCacheStats() {
  try {
    const info = await redisClient.info("stats");
    const lines = info.split("\r\n");
    const stats = {};
    
    lines.forEach(line => {
      const [key, value] = line.split(":");
      if (key && value) {
        stats[key] = value;
      }
    });
    
    return {
      hits: parseInt(stats.keyspace_hits || 0),
      misses: parseInt(stats.keyspace_misses || 0),
      hitRate: stats.keyspace_hits 
        ? ((parseInt(stats.keyspace_hits) / (parseInt(stats.keyspace_hits) + parseInt(stats.keyspace_misses))) * 100).toFixed(2) + "%"
        : "0%",
    };
  } catch (err) {
    logger.error("Cache stats error", { error: err.message });
    return { hits: 0, misses: 0, hitRate: "0%" };
  }
}

/**
 * Clear all cache
 */
async function clearAllCache() {
  try {
    await redisClient.flushdb();
    logger.info("All cache cleared");
  } catch (err) {
    logger.error("Cache clear error", { error: err.message });
  }
}

// ══════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ══════════════════════════════════════════════════════════════
async function closeRedis() {
  try {
    await redisClient.quit();
    logger.info("Redis connection closed");
  } catch (err) {
    logger.error("Redis close error", { error: err.message });
  }
}

module.exports = {
  redisClient,
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  isRedisConnected,
  getCacheStats,
  clearAllCache,
  closeRedis,
};