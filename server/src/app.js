<<<<<<< HEAD
// Path: E:\EduQuest\server\src\app.js

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");  // Import auth routes
const courseRoutes = require("./routes/course.routes");  // Import course routes
const badgeRoutes = require("./routes/badge.routes");  // Import badge routes
const quizRoutes = require("./routes/quiz.routes");  // Import quiz routes (added for Day 8)

const app = express();
app.use(cors());  // Enable Cross-Origin Resource Sharing (CORS)
app.use(express.json());  // Parse incoming JSON requests

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "EduQuest API running" });
});

// Register routes
app.use("/api/auth", authRoutes);  // Register auth routes under '/api/auth'
app.use("/api/courses", courseRoutes);  // Register course routes under '/api/courses'
app.use("/api/badges", badgeRoutes);  // Register badge routes under '/api/badges'
app.use("/api/quizzes", quizRoutes);  // Register quiz routes under '/api/quizzes' (added for Day 8)

module.exports = app;  // Export the app to be used in server.js
=======
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "EduQuest API running" });
});

app.use("/api/auth", authRoutes);

module.exports = app;
>>>>>>> 0ad2d58b43f9bd9354ef25eb60d7b8f51ecbfe20
