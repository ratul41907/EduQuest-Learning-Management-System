// Path: E:\EduQuest\server\src\routes\quiz.routes.js

const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate"); // NEW Day 7

// Level rule: every 100 totalPoints => next level (Level 1 starts at 0)
function calcLevel(totalPoints) {
  return Math.floor((Number(totalPoints) || 0) / 100) + 1;
}

// =========================================
// GET /api/quizzes/my/attempts
// Student: view my attempts
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
        quiz: {
          select: {
            id: true,
            title: true,
            courseId: true,
            passScore: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(attempts);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching my attempts", error: err.message });
  }
});

// =========================================
// GET /api/quizzes/:id/attempts
// Instructor/Admin: attempts for a specific quiz
// IMPORTANT: must stay above GET "/:id"
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
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
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
// Public: list quizzes for a course
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
// UPDATED Day 7: validate middleware added
// =========================================
router.post(
  "/:courseId",
  requireAuth,
  validate({
    title: "required|min:3|max:200",
  }),
  async (req, res) => {
    const { courseId } = req.params;
    const { title, timeLimit, passScore } = req.body;

    try {
      if (req.user.role !== "INSTRUCTOR") {
        return res.status(403).json({ message: "Access denied" });
      }

      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) return res.status(404).json({ message: "Course not found" });

      // Validate passScore range if provided
      if (passScore != null) {
        const ps = Number(passScore);
        if (isNaN(ps) || ps < 0 || ps > 100) {
          return res.status(400).json({ message: "passScore must be between 0 and 100" });
        }
      }

      // Validate timeLimit if provided
      if (timeLimit != null) {
        const tl = Number(timeLimit);
        if (isNaN(tl) || tl < 1) {
          return res.status(400).json({ message: "timeLimit must be a positive number (minutes)" });
        }
      }

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
  }
);

// =========================================
// POST /api/quizzes/:id/attempt
// Student: submit answers, score quiz,
// award points + badges (FIRST_QUIZ, PERFECT_SCORE)
// =========================================
router.post("/:id/attempt", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;

  try {
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

    // ── Score calculation ──────────────────────────────────
    let score = 0;
    let totalPoints = 0;

    quiz.questions.forEach((q, index) => {
      totalPoints += q.points;
      const userAnswer = answers[index]
        ? String(answers[index]).toUpperCase()
        : null;
      if (userAnswer && userAnswer === String(q.correct).toUpperCase()) {
        score += q.points;
      }
    });

    const percent = totalPoints > 0
      ? Math.round((score / totalPoints) * 100)
      : 0;
    const passed = percent >= quiz.passScore;
    const earnedPoints = score;
    const userId = req.user.sub;

    // ── Check if this is user's first ever quiz attempt ────
    const previousAttemptCount = await prisma.quizAttempt.count({
      where: { userId },
    });
    const isFirstAttempt = previousAttemptCount === 0;

    // ── Create attempt record ──────────────────────────────
    const attempt = await prisma.quizAttempt.create({
      data: { userId, quizId: id, score, percent, passed, earnedPoints },
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

    // ── Update user totalPoints ────────────────────────────
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { totalPoints: { increment: earnedPoints } },
      select: { id: true, fullName: true, totalPoints: true, level: true },
    });

    // ── Update level if needed ─────────────────────────────
    const newLevel = calcLevel(updatedUser.totalPoints);
    let finalUser = updatedUser;

    if (updatedUser.level !== newLevel) {
      finalUser = await prisma.user.update({
        where: { id: userId },
        data: { level: newLevel },
        select: { id: true, fullName: true, totalPoints: true, level: true },
      });
    }

    // ── Badge awarding ─────────────────────────────────────
    const badgesAwarded = [];

    // FIRST_QUIZ — only on their very first attempt ever
    if (isFirstAttempt) {
      const badge = await prisma.badge.findUnique({ where: { code: "FIRST_QUIZ" } });
      if (badge) {
        await prisma.userBadge
          .upsert({
            where: { userId_badgeId: { userId, badgeId: badge.id } },
            update: {},
            create: { userId, badgeId: badge.id },
          })
          .catch(() => {});
        badgesAwarded.push("FIRST_QUIZ");

        await prisma.notification.create({
          data: {
            userId,
            type: "BADGE_EARNED",
            title: "Badge Earned: Quiz Starter!",
            message: "You completed your first quiz. Keep it up!",
          },
        }).catch(() => {});
      }
    }

    // PERFECT_SCORE — awarded once per user
    if (percent === 100) {
      const badge = await prisma.badge.findUnique({ where: { code: "PERFECT_SCORE" } });
      if (badge) {
        await prisma.userBadge
          .upsert({
            where: { userId_badgeId: { userId, badgeId: badge.id } },
            update: {},
            create: { userId, badgeId: badge.id },
          })
          .then(() => {})
          .catch(() => {});

        if (!badgesAwarded.includes("PERFECT_SCORE")) {
          badgesAwarded.push("PERFECT_SCORE");

          await prisma.notification.create({
            data: {
              userId,
              type: "BADGE_EARNED",
              title: "Badge Earned: Perfect Score!",
              message: `You scored 100% on "${quiz.title}". Incredible!`,
            },
          }).catch(() => {});
        }
      }
    }

    return res.status(201).json({
      attempt,
      userProgress: finalUser,
      badgesAwarded,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error submitting quiz attempt",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/quizzes/:id
// Public: quiz details with questions
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
// Instructor only: update quiz metadata
// =========================================
router.patch("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.role !== "INSTRUCTOR") {
      return res.status(403).json({ message: "Access denied" });
    }

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
    if (req.user.role !== "INSTRUCTOR") {
      return res.status(403).json({ message: "Access denied" });
    }

    await prisma.quiz.delete({ where: { id } });
    return res.json({ message: "Quiz deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting quiz", error: err.message });
  }
});

module.exports = router;