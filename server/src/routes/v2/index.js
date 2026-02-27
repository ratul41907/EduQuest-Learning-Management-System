// Path: E:\EduQuest\server\src\routes\v2\index.js

const express = require("express");
const authRoutes = require("./auth.routes");

// Import other v2 routes as they're created
// For now, we'll use v1 routes for endpoints not yet upgraded
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

// V2 routes (upgraded)
router.use("/auth", authRoutes);

// V1 routes (not yet upgraded - temporary)
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