// Path: E:\EduQuest\server\src\routes\v1\index.js

const express = require("express");
const { deprecationWarning } = require("../version");

// Import existing routes (these become v1)
const authRoutes         = require("../auth.routes");
const userRoutes         = require("../user.routes");
const courseRoutes       = require("../course.routes");
const lessonRoutes       = require("../lesson.routes");
const quizRoutes         = require("../quiz.routes");
const questionRoutes     = require("../question.routes");
const badgeRoutes        = require("../badge.routes");
const notificationRoutes = require("../notification.routes");
const leaderboardRoutes  = require("../leaderboard.routes");
const reviewRoutes       = require("../review.routes");
const certificateRoutes  = require("../certificate.routes");
const instructorRoutes   = require("../instructor.routes");
const adminRoutes        = require("../admin.routes");
const docsRoutes         = require("../docs.routes");
const cacheRoutes        = require("../cache.routes");
const socketRoutes       = require("../socket.routes");
const searchRoutes       = require("../search.routes");

const router = express.Router();

// Add deprecation warning to all v1 routes
router.use(deprecationWarning(
  "API v1 will be sunset on 2027-01-01. Please migrate to v2.",
  "Wed, 01 Jan 2027 00:00:00 GMT"
));

// Mount v1 routes (existing routes)
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/courses", courseRoutes);
router.use("/lessons", lessonRoutes);
router.use("/quizzes", quizRoutes);
router.use("/questions", questionRoutes);
router.use("/badges", badgeRoutes);
router.use("/notifications", notificationRoutes);
router.use("/leaderboard", leaderboardRoutes);
router.use("/reviews", reviewRoutes);
router.use("/certificates", certificateRoutes);
router.use("/instructor", instructorRoutes);
router.use("/admin", adminRoutes);
router.use("/docs", docsRoutes);
router.use("/cache", cacheRoutes);
router.use("/socket", socketRoutes);
router.use("/search", searchRoutes);

module.exports = router;