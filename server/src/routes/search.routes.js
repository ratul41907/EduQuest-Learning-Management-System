// Path: E:\EduQuest\server\src\routes\search.routes.js

const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { cacheMiddleware } = require("../middleware/cache");
const {
  searchCourses,
  searchLessons,
  searchUsers,
  globalSearch,
  getSearchSuggestions,
  getCourseFacets,
  fuzzySearch,
  trackSearch,
  getPopularSearches,
} = require("../services/search.service");

// =========================================
// GET /api/search/courses
// Advanced course search with filters
// =========================================
router.get("/courses", cacheMiddleware(120), async (req, res) => {
  try {
    const { q, ...filters } = req.query;
    
    // Track search
    if (q) trackSearch(q);

    const results = await searchCourses(q, filters);
    return res.json(results);
  } catch (err) {
    return res.status(500).json({
      message: "Error searching courses",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/search/lessons
// Search lessons
// =========================================
router.get("/lessons", cacheMiddleware(120), async (req, res) => {
  try {
    const { q, ...filters } = req.query;
    
    if (q) trackSearch(q);

    const results = await searchLessons(q, filters);
    return res.json(results);
  } catch (err) {
    return res.status(500).json({
      message: "Error searching lessons",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/search/users
// Search users (Admin/Instructor only)
// =========================================
router.get("/users", requireAuth, cacheMiddleware(120), async (req, res) => {
  try {
    if (req.user.role !== "ADMIN" && req.user.role !== "INSTRUCTOR") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { q, ...filters } = req.query;
    
    if (q) trackSearch(q);

    const results = await searchUsers(q, filters);
    return res.json(results);
  } catch (err) {
    return res.status(500).json({
      message: "Error searching users",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/search/global
// Search everything
// =========================================
router.get("/global", cacheMiddleware(60), async (req, res) => {
  try {
    const { q, types, limit } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        message: "Search query must be at least 2 characters",
      });
    }

    trackSearch(q);

    const typeArray = types ? types.split(",") : ["courses", "lessons", "users"];
    const results = await globalSearch(q, { types: typeArray, limit: limit || 5 });

    return res.json(results);
  } catch (err) {
    return res.status(500).json({
      message: "Error performing global search",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/search/suggestions
// Auto-complete suggestions
// =========================================
router.get("/suggestions", async (req, res) => {
  try {
    const { q, limit } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const suggestions = await getSearchSuggestions(q, limit || 10);
    return res.json(suggestions);
  } catch (err) {
    return res.status(500).json({
      message: "Error getting suggestions",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/search/facets
// Get filter facets/counts
// =========================================
router.get("/facets", cacheMiddleware(300), async (req, res) => {
  try {
    const { q } = req.query;
    const facets = await getCourseFacets(q);
    return res.json(facets);
  } catch (err) {
    return res.status(500).json({
      message: "Error getting facets",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/search/fuzzy
// Typo-tolerant fuzzy search
// =========================================
router.get("/fuzzy", cacheMiddleware(120), async (req, res) => {
  try {
    const { q, type = "courses", limit } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        message: "Search query must be at least 2 characters",
      });
    }

    trackSearch(q);

    const results = await fuzzySearch(q, type, { limit: limit || 20 });
    return res.json({
      query: q,
      type,
      total: results.length,
      results,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error performing fuzzy search",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/search/popular
// Get popular search terms
// =========================================
router.get("/popular", cacheMiddleware(300), (req, res) => {
  try {
    const { limit } = req.query;
    const popular = getPopularSearches(limit || 10);
    return res.json({
      total: popular.length,
      searches: popular,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error getting popular searches",
      error: err.message,
    });
  }
});

module.exports = router;