const express = require("express");
const cors = require("cors");

// Import routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
// DAY 25: Pointing to the file containing completion logic
const lessonRoutes = require("./routes/lesson.routes"); 
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

// Docs shortcut
app.get("/docs", (req, res) => {
  res.json({
    ok: true,
    message: "Open docs at: server/docs/API.md",
  });
});

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// DAY 25: Handles Lesson fetching and Progress Saving
// Path: /api/lessons/:id/complete
app.use("/api/lessons", lessonRoutes); 

app.use("/api/courses", courseRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

module.exports = app;