// Path: E:\EduQuest\server\src\routes\version-info.routes.js

const router = require("express").Router();
const packageJson = require("../../package.json");

// =========================================
// GET /api/version
// Get API version information
// =========================================
router.get("/", (req, res) => {
  res.json({
    api: {
      name: "EduQuest API",
      version: packageJson.version || "1.0.0",
      description: "Learning Management System API",
    },
    versions: {
      v1: {
        status: "deprecated",
        sunset: "2027-01-01",
        path: "/api/v1",
        documentation: "/api/v1/docs",
      },
      v2: {
        status: "stable",
        path: "/api/v2",
        documentation: "/api/v2/docs",
        changes: [
          "Improved response format with success/error structure",
          "Enhanced metadata in all responses",
          "Better error codes and messages",
          "Additional stats in user endpoints",
        ],
      },
    },
    defaultVersion: "v2",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;