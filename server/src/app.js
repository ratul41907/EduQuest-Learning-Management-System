// Path: E:\EduQuest\server\src\app.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");

// ── Middleware imports ─────────────────────────────────────
const { logger }      = require("./middleware/logger");
const { rateLimiter } = require("./middleware/rateLimiter");

// ── Route imports ──────────────────────────────────────────
const authRoutes         = require("./routes/auth.routes");
const userRoutes         = require("./routes/user.routes");
const courseRoutes       = require("./routes/course.routes");
const lessonRoutes       = require("./routes/lesson.routes");
const quizRoutes         = require("./routes/quiz.routes");
const questionRoutes     = require("./routes/question.routes");
const badgeRoutes        = require("./routes/badge.routes");
const notificationRoutes = require("./routes/notification.routes");
const leaderboardRoutes  = require("./routes/leaderboard.routes");
const reviewRoutes       = require("./routes/review.routes");
const certificateRoutes  = require("./routes/certificate.routes");
const instructorRoutes   = require("./routes/instructor.routes");

const app = express();

// ── Global middleware ───────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(logger);

// ── Health check ────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "EduQuest API running" });
});

// ── API Routes ──────────────────────────────────────────────
app.use("/api/auth",          rateLimiter(10, 15), authRoutes);
app.use("/api/user",          userRoutes);
app.use("/api/courses",       courseRoutes);
app.use("/api/lessons",       lessonRoutes);
app.use("/api/quizzes",       quizRoutes);
app.use("/api/questions",     questionRoutes);
app.use("/api/badges",        badgeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/leaderboard",   leaderboardRoutes);
app.use("/api/reviews",       reviewRoutes);
app.use("/api/certificates",  certificateRoutes);
app.use("/api/instructor",    instructorRoutes);

// ── 404 handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Global error handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

module.exports = app;