// Path: E:\EduQuest\server\src\routes\quiz.routes.js

const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

// Level rule: every 100 totalPoints => next level (Level 1 starts at 0)
function calcLevel(totalPoints) {
  return Math.floor((Number(totalPoints) || 0) / 100) + 1;
}

// =========================================
// Day 11: GET /api/quizzes/my/attempts
// Student: view my attempts
// Header: Authorization: Bearer <STUDENT_TOKEN>
// =========================================
router.get("/my/attempts", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;

    const attempts = await prisma.quizAttempt.findMany({
      where: { userId },
      select: {
        id: true,
        quizId: true,
        score: true,
        percent: true,
        passed: true,
        earnedPoints: true,
        createdAt: true,
        quiz: { select: { id: true, title: true, courseId: true, passScore: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(attempts);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching my attempts", error: err.message });
  }
});

// =========================================
// Day 11: GET /api/quizzes/:id/attempts
// Instructor/Admin: attempts for a quiz
// Header: Authorization: Bearer <INSTRUCTOR_OR_ADMIN_TOKEN>
// IMPORTANT: must be above GET "/:id"
// =========================================
router.get("/:id/attempts", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.role !== "INSTRUCTOR" && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const quiz = await prisma.quiz.findUnique({ where: { id } });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId: id },
      select: {
        id: true,
        quizId: true,
        score: true,
        percent: true,
        passed: true,
        earnedPoints: true,
        createdAt: true,
        user: { select: { id: true, fullName: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(attempts);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching quiz attempts", error: err.message });
  }
});

// =========================================
// GET /api/quizzes
// Public: list all quizzes
// =========================================
router.get("/", async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      select: {
        id: true,
        title: true,
        timeLimit: true,
        passScore: true,
        courseId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(quizzes);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching quizzes", error: err.message });
  }
});

// =========================================
// GET /api/quizzes/course/:courseId
// Public: list quizzes of a course
// =========================================
router.get("/course/:courseId", async (req, res) => {
  const { courseId } = req.params;

  try {
    const quizzes = await prisma.quiz.findMany({
      where: { courseId },
      select: {
        id: true,
        title: true,
        timeLimit: true,
        passScore: true,
        courseId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(quizzes);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching quizzes for course", error: err.message });
  }
});

// =========================================
// POST /api/quizzes/:courseId
// Instructor only: create quiz under a course
// Header: Authorization: Bearer <INSTRUCTOR_TOKEN>
// Body: { "title": "...", "timeLimit": 60, "passScore": 50 }
// =========================================
router.post("/:courseId", requireAuth, async (req, res) => {
  const { courseId } = req.params;
  const { title, timeLimit, passScore } = req.body;

  try {
    if (req.user.role !== "INSTRUCTOR") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!title) return res.status(400).json({ message: "title is required" });

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const quiz = await prisma.quiz.create({
      data: {
        title,
        timeLimit: timeLimit != null ? Number(timeLimit) : null,
        passScore: passScore != null ? Number(passScore) : 50,
        courseId,
      },
    });

    return res.status(201).json(quiz);
  } catch (err) {
    return res.status(500).json({ message: "Error creating quiz", error: err.message });
  }
});

// =========================================
// DAY 12 + DAY 13
// POST /api/quizzes/:id/attempt
// Student: submit answers, create attempt, update user totalPoints + level
// Day 13: award FIRST_QUIZ badge on user's first attempt ever
// Header: Authorization: Bearer <STUDENT_TOKEN>
// Body: { "answers": ["A","B","C"] }
// =========================================
router.post("/:id/attempt", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;

  try {
    // Only STUDENT can attempt
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Only students can attempt quizzes" });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "answers must be an array" });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (!quiz.questions || quiz.questions.length === 0) {
      return res.status(400).json({ message: "Quiz has no questions yet" });
    }

    let score = 0;
    let totalPoints = 0;

    quiz.questions.forEach((q, index) => {
      totalPoints += q.points;
      const userAnswer = answers[index] ? String(answers[index]).toUpperCase() : null;
      if (userAnswer && userAnswer === String(q.correct).toUpperCase()) {
        score += q.points;
      }
    });

    const percent = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const passed = percent >= quiz.passScore;
    const earnedPoints = score;
    const userId = req.user.sub;

    // 1) create attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId: id,
        score,
        percent,
        passed,
        earnedPoints,
      },
      select: {
        id: true,
        userId: true,
        quizId: true,
        score: true,
        percent: true,
        passed: true,
        earnedPoints: true,
        createdAt: true,
      },
    });

    // ================================
    // DAY 13: Award FIRST_QUIZ badge
    // Award once, on user's first quiz attempt ever
    // ================================
    const firstQuizBadge = await prisma.badge.upsert({
      where: { code: "FIRST_QUIZ" },
      update: {},
      create: {
        code: "FIRST_QUIZ",
        name: "First Quiz",
        description: "Completed your first quiz attempt.",
        pointsBonus: 0,
      },
    });

    const attemptCount = await prisma.quizAttempt.count({
      where: { userId },
    });

    if (attemptCount === 1) {
      await prisma.userBadge.upsert({
        where: {
          userId_badgeId: {
            userId,
            badgeId: firstQuizBadge.id,
          },
        },
        update: {},
        create: {
          userId,
          badgeId: firstQuizBadge.id,
        },
      });
    }

    // 2) update user totalPoints
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: { increment: earnedPoints },
      },
      select: { id: true, fullName: true, totalPoints: true, level: true },
    });

    // 3) update level if needed
    const newLevel = calcLevel(updatedUser.totalPoints);
    let finalUser = updatedUser;

    if (updatedUser.level !== newLevel) {
      finalUser = await prisma.user.update({
        where: { id: userId },
        data: { level: newLevel },
        select: { id: true, fullName: true, totalPoints: true, level: true },
      });
    }

    return res.status(201).json({
      attempt,
      userProgress: finalUser,
      badgeAwarded: attemptCount === 1 ? "FIRST_QUIZ" : null,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error submitting quiz attempt", error: err.message });
  }
});

// =========================================
// GET /api/quizzes/:id
// Public: quiz details (includes questions)
// =========================================
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    return res.json(quiz);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching quiz", error: err.message });
  }
});

// =========================================
// PATCH /api/quizzes/:id
// Instructor only: update quiz
// =========================================
router.patch("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.role !== "INSTRUCTOR") return res.status(403).json({ message: "Access denied" });

    const updated = await prisma.quiz.update({
      where: { id },
      data: req.body,
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Error updating quiz", error: err.message });
  }
});

// =========================================
// DELETE /api/quizzes/:id
// Instructor only: delete quiz
// =========================================
router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.role !== "INSTRUCTOR") return res.status(403).json({ message: "Access denied" });

    await prisma.quiz.delete({ where: { id } });
    return res.json({ message: "Quiz deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting quiz", error: err.message });
  }
});

module.exports = router;
