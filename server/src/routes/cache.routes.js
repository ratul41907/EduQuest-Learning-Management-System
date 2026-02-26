// Path: E:\EduQuest\server\src\routes\cache.routes.js

const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { 
  getCacheStats, 
  clearAllCache, 
  isRedisConnected,
  redisClient 
} = require("../config/redis");

// =========================================
// GET /api/cache/stats
// Get cache statistics (Admin only)
// =========================================
router.get("/stats", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin only" });
    }

    if (!isRedisConnected()) {
      return res.status(503).json({ 
        message: "Redis not connected",
        connected: false,
      });
    }

    const stats = await getCacheStats();
    const dbSize = await redisClient.dbsize();

    return res.json({
      connected: true,
      keys: dbSize,
      ...stats,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching cache stats",
      error: err.message,
    });
  }
});

// =========================================
// DELETE /api/cache/clear
// Clear all cache (Admin only)
// =========================================
router.delete("/clear", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin only" });
    }

    if (!isRedisConnected()) {
      return res.status(503).json({ 
        message: "Redis not connected" 
      });
    }

    await clearAllCache();

    return res.json({ 
      message: "All cache cleared successfully" 
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error clearing cache",
      error: err.message,
    });
  }
});

module.exports = router;