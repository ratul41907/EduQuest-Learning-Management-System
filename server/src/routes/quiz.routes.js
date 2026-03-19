// Path: E:\EduQuest\server\src\routes\quiz.routes.js

const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { sendBadgeEmail } = require("../utils/email");

function calcLevel(totalPoints) {
  return Math.floor((Number(totalPoints) || 0) / 100) + 1;
}

// =========================================
// POST /api/quizzes - Create new quiz (for frontend compatibility)
// =========================================
router.post("/", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "INSTRUCTOR") {
      return res.status(403).json({ message: "Instructor only" });
    }

    const { courseId, title, description, passingScore, timeLimit, questions } = req.body;

    if (!courseId || !title) {
      return res.status(400).json({ message: "Missing required fields: courseId, title" });
    }

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.instructorId !== req.user.sub) {
      return res.status(403).json({ message: "You do not own this course" });
    }

    // Create quiz
    const quiz = await prisma.quiz.create({
      data: {
        courseId,
        title,
        description: description || null,
        passScore: passingScore ? Number(passingScore) : 70,
        timeLimit: timeLimit ? Number(timeLimit) : 30,
      },
    });

    // Create questions if provided
    if (questions && Array.isArray(questions) && questions.length > 0) {
      await prisma.question.createMany({
        data: questions.map((q, index) => ({
          quizId: quiz.id,
          questionText: q.questionText,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correct: q.correctAnswer,
          points: 10,
          orderNo: index + 1,
        })),
      });
    }

    // Fetch quiz with questions
    const quizWithQuestions = await prisma.quiz.findUnique({
      where: { id: quiz.id },
      include: { questions: true },
    });

    return res.status(201).json({ message: "Quiz created successfully", quiz: quizWithQuestions });
} catch (error) {
    console.error('========== QUIZ CREATION ERROR ==========');
    console.error('Full error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('========================================');
    return res.status(500).json({ message: "Failed to create quiz", error: error.message });
  }
});

// =========================================
// GET /api/quizzes
// =========================================
router.get("/", async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      select: { id: true, title: true, description: true, timeLimit: true, passScore: true, courseId: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(quizzes);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching quizzes", error: err.message });
  }
});

// =========================================
// GET /api/quizzes/course/:courseId
// =========================================
router.get("/course/:courseId", async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { courseId: req.params.courseId },
      include: {
        questions: true,
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(quizzes);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching quizzes for course", error: err.message });
  }
});

// =========================================
// POST /api/quizzes/:courseId (old format - keep for backward compatibility)
// =========================================
router.post("/:courseId", requireAuth, validate({ title: "required|min:3|max:200" }), async (req, res) => {
  const { courseId } = req.params;
  const { title, timeLimit, passScore } = req.body;
  try {
    if (req.user.role !== "INSTRUCTOR") return res.status(403).json({ message: "Access denied" });

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (passScore != null) {
      const ps = Number(passScore);
      if (isNaN(ps) || ps < 0 || ps > 100) return res.status(400).json({ message: "passScore must be between 0 and 100" });
    }
    if (timeLimit != null) {
      const tl = Number(timeLimit);
      if (isNaN(tl) || tl < 1) return res.status(400).json({ message: "timeLimit must be a positive number (minutes)" });
    }

    const quiz = await prisma.quiz.create({
      data: { title, timeLimit: timeLimit != null ? Number(timeLimit) : null, passScore: passScore != null ? Number(passScore) : 50, courseId },
    });
    return res.status(201).json(quiz);
  } catch (err) {
    return res.status(500).json({ message: "Error creating quiz", error: err.message });
  }
});

// =========================================
// POST /api/quizzes/:id/attempt
// =========================================
router.post("/:id/attempt", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;

  try {
    if (req.user.role !== "STUDENT") return res.status(403).json({ message: "Only students can attempt quizzes" });
    if (!answers || !Array.isArray(answers)) return res.status(400).json({ message: "answers must be an array" });

    const quiz = await prisma.quiz.findUnique({ where: { id }, include: { questions: true } });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (!quiz.questions || quiz.questions.length === 0) return res.status(400).json({ message: "Quiz has no questions yet" });

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;

    // Check each answer
    answers.forEach((answerObj) => {
      const question = quiz.questions.find(q => q.id === answerObj.questionId);
      if (question && answerObj.answer === question.correct) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / totalQuestions) * 100);
    const passed = percent >= quiz.passScore;
    const earnedPoints = passed ? correctCount * 10 : 0;
    const userId = req.user.sub;

    const previousAttemptCount = await prisma.quizAttempt.count({ where: { userId } });
    const isFirstAttempt = previousAttemptCount === 0;

    const attempt = await prisma.quizAttempt.create({
      data: { 
        userId, 
        quizId: id, 
        score: percent, 
        percent, 
        passed, 
        earnedPoints,
        answers: JSON.stringify(answers),
      },
      select: { id: true, userId: true, quizId: true, score: true, percent: true, passed: true, earnedPoints: true, createdAt: true },
    });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { totalPoints: { increment: earnedPoints } },
      select: { id: true, fullName: true, totalPoints: true, level: true, email: true },
    });

    const newLevel = calcLevel(updatedUser.totalPoints);
    let finalUser = updatedUser;
    if (updatedUser.level !== newLevel) {
      finalUser = await prisma.user.update({
        where: { id: userId },
        data: { level: newLevel },
        select: { id: true, fullName: true, totalPoints: true, level: true, email: true },
      });
    }

    const badgesAwarded = [];

    if (isFirstAttempt) {
      const badge = await prisma.badge.findUnique({ where: { code: "FIRST_QUIZ" } });
      if (badge) {
        await prisma.userBadge.upsert({ where: { userId_badgeId: { userId, badgeId: badge.id } }, update: {}, create: { userId, badgeId: badge.id } }).catch(() => {});
        badgesAwarded.push("FIRST_QUIZ");

        await prisma.notification.create({
          data: { userId, type: "BADGE_EARNED", title: "Badge Earned: Quiz Starter!", message: "You completed your first quiz. Keep it up!" },
        }).catch(() => {});

        sendBadgeEmail(
          finalUser.email,
          finalUser.fullName,
          badge.name,
          badge.description
        ).catch(err => console.error("Badge email failed:", err));
      }
    }

    if (percent === 100) {
      const badge = await prisma.badge.findUnique({ where: { code: "PERFECT_SCORE" } });
      if (badge) {
        await prisma.userBadge.upsert({ where: { userId_badgeId: { userId, badgeId: badge.id } }, update: {}, create: { userId, badgeId: badge.id } }).catch(() => {});

        if (!badgesAwarded.includes("PERFECT_SCORE")) {
          badgesAwarded.push("PERFECT_SCORE");

          await prisma.notification.create({
            data: { userId, type: "BADGE_EARNED", title: "Badge Earned: Perfect Score!", message: `You scored 100% on "${quiz.title}". Incredible!` },
          }).catch(() => {});

          sendBadgeEmail(
            finalUser.email,
            finalUser.fullName,
            badge.name,
            badge.description
          ).catch(err => console.error("Badge email failed:", err));
        }
      }
    }

    const { email: _email, ...userProgress } = finalUser;

    return res.status(201).json({ attempt, userProgress, badgesAwarded, correctAnswers: correctCount });
  } catch (err) {
    return res.status(500).json({ message: "Error submitting quiz attempt", error: err.message });
  }
});

// =========================================
// GET /api/quizzes/:id
// =========================================
router.get("/:id", async (req, res) => {
  try {
    const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id }, include: { questions: true } });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    return res.json(quiz);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching quiz", error: err.message });
  }
});

// =========================================
// PATCH /api/quizzes/:id
// =========================================
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "INSTRUCTOR") return res.status(403).json({ message: "Access denied" });
    const updated = await prisma.quiz.update({ where: { id: req.params.id }, data: req.body });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Error updating quiz", error: err.message });
  }
});

// =========================================
// DELETE /api/quizzes/:id
// =========================================
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "INSTRUCTOR") return res.status(403).json({ message: "Access denied" });
    
    // Delete all questions first
    await prisma.question.deleteMany({ where: { quizId: req.params.id } });
    
    // Delete quiz attempts
    await prisma.quizAttempt.deleteMany({ where: { quizId: req.params.id } });
    
    // Delete quiz
    await prisma.quiz.delete({ where: { id: req.params.id } });
    
    return res.json({ message: "Quiz deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting quiz", error: err.message });
  }
});

module.exports = router;