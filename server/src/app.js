// Path: E:\EduQuest\server\src\app.js

const express = require("express");
const cors = require("cors");

// Import routes
const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const badgeRoutes = require("./routes/badge.routes");
const quizRoutes = require("./routes/quiz.routes");
const questionRoutes = require("./routes/question.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "EduQuest API running" });
});

// =========================================
// DAY 14: Docs shortcut endpoint
// =========================================
app.get("/docs", (req, res) => {
  res.json({
    ok: true,
    message: "Open docs at: server/docs/API.md",
  });
});

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// Export the app to be used in server.js
module.exports = app;